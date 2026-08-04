## Context

El diseñador web crea órdenes guest (`POST /api/orders`, `storeId: null`, `PENDING`) y hoy solo ofrece transferencia manual vía `lib/payment-details.ts` (alias/CVU). Los precios de catálogo CMS son el valor de transferencia; el envío se suma según método. Emails de reserva asumen siempre datos bancarios. La tabla `Order` es compartida con `tikkiguau-tiendas` (fuera de alcance de código).

Este change introduce Checkout Pro (redirección / Wallet Brick), recargo del 10% sobre productos + envío, webhooks y auto-`APPROVED` al pagar, manteniendo transferencia como alternativa.

## Goals / Non-Goals

**Goals:**

- Permitir elegir **Transferencia** o **Mercado Pago** en el checkout del diseñador.
- Cobrar `base = productos + envío`; si MP → `total = base × 1.10` (recargo 10%).
- Integrar Checkout Pro: preferencia server-side + Wallet Brick + webhooks firmados.
- Al pago `approved`, pasar la orden a `APPROVED` y disparar el email de aprobado (misma allowlist / helper que el CMS).
- Extender `Order` de forma compatible con tiendas (defaults / nullables).
- Actualizar emails y CMS para método y estado de pago.

**Non-Goals:**

- Checkout transparente / Bricks de tarjeta embebidos.
- Neto post-comisión MP en CMS.
- Cambiar precios de catálogo CMS.
- Código en `tikkiguau-tiendas`.
- Eliminar transferencia.

## Decisions

### 1. Checkout Pro + Wallet Brick

**Decisión:** SDK `mercadopago` en backend para Preferences; `@mercadopago/sdk-react` (`Wallet`) en frontend con `preferenceId`. Credenciales: `MP_ACCESS_TOKEN` (server), `MP_PUBLIC_KEY` (client, `NEXT_PUBLIC_MP_PUBLIC_KEY`), `MP_WEBHOOK_SECRET` para validar firmas.

**Alternativa descartada:** solo `init_point` redirect sin Brick — peor UX y sin botón oficial. Checkout API — más esfuerzo, fuera de scope.

### 2. Modelo de montos en `Order`

**Decisión:** extender `Order` con:

| Campo | Tipo | Notas |
|-------|------|--------|
| `paymentMethod` | enum `TRANSFER` \| `MERCADOPAGO` | default `TRANSFER` (órdenes viejas / tiendas) |
| `paymentStatus` | enum `NOT_REQUIRED` \| `PENDING` \| `APPROVED` \| `REJECTED` \| `REFUNDED` | default `NOT_REQUIRED` |
| `paymentSurchargeAmount` | `Float` | 0 en transferencia; 10% del base en MP |
| `mpPreferenceId` | `String?` | |
| `mpPaymentId` | `String?` | |
| `totalAmount` | existente | **monto a cobrar** (base + recargo) |

El desglose productos/envío sigue derivable del snapshot `orderItems` + catálogo al momento de crear; no es obligatorio persistir `shippingAmount` en v1 si el create recalcula y valida.

**Semántica:** precios CMS = transferencia. Recargo NO es precio de catálogo.

### 3. Recálculo server-side del total

**Decisión:** `POST /api/orders` MUST recalcular productos + envío desde catálogo vigente + aplicar recargo según `paymentMethod`. Rechazar si el `totalAmount` del cliente no coincide (tolerancia 0 ARS enteros). Cierra el hueco actual donde el cliente enviaba el total.

**Alternativa descartada:** confiar en el cliente — inaceptable con pasarela.

### 4. Flujo UI

**Decisión:** tras entrega, paso (o sección en revisión) de **método de pago** mostrando:

- Transferencia: total = base; copy de ahorro vs MP.
- Mercado Pago: total = base + 10%; explicación breve del recargo.

Al confirmar:

1. Crear orden (`PENDING`).
2. Si `TRANSFER` → `paymentStatus = NOT_REQUIRED`; UI/email con alias/CVU (como hoy).
3. Si `MERCADOPAGO` → `paymentStatus = PENDING`; crear preferencia (`external_reference = orderNumber`); devolver `preferenceId`; renderizar `<Wallet />`; `back_urls` a rutas públicas de resultado (`/pago/success|failure|pending`) con `auto_return: approved`.

WhatsApp sigue para consultas; comprobante WhatsApp solo relevante en transferencia.

### 5. Acreditación de pago (webhooks + fallback)

**Decisión:** usar Webhooks del panel + `notification_url` en la preferencia. El sync en `/pago/success` queda como fallback si el usuario vuelve antes de que llegue el webhook.

1. Panel Webhooks (Tus integraciones): URL `{NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`, tópico **Pagos** (`payment`), guardar y copiar secret a `MP_WEBHOOK_SECRET`.
2. Preferencia: `notification_url` al mismo endpoint (prioridad sobre panel si ambas existen; mismo handler).
3. Endpoint valida firma con `WebhookSignatureValidator` cuando hay secret; consulta Payment API; sync idempotente → `paymentStatus` + auto-`APPROVED` + email.
4. `/pago/success` también sincroniza (idempotente; no reenvía email si ya se aprobó por webhook).

### 6. Emails

**Decisión:**

- **Cliente reserva + TRANSFER:** igual que hoy (alias/CVU + total base).
- **Cliente reserva + MP:** sin datos bancarios; indica pago online, total con recargo, y que al acreditarse recibirá confirmación.
- **Melizza pedido nuevo:** incluye `paymentMethod`, total, y si MP → “pago pendiente / online”.
- **APPROVED** (sync back_urls / notification_url / CMS): sin cambio de templates de estado, salvo copy menor si hace falta.

Reenvío `PENDING` MUST respetar el método de la orden.

### 7. CMS

**Decisión:** listado/detalle muestran método de pago, estado de pago e IDs MP (si hay). Sin estimado de neto post-fee. Melizza puede seguir cambiando `OrderStatus` manualmente.

### 8. Redondeo del 10%

**Decisión:** `surcharge = Math.round(base * 0.10)` en enteros ARS (alineado a precios CMS enteros). Constante única en `lib/orders/payment-pricing.ts` (o similar).

### 9. Capas (orden de implementación)

Prisma schema + migrate → `lib/env` + SDKs → pricing helpers → API orders + preference + sync/webhook → designer UI → emails → CMS → docs/env example.

## Risks / Trade-offs

- **[Schema compartido]** → columnas con default; no tocar código de tiendas; smoke-check que Prisma client de tiendas no rompa en runtime si no regeneran de inmediato (mismo DB, columnas nuevas ignoradas por queries viejas).
- **[Panel Webhooks falla al guardar]** → mitigado con `notification_url` + sync en `back_urls`.
- **[Pago pending offline]** → orden queda `PENDING` hasta acreditación; copy claro en UI/email.
- **[Doble APPROVED email]** → guard por transición real `PENDING→APPROVED` + idempotencia.
- **[Cliente abandona Wallet]** → orden `PENDING` + `paymentStatus PENDING`; Melizza la ve; MAY rechazar a mano (ops, no automatizado en v1).
- **[back_urls sin localhost]** → `NEXT_PUBLIC_APP_URL` debe ser HTTPS público (ngrok en test / dominio en prod).

## Migration Plan

1. Migración Prisma additive (enums + columnas con default).
2. Deploy web con env MP de **test** + `NEXT_PUBLIC_APP_URL` pública; homologar Checkout Pro.
3. Configurar panel Webhooks + `MP_WEBHOOK_SECRET`; homologar Checkout Pro con ngrok.
4. Rollback: `MP_CHECKOUT_ENABLED` / `NEXT_PUBLIC_MP_CHECKOUT_ENABLED=false` oculta MP y fuerza transferencia; columnas pueden quedar.

## Open Questions

_(ninguna bloqueante — supuestos confirmados con el stakeholder)_

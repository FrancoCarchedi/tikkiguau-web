## Context

El diseñador web crea órdenes con `POST /api/orders` (`storeId: null`, estado `PENDING`). La UI de confirmación (`ConfirmationStep`) ya muestra Alias, CVU y titular de Mercado Pago desde `lib/payment-details.ts`, más el total (productos + envío) y el CTA de WhatsApp solo para consultas. El admin actualiza `status` y `trackingCode` vía `PATCH /api/orders/[id]`.

Hoy no hay envío de email en `tikkiguau-web`. En `tikkiguau-tiendas` existe un stub `lib/resend.ts` sin uso; **no se reutiliza en este change** (alcance solo web).

## Goals / Non-Goals

**Goals:**

- Confirmar la reserva por email al cliente con los mismos datos de pago que ve en pantalla.
- Avisar a Melizza de cada pedido web nuevo.
- Notificar al cliente al pasar a `APPROVED`, `REJECTED` o `DELIVERED` **solo en transiciones lógicas hacia adelante** (ver decisión 4).
- Permitir a Melizza **reenviar manualmente** el email del estado actual desde el detalle de orden en el CMS.
- Fallo de email no debe impedir crear/actualizar la orden (best-effort + log).

**Non-goals:**

- Tiendas, marketing email, colas externas, webhooks de Resend en v1.

## Decisions

### 1. Resend + React Email

**Decisión:** SDK `resend` para el envío; templates en React con `@react-email/components` (y render a HTML en el servidor).

**Alternativa descartada:** HTML string suelto — peor mantenibilidad y sin preview local cómodo.

### 2. Cinco templates, un módulo de envío

**Decisión:**

| Template | Trigger automático | To |
|----------|-------------------|-----|
| `OrderReservationCustomerEmail` | `POST /api/orders` éxito | `order.email` |
| `OrderReservationOwnerEmail` | mismo | `ORDER_NOTIFY_EMAIL` |
| `OrderStatusApprovedEmail` | PATCH con transición permitida → `APPROVED` | `order.email` (si `PICKUP`, avisa coordinación por WhatsApp sin dirección) |
| `OrderStatusRejectedEmail` | PATCH con transición permitida → `REJECTED` | `order.email` |
| `OrderStatusDeliveredEmail` | PATCH con transición permitida → `DELIVERED` | `order.email` (+ `trackingCode` si hay) |

El mismo set de templates de cliente se reutiliza en el **reenvío manual** desde el CMS (según el `status` actual).

Helpers en `lib/email/send-order-emails.ts` (nombres orientativos) invocados desde las rutas API.

**Alternativa descartada:** un solo template genérico con `if` de estado — más frágil en copy y testing.

### 3. Best-effort en el request

**Decisión:** Tras persistir la orden / el update, intentar `resend.emails.send`. Si falla, `console.error` y la API responde 201/200 igual. El cliente ya ve la confirmación en UI.

**Alternativa descartada:** fallar el POST si el email falla — peor UX (reserva perdida o reintento confuso).

**Alternativa diferida:** cola (Inngest/QStash) — overkill para v1; se puede agregar si hay timeouts en Vercel.

### 4. Auto-email solo en transiciones lógicas (hacia adelante)

**Decisión:** El auto-envío al cliente por cambio de estado ocurre **solo** si `previousStatus !== nextStatus` **y** la transición está en la lista permitida. Cambiar solo `trackingCode` no dispara email.

**Transiciones que SÍ envían email automático:**

| Desde | Hacia | Email |
|-------|-------|--------|
| `PENDING` | `APPROVED` | aprobado |
| `PENDING` | `REJECTED` | rechazado |
| `PENDING` | `DELIVERED` | entregado (salto permitido; ops) |
| `APPROVED` | `DELIVERED` | entregado |
| `APPROVED` | `REJECTED` | rechazado (cancelación post-aprobación) |

**Transiciones que NO envían email automático** (ejemplos): `APPROVED`→`PENDING`, `DELIVERED`→cualquier anterior, `REJECTED`→cualquier otro, o re-PATCH al mismo status. El admin **puede** igual persistir ese cambio de status en el CMS (corrección operativa); simplemente no hay mail automático. Si necesita avisar al cliente, usa el reenvío manual.

**Alternativa descartada:** bloquear en UI/API los cambios “hacia atrás” — demasiado rígido si Melizza necesita corregir un click erróneo.

### 4b. Reenvío manual desde el CMS

**Decisión:** En el detalle de orden (`order-detail-sheet`) un botón **"Reenviar email con el último estado"** (admin autenticado) llama p. ej. `POST /api/orders/[id]/resend-email` y envía **solo al cliente** el template que corresponde al `status` actual:

| Status actual | Email reenviado |
|---------------|-----------------|
| `PENDING` | confirmación de reserva (con Mercado Pago) |
| `APPROVED` | pedido aprobado |
| `REJECTED` | pedido rechazado |
| `DELIVERED` | pedido entregado (+ tracking si hay) |

No reenvía el aviso a Melizza. Feedback con toast éxito/error; envío best-effort (la orden no se modifica).

### 5. Datos de pago centralizados

**Decisión:** Reutilizar `MERCADO_PAGO_PAYMENT` y `WHATSAPP_URL` de `lib/payment-details.ts` en el template de confirmación al cliente. No duplicar Alias/CVU en env.

### 6. Env y dominio

**Decisión:** Extender `lib/env.ts` con:

- `RESEND_API_KEY` (required en runtime de envío; en build puede validarse como string no vacío)
- `EMAIL_FROM` (ej. `TikkiGuau <pedidos@tikkiguau.com>`)
- `ORDER_NOTIFY_EMAIL` (inbox Melizza)

Dominio verificado en Resend (DNS SPF/DKIM) es prerequisito de producción; en local se usa el dominio de test de Resend.

### 7. Alcance de órdenes

**Decisión:** Enviar emails para **todas** las órdenes creadas por `POST /api/orders` de web (hoy siempre `storeId: null`). No filtrar por origen adicional. Órdenes de tiendas no pasan por esta ruta.

## Architecture (capa)

```
POST /api/orders
  → prisma.order.create
  → sendReservationEmails(order)  // customer + owner, parallel Promise.allSettled
  → 201 { id, orderNumber }

PATCH /api/orders/[id]
  → leer orden previa
  → prisma.order.update
  → si transición de status está en allowlist → sendStatusEmail(order)
  → 200 order

POST /api/orders/[id]/resend-email  (admin)
  → leer orden
  → sendCustomerEmailForCurrentStatus(order)  // best-effort
  → 200 { ok: true } | 502 si Resend falla (opcional: 200 + warning)
```

```
emails/
  order-reservation-customer.tsx
  order-reservation-owner.tsx
  order-status-approved.tsx
  order-status-rejected.tsx
  order-status-delivered.tsx
lib/
  resend.ts
  email/
    render-and-send.ts   // render React Email → resend.emails.send
    send-order-emails.ts
```

## Risks / Trade-offs

- **[Timeout Vercel]** → dos envíos en serie pueden sumar latencia; usar `Promise.allSettled` y mantener templates livianos.
- **[Deliverability]** → sin dominio verificado los mails no llegan a clientes reales; documentar setup DNS en tasks.
- **[Transiciones hacia atrás]** → no auto-email; Melizza puede corregir el status y usar “Reenviar email…” si hace falta avisar.
- **[Reenvío duplicado]** → el botón manual puede reenviar el mismo mail varias veces (intencional: recuperación si el cliente no lo recibió).
- **[Contenido sensible]** → CVU/alias en email es intencional (igual que en UI).

## Migration / Rollout

1. Instalar deps, env locales, templates.
2. Cablear POST y PATCH.
3. Verificar dominio en Resend (prod).
4. Smoke: crear orden → 2 emails; transiciones allowlist → emails; transición hacia atrás → sin email; botón reenviar → email del status actual.
5. Actualizar docs de negocio (pago visible en UI + email; WhatsApp = consultas/comprobante).

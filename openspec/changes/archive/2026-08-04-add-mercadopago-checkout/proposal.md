## Why

Hoy el sitio solo admite transferencia directa (alias/CVU): el cliente reserva, ve los datos bancarios y envía el comprobante por WhatsApp. Melizza quiere ofrecer cobro online con Mercado Pago (dinero en cuenta, débito o crédito) con disponibilidad inmediata del dinero, y cubrir la comisión de la plataforma (~6,45% + IVA ≈ 7,80% efectivo) con un recargo transparente al cliente. Sin pasarela, no hay confirmación automática de pago ni experience de checkout moderna.

## What Changes

- Agregar **Checkout Pro** de Mercado Pago como método de pago online en el diseñador web, **sin eliminar** la transferencia directa (el cliente elige).
- Aplicar un **recargo del 10%** sobre el total del pedido (productos + envío) cuando el método sea Mercado Pago.
- Crear preferencia de pago en backend, redirigir/abrir Wallet Brick, y procesar **webhooks** de pago.
- Al recibir pago `approved`, la orden pasa automáticamente a `APPROVED` (Melizza fabrica/envía sin confirmar comprobante).
- Persistir método de pago, montos (base, recargo, total cobrado) e IDs de Mercado Pago en la orden.
- Actualizar emails de reserva/aviso según método (transferencia vs Checkout Pro).
- Mostrar en CMS el método de pago y estado de pago de cada orden.
- Credenciales MP vía env (`MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, webhook secret).
- **BD compartida:** sí se extiende el modelo `Order` (columnas nuevas / enums); `tikkiguau-tiendas` queda **fuera de alcance** de código (las columnas nuevas deben ser nullable/default-safe para no romper la app hermana).

## Capabilities

### New Capabilities

- `mercadopago-checkout`: Selección de método de pago, recargo 10%, creación de preferencia Checkout Pro, Wallet Brick / redirección, webhooks, transición automática a `APPROVED`, y visualización de pago en CMS.

### Modified Capabilities

- `order-emails`: El email de reserva al cliente y el aviso a Melizza MUST reflejar el método de pago elegido (datos de transferencia **o** confirmación/instrucciones de Checkout Pro y total con recargo).

## Impact

- **Archivos (previstos):** `prisma/schema.prisma` (+ migración), `lib/env.ts`, `lib/mercadopago/*`, `lib/orders/*`, `app/api/orders/route.ts`, `app/api/mercadopago/webhook/route.ts` (y/o create-preference), `components/designer/*` (paso de pago / confirmación), emails en `emails/*` y `lib/email/*`, CMS `order-detail-sheet` / listado, `package.json` (`mercadopago`, `@mercadopago/sdk-react`), `.env.example`, `docs/DOCUMENTATION.md`, `openspec/config.yaml` (modelo comercial).
- **APIs:** extensión de `POST /api/orders`; nuevas rutas de preferencia/webhook; CMS lectura de campos de pago.
- **Dependencias:** SDK oficial Mercado Pago (backend) + SDK React Wallet Brick (frontend).
- **tikkiguau-tiendas:** no se modifica; schema compartido debe permanecer compatible (defaults / nullables).

## Non-goals

- Checkout API / Checkout Bricks transparentes (pago embebido sin redirección completa).
- Cálculo o visualización de neto estimado post-comisión MP en el CMS (v1).
- Pagos recurrentes, cuotas forzosas, o split marketplace.
- Integrar Mercado Pago en `tikkiguau-tiendas`.
- Reemplazar la transferencia directa.
- Recalcular órdenes históricas al desplegar.

## Impacto en datos existentes

- Migración Prisma en tabla `Order` compartida: campos nuevos con default seguro (p. ej. `paymentMethod = TRANSFER`, montos/IDs nullables, estado de pago nullable o `NOT_REQUIRED` / `PENDING`).
- Órdenes ya creadas se tratan como transferencia manual; no se migran a Checkout Pro.
- Precios de catálogo CMS **no cambian** (siguen siendo precio transferencia); el 10% es recargo de checkout, no precio de catálogo.

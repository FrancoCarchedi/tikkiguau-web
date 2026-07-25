## Why

Tras confirmar una reserva en `/disenar`, el cliente ve en pantalla los datos de Mercado Pago, pero no recibe un comprobante por email. Melizza tampoco recibe un aviso inmediato de pedido nuevo (depende de mirar el CMS). Además, los cambios de estado en el admin (`APPROVED` / `REJECTED` / `DELIVERED`) no notifican al cliente. Integrar Resend + React Email cierra el circuito de comunicación transaccional del flujo web.

## What Changes

- Envío de **5 emails transaccionales** vía Resend:
  1. Cliente — confirmación de reserva (incluye Alias/CVU/titular Mercado Pago, total, n° de orden).
  2. Melizza — aviso de pedido nuevo (datos de contacto, entrega, total, n° de orden).
  3. Cliente — pedido aprobado (solo transiciones allowlist → `APPROVED`).
  4. Cliente — pedido rechazado (solo allowlist → `REJECTED`).
  5. Cliente — pedido entregado (solo allowlist → `DELIVERED`), incluyendo `trackingCode` cuando exista.
- Auto-email **solo en transiciones lógicas hacia adelante** (p. ej. no en `APPROVED`→`PENDING` ni desde `DELIVERED` hacia atrás).
- Botón CMS **"Reenviar email con el último estado"** en el detalle de orden (reenvío manual al cliente según status actual).
- Templates HTML con **React Email**, reutilizando copy/datos de `lib/payment-details.ts`.
- Disparos desde `POST /api/orders` (creación), `PATCH /api/orders/[id]` (cambio de estado allowlist) y `POST .../resend-email` (manual).
- Variables de entorno: `RESEND_API_KEY`, `EMAIL_FROM`, `ORDER_NOTIFY_EMAIL`.
- Documentación de negocio actualizada: el pago ya no se “coordina por WhatsApp” para pasar datos bancarios; WhatsApp queda para consultas y envío de comprobante.

## Capabilities

### New Capabilities

- `order-emails`: Emails transaccionales de órdenes del diseñador web (cliente + Melizza) con Resend y React Email.

### Modified Capabilities

_(ninguna)_

## Impact

- **Archivos (previstos):** `lib/resend.ts`, `lib/email/*`, `emails/*` (templates React Email), `app/api/orders/route.ts`, `app/api/orders/[id]/route.ts`, `app/api/orders/[id]/resend-email/route.ts`, `order-detail-sheet.tsx`, `lib/env.ts`, `package.json`, `docs/DOCUMENTATION.md`.
- **APIs / BD:** sin cambios de schema Prisma; solo side-effects de email tras crear/actualizar órdenes.
- **tikkiguau-tiendas:** fuera de alcance (este change solo `tikkiguau-web`).

## Non-goals

- Emails de marketing / newsletters.
- Notificar a Melizza en cada cambio de estado.
- Pasarela de pago online (Mercado Pago Checkout); se mantienen datos de transferencia manual.
- Envío de emails para órdenes creadas desde `tikkiguau-tiendas`.
- Cola / worker externo (v1: envío en el request del API, best-effort).

## Impacto en datos existentes

- Sin migración de BD.
- Órdenes ya creadas no reciben emails retroactivos; solo eventos nuevos (creación o cambio de estado desde el deploy).

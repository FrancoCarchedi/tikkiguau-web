## 1. Schema y dependencias

- [x] 1.1 Extender `prisma/schema.prisma`: enums `PaymentMethod` / `PaymentStatus` + campos en `Order`
- [x] 1.2 Correr `prisma migrate` + `prisma generate`
- [x] 1.3 Instalar `mercadopago` y `@mercadopago/sdk-react`; env: `MP_ACCESS_TOKEN`, `NEXT_PUBLIC_MP_PUBLIC_KEY`, `NEXT_PUBLIC_APP_URL`, `MP_WEBHOOK_SECRET` opcional, `MP_CHECKOUT_ENABLED` opcional

## 2. Pricing y cliente MP (backend)

- [x] 2.1 `lib/orders/payment-pricing.ts` (10% + `Math.round`)
- [x] 2.2 `lib/mercadopago/client.ts` + `sync-order-payment.ts` (preferencia con `notification_url` + `back_urls`, getPayment, sync idempotente)
- [x] 2.3 Extender `createOrderSchema` con `paymentMethod`

## 3. API de órdenes y preferencia

- [x] 3.1 `POST /api/orders`: recálculo, recargo, preferencia MP, respuesta con `preferenceId`
- [x] 3.2 Páginas `app/pago/success|failure|pending` (success sincroniza pago)
- [x] 3.3 Endpoint `POST /api/mercadopago/webhook` (firma con `MP_WEBHOOK_SECRET`; panel + `notification_url`)
- [x] 3.4 Helper `webhook-signature.ts` + sync idempotente (approved → APPROVED + email)

## 4. Acreditación sin panel Webhooks

- [x] 4.1 Preferencia incluye `notification_url` (prioridad sobre panel)
- [x] 4.2 Sync en `/pago/success` vía Payment API → auto-`APPROVED` + email

## 5. UI diseñador

- [x] 5.1 Selección Transferencia / Mercado Pago + desglose recargo
- [x] 5.2 ConfirmationStep: CVU vs Wallet Brick

## 6. Emails

- [x] 6.1 Templates reserva cliente/Melizza según `paymentMethod`
- [x] 6.2 `mapOrderToEmailPayload` incluye campos de pago

## 7. CMS y documentación

- [x] 7.1 CMS listado/detalle: método y estado de pago + IDs MP
- [x] 7.2 Actualizar `docs/DOCUMENTATION.md` y `openspec/config.yaml`
- [x] 7.3 Smoke checklist manual (transferencia + MP con `NEXT_PUBLIC_APP_URL=http://localhost:3000`)

## 8. Mejoras futuras (no implementadas)

- [ ] 8.1 **Expiración automática de pagos abandonados**: implementar un Vercel Cron Job
  (e.g. diario a las 03:00 AM) que busque órdenes con `paymentMethod=MERCADOPAGO`,
  `paymentStatus=PENDING` y `createdAt` de más de 48hs, y las marque como `REJECTED`.
  Esto evita que el CMS acumule órdenes fantasma indefinidamente.
  - Endpoint sugerido: `GET /api/cron/expire-pending-payments` (protegido con `CRON_SECRET`)
  - Referencia: https://vercel.com/docs/cron-jobs

- [ ] 8.2 **Email de recordatorio de pago**: enviar email al cliente X horas después de
  crear una orden con `paymentStatus=PENDING` si aún no fue abonada. Puede combinarse
  con el cron del punto 8.1.

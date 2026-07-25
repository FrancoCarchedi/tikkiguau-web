## 1. Dependencias y configuración

- [x] 1.1 Instalar `resend`, `@react-email/components` (y devDependency de preview si aplica)
- [x] 1.2 Extender `lib/env.ts` con `RESEND_API_KEY`, `EMAIL_FROM`, `ORDER_NOTIFY_EMAIL`
- [x] 1.3 Crear `lib/resend.ts` (cliente Resend)
- [x] 1.4 Documentar en README/env example el setup de dominio DNS en Resend

## 2. Templates React Email

- [x] 2.1 Template confirmación cliente (orden, total, Mercado Pago, WhatsApp consultas)
- [x] 2.2 Template aviso Melizza (contacto, entrega, total, orderNumber)
- [x] 2.3 Templates estado: aprobado, rechazado, entregado (+ tracking)

## 3. Envío desde API

- [x] 3.1 Helper `sendReservationEmails` / `sendStatusEmail` / `sendCustomerEmailForCurrentStatus` (best-effort, logs)
- [x] 3.2 Helper `isAutoEmailTransition(from, to)` con allowlist hacia adelante
- [x] 3.3 Invocar tras create en `app/api/orders/route.ts` (POST)
- [x] 3.4 Invocar tras update de status en `app/api/orders/[id]/route.ts` (PATCH) solo si allowlist
- [x] 3.5 Endpoint `POST /api/orders/[id]/resend-email` (admin) para reenvío manual al cliente
- [x] 3.6 Botón “Reenviar email con el último estado” en `order-detail-sheet.tsx` + toast

## 4. Documentación

- [x] 4.1 Actualizar `docs/DOCUMENTATION.md` (flujo de pago, confirmación, FAQ)
- [x] 4.2 Ajustar `openspec/config.yaml` (emails en implementado; archivar change aparte)

## 5. Verificación

- [x] 5.1 Smoke local: crear orden → 2 emails (test addresses Resend)
- [x] 5.2 Smoke: allowlist PENDING→APPROVED / APPROVED→DELIVERED (+ tracking); APPROVED→PENDING sin email
- [x] 5.3 Smoke: botón reenviar en PENDING y DELIVERED
- [x] 5.4 Verificar que fallo de Resend no rompe 201/200 de create/update

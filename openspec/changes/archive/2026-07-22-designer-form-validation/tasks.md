## 1. Schemas de validación

- [x] 1.1 Crear `lib/designer/validation.ts` con `userDataSchema` y `deliveryDataSchema` (Zod)
- [x] 1.2 Exponer `validateUserData`, `validateDeliveryData`, `getUserDataFieldErrors`, `getDeliveryDataFieldErrors`

## 2. UI del diseñador

- [x] 2.1 Integrar errores por campo y a11y en `UserDataStep.tsx`
- [x] 2.2 Integrar errores por campo y a11y en `DeliveryStep.tsx` según método
- [x] 2.3 Usar validadores en `DesignerPage.tsx` (`canProceed` / `handleNext` + `forceShowErrors`)

## 3. API

- [x] 3.1 Alinear `createOrderSchema` en `lib/orders/schemas.ts` (nombre, email, teléfono, entrega)

## 4. Verificación

- [x] 4.1 Typecheck (`tsc --noEmit`)
- [x] 4.2 Smoke manual: email inválido, teléfono corto, domicilio incompleto, pickup sin dirección

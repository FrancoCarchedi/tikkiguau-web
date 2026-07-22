## Why

El diseñador permitía avanzar y enviar pedidos con email u otros datos de contacto inválidos o incompletos. Hacía falta validación explícita en el cliente (y alineada en la API) para reducir pedidos no contactables y seguir buenas prácticas de formularios.

## What Changes

- Schemas Zod compartidos para contacto y entrega en `lib/designer/validation.ts`.
- Errores por campo en `UserDataStep` y `DeliveryStep` (blur + intento de avanzar).
- Bloqueo de avance en `DesignerPage` cuando la validación falla; en pasos de formulario el botón queda habilitado para revelar errores.
- `createOrderSchema` en `lib/orders/schemas.ts` endurecido con las mismas reglas (email, teléfono, nombre/apellido, entrega según método).

## Capabilities

### New Capabilities

- `designer-form-validation`: Validación de formularios de contacto y entrega en `/disenar`, con feedback accesible y reglas equivalentes en `POST /api/orders`.

### Modified Capabilities

_(ninguna)_

## Impact

- **Archivos:** `lib/designer/validation.ts`, `components/designer/steps/UserDataStep.tsx`, `components/designer/steps/DeliveryStep.tsx`, `components/designer/DesignerPage.tsx`, `lib/orders/schemas.ts`.
- **APIs / BD:** solo validación de payload en `POST /api/orders`; sin cambios de schema Prisma.
- **tikkiguau-tiendas:** fuera de alcance.

## Non-goals

- Introducir react-hook-form en el diseñador (se mantiene estado local + Zod).
- Validación de pasos de diseño/producto (cantidad de elementos, etc.) más allá de lo ya existente.
- Verificación de email por código o captcha.
- Cambios de copy comercial o de métodos de entrega.

## Impacto en datos existentes

- Sin impacto en órdenes ya creadas ni en la BD compartida.
- Solo rechaza payloads inválidos nuevos en cliente y API.

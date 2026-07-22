## Context

El flujo `/disenar` recolecta `UserData` y `DeliveryData` en pasos dedicados y envía el pedido vía `POST /api/orders`. Antes de este change, el avance dependía de checks mínimos o incompletos; el email no se validaba con formato estricto y la API no reflejaba las mismas reglas de nombre/teléfono.

## Goals / Non-Goals

**Goals:**

- Validar contacto (nombre, apellido, email, teléfono) con mensajes claros en español (Argentina).
- Validar entrega según método (`PICKUP`, `CORREO_DOMICILIO`, `CORREO_SUCURSAL`).
- Mostrar errores al blur y al intentar avanzar.
- Alinear `createOrderSchema` con las reglas del cliente.

**Non-goals:**

- Migrar el diseñador a react-hook-form.
- Cambiar el modelo de negocio de reserva / métodos de envío.
- Tocar `tikkiguau-tiendas`.

## Decisions

### 1. Zod en `lib/designer/validation.ts`

**Decisión:** Schemas y helpers (`validate*`, `get*FieldErrors`) centralizados para UI y reutilizables conceptualmente junto al schema de órdenes.

**Alternativa descartada:** Validar solo en el API — peor UX; el usuario solo vería el fallo al confirmar.

### 2. Estado local + touched / forceShowErrors

**Decisión:** Cada step mantiene `touched` por campo; `DesignerPage` pasa `forceShowErrors` tras un “Siguiente” fallido. En pasos de formulario el botón no se deshabilita por validez, para poder disparar ese feedback.

**Alternativa descartada:** Botón siempre disabled sin mensajes — el usuario no entiende por qué no puede avanzar.

### 3. Misma severidad en API

**Decisión:** `lib/orders/schemas.ts` aplica email, dígitos de teléfono, regex de nombres y superRefine de entrega equivalentes al cliente.

**Alternativa descartada:** Confiar solo en el cliente — inseguro frente a requests directos.

## Risks / Trade-offs

- **[Falsos negativos en nombres]** → el patrón Unicode puede rechazar caracteres raros; se aceptan letras, acentos, apóstrofos y guiones (cubren el caso argentino habitual).
- **[Teléfonos internacionales]** → límite 8–15 dígitos alineado a E.164 práctico; números locales argentinos con código de área entran en el rango.

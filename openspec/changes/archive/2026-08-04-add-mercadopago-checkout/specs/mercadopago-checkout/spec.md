## ADDED Requirements

### Requirement: Selección de método de pago en el diseñador

El checkout del diseñador web (`/disenar`) SHALL permitir al cliente elegir entre **Transferencia** y **Mercado Pago** antes de confirmar la orden. El sistema MUST mostrar el total a pagar según el método: para transferencia el base (productos + envío); para Mercado Pago el base más un recargo del 10%.

#### Scenario: Elegir transferencia

- **WHEN** el cliente selecciona Transferencia
- **THEN** el total mostrado es productos + envío sin recargo

#### Scenario: Elegir Mercado Pago

- **WHEN** el cliente selecciona Mercado Pago
- **THEN** el total mostrado es (productos + envío) más 10% de recargo, con copy que explica el recargo

### Requirement: Recargo del 10% solo para Mercado Pago

El sistema SHALL calcular el recargo como el 10% del total base (productos + envío), redondeado al entero ARS más cercano (`Math.round`). El recargo MUST ser 0 cuando el método es Transferencia. Los precios de catálogo CMS MUST permanecer siendo el valor de transferencia; el recargo MUST NOT persistirse como precio de catálogo.

#### Scenario: Combo con envío a domicilio vía MP

- **GIVEN** base = 39000 (combo) + 12000 (envío) = 51000
- **WHEN** el método es Mercado Pago
- **THEN** el recargo es 5100 y el total a cobrar es 56100

#### Scenario: Mismo pedido por transferencia

- **GIVEN** el mismo base 51000
- **WHEN** el método es Transferencia
- **THEN** el recargo es 0 y el total a cobrar es 51000

### Requirement: Creación de orden con método de pago y montos

`POST /api/orders` SHALL aceptar `paymentMethod` (`TRANSFER` | `MERCADOPAGO`), recalcular productos y envío desde el catálogo vigente, aplicar el recargo correspondiente, y persistir `paymentMethod`, `paymentSurchargeAmount` y `totalAmount` (monto a cobrar). El servidor MUST rechazar la solicitud (HTTP 400) si el total enviado por el cliente no coincide con el calculado. Órdenes por transferencia MUST quedar con `paymentStatus = NOT_REQUIRED`. Órdenes por Mercado Pago MUST quedar con `paymentStatus = PENDING` y `status = PENDING` hasta la acreditación.

#### Scenario: Orden transferencia válida

- **WHEN** el cliente confirma con Transferencia y total correcto
- **THEN** se crea la orden con `paymentMethod = TRANSFER`, `paymentSurchargeAmount = 0`, `paymentStatus = NOT_REQUIRED`

#### Scenario: Orden Mercado Pago válida

- **WHEN** el cliente confirma con Mercado Pago y total correcto (base + 10%)
- **THEN** se crea la orden con `paymentMethod = MERCADOPAGO`, `paymentSurchargeAmount` = 10% del base, `paymentStatus = PENDING`

#### Scenario: Total manipulado por el cliente

- **WHEN** el cliente envía un `totalAmount` distinto al recalculado en servidor
- **THEN** la API responde HTTP 400 y no persiste la orden

### Requirement: Preferencia Checkout Pro y Wallet Brick

Para órdenes `MERCADOPAGO`, el sistema SHALL crear una preferencia de Checkout Pro en el backend (SDK Mercado Pago) con ítems/monto igual a `totalAmount`, `external_reference` igual al `orderNumber`, y `back_urls` hacia páginas públicas de éxito / fallo / pendiente. El frontend MUST inicializar el Wallet Brick con la Public Key y el `preferenceId` devuelto. La preferencia MUST guardarse en `mpPreferenceId`.

#### Scenario: Iniciar pago online

- **WHEN** se crea exitosamente una orden Mercado Pago
- **THEN** el cliente ve el botón de pago de Mercado Pago (Wallet Brick) asociado a la preferencia de esa orden

#### Scenario: Preferencia ligada a la orden

- **WHEN** se crea la preferencia
- **THEN** `external_reference` es el `orderNumber` y `mpPreferenceId` queda persistido

### Requirement: Webhook actualiza pago y aprueba la orden

El sistema SHALL exponer un endpoint webhook que valide la firma de Mercado Pago, obtenga el pago, resuelva la orden asociada y actualice `paymentStatus` y `mpPaymentId`. Cuando el pago esté `approved` y la orden esté `PENDING`, el sistema MUST cambiar `status` a `APPROVED` y disparar el email de pedido aprobado al cliente. Webhooks duplicados MUST ser idempotentes (no reenviar email ni alterar de más un pedido ya aprobado por pago).

#### Scenario: Pago aprobado

- **WHEN** llega un webhook válido de pago `approved` para una orden `PENDING` de Mercado Pago
- **THEN** `paymentStatus` pasa a `APPROVED`, `status` pasa a `APPROVED` y el cliente recibe el email de pedido aprobado

#### Scenario: Webhook duplicado

- **GIVEN** la orden ya está `APPROVED` por un pago previo
- **WHEN** llega otro webhook `approved` del mismo pago
- **THEN** el sistema responde éxito sin reenviar el email de aprobado

#### Scenario: Pago rechazado

- **WHEN** llega un webhook válido con pago rechazado/cancelado
- **THEN** `paymentStatus` pasa a `REJECTED` y `OrderStatus` no cambia automáticamente a `REJECTED`

#### Scenario: Firma inválida

- **WHEN** el webhook no pasa la validación de firma
- **THEN** el sistema responde error de autenticación y no modifica la orden

### Requirement: Confirmación UI según método de pago

Tras crear la orden, la UI de confirmación SHALL mostrar: para Transferencia, alias/CVU/titular y total base (comportamiento actual); para Mercado Pago, el Wallet Brick / estado del pago y el total con recargo, sin datos de transferencia bancaria.

#### Scenario: Post-reserva transferencia

- **WHEN** el método es Transferencia
- **THEN** la confirmación muestra datos bancarios y CTA WhatsApp para consultas/comprobante

#### Scenario: Post-reserva Mercado Pago

- **WHEN** el método es Mercado Pago
- **THEN** la confirmación muestra el total con recargo y el medio para pagar en Mercado Pago, sin alias/CVU

### Requirement: CMS muestra información de pago

El listado y detalle de órdenes en el CMS SHALL mostrar el método de pago y el estado de pago. Para órdenes Mercado Pago, el detalle SHOULD mostrar `mpPaymentId` y/o `mpPreferenceId` cuando existan. El CMS MUST NOT calcular ni mostrar neto estimado post-comisión de Mercado Pago en v1.

#### Scenario: Detalle con pago online

- **WHEN** Melizza abre una orden `MERCADOPAGO`
- **THEN** ve método, estado de pago y total cobrado (con recargo)

#### Scenario: Orden histórica transferencia

- **WHEN** Melizza abre una orden previa a este change (default transferencia)
- **THEN** ve método Transferencia y estado de pago no requerido / equivalente

### Requirement: Compatibilidad de schema con tiendas

La migración MUST agregar campos con defaults seguros (`paymentMethod = TRANSFER`, `paymentStatus = NOT_REQUIRED`, `paymentSurchargeAmount = 0`) de modo que órdenes existentes y el flujo de `tikkiguau-tiendas` (sin cambios de código en este change) sigan siendo válidos a nivel de base de datos.

#### Scenario: Órdenes existentes tras migrar

- **WHEN** se aplica la migración sobre órdenes ya persistidas
- **THEN** quedan con transferencia / pago no requerido y su `totalAmount` histórico intacto

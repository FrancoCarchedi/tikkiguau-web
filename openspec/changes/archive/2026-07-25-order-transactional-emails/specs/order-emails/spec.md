## ADDED Requirements

### Requirement: Confirmación de reserva por email al cliente

Al crear exitosamente una orden desde el diseñador web (`POST /api/orders`), el sistema SHALL enviar un email transaccional al `email` del cliente con: número de orden, resumen de totales (productos + envío cuando aplique), método de entrega, y los datos de transferencia Mercado Pago (alias, CVU, titular) provenientes de la fuente compartida de pago del sitio. El email SHOULD incluir un enlace o referencia a WhatsApp solo para consultas, no como canal para recibir los datos bancarios.

#### Scenario: Reserva creada

- **WHEN** un cliente confirma una reserva válida en `/disenar`
- **THEN** recibe un email de confirmación que incluye el número de orden y los datos de Mercado Pago para transferir

#### Scenario: Datos de pago alineados con la UI

- **WHEN** el cliente compara el email de confirmación con la pantalla post-reserva
- **THEN** alias, CVU y titular coinciden con los mostrados en `ConfirmationStep`

### Requirement: Aviso de pedido nuevo a Melizza

Al crear exitosamente una orden web, el sistema SHALL enviar un email a la dirección configurada como notificación de negocio (`ORDER_NOTIFY_EMAIL`) con número de orden, datos de contacto del cliente, método/datos de entrega y total. El email SHOULD incluir un enlace a WhatsApp (`wa.me`) hacia el teléfono del cliente para abrir el chat directamente.

#### Scenario: Nuevo pedido web

- **WHEN** se persiste una orden creada desde el sitio
- **THEN** Melizza recibe un email de aviso con los datos necesarios para gestionarla en el CMS

#### Scenario: Link WhatsApp al cliente

- **WHEN** Melizza abre el email de pedido nuevo desde Gmail web o la app móvil
- **THEN** puede tocar un enlace que abre WhatsApp con el chat del cliente (número normalizado)

### Requirement: Notificación automática solo en transiciones lógicas

Cuando un administrador autentificado cambia el `status` de una orden, el sistema SHALL enviar email al cliente **solo** si la transición está en la allowlist hacia adelante. El email de `DELIVERED` MUST incluir el `trackingCode` si está presente en la orden. El email de `APPROVED` con `deliveryMethod: PICKUP` MUST indicar que el punto de retiro se coordinará por WhatsApp y MUST NOT incluir una dirección física de retiro.

**Allowlist de auto-email:** `PENDING`→`APPROVED`|`REJECTED`|`DELIVERED`; `APPROVED`→`DELIVERED`|`REJECTED`.

Transiciones fuera de la allowlist (p. ej. `APPROVED`→`PENDING`, `DELIVERED`→estado anterior, `REJECTED`→otro estado, o el mismo status) MUST NOT disparar email automático. El sistema MAY igual persistir el nuevo status (corrección operativa).

#### Scenario: Pedido aprobado desde pendiente

- **WHEN** el status pasa de `PENDING` a `APPROVED`
- **THEN** el cliente recibe el email de pedido aprobado

#### Scenario: Pedido aprobado con retiro presencial

- **GIVEN** la orden tiene `deliveryMethod: PICKUP`
- **WHEN** el status pasa a `APPROVED` (o se reenvía el email con ese estado)
- **THEN** el email indica que TikkiGuau contactará por WhatsApp para indicar el punto de retiro, sin exponer una dirección física

#### Scenario: Pedido aprobado con envío

- **GIVEN** la orden tiene envío por Correo (`CORREO_DOMICILIO` o `CORREO_SUCURSAL`)
- **WHEN** el status pasa a `APPROVED`
- **THEN** el email indica que se avisará cuando el pedido esté listo o en camino (sin dirección de retiro)

#### Scenario: Pedido rechazado desde aprobado

- **WHEN** el status pasa de `APPROVED` a `REJECTED`
- **THEN** el cliente recibe el email de pedido rechazado

#### Scenario: Pedido entregado con tracking

- **GIVEN** la orden tiene envío a domicilio (`CORREO_DOMICILIO`) y `trackingCode`
- **WHEN** el status pasa a `DELIVERED`
- **THEN** el cliente recibe un email titulado “Pedido enviado” indicando que la orden fue enviada al domicilio, e incluye el código de seguimiento si existe

#### Scenario: Pedido enviado a sucursal

- **GIVEN** la orden tiene `deliveryMethod: CORREO_SUCURSAL`
- **WHEN** el status pasa a `DELIVERED`
- **THEN** el cliente recibe un email titulado “Pedido enviado” indicando que la orden fue enviada a la sucursal de entrega seleccionada, e incluye el código de seguimiento si existe

#### Scenario: Pedido entregado con retiro presencial

- **GIVEN** la orden tiene `deliveryMethod: PICKUP`
- **WHEN** el status pasa a `DELIVERED` (o se reenvía el email con ese estado)
- **THEN** el email confirma que el producto fue entregado y agradece, sin código de seguimiento ni instrucciones de envío

#### Scenario: Retroceso de estado sin email

- **WHEN** el status pasa de `APPROVED` a `PENDING` (o de `DELIVERED` a un estado anterior)
- **THEN** la orden se actualiza pero el sistema no envía email automático

#### Scenario: Sin cambio de status

- **WHEN** el admin actualiza solo el `trackingCode` sin cambiar el status
- **THEN** el sistema no envía email de cambio de estado

### Requirement: Reenvío manual desde el CMS

El detalle de orden en el CMS SHALL ofrecer una acción **"Reenviar email con el último estado"** para administradores autenticados. Al invocarla, el sistema SHALL enviar al cliente el email correspondiente al `status` actual: confirmación de reserva si `PENDING`; aprobado / rechazado / entregado según corresponda. El reenvío MUST NOT notificar a Melizza. El envío es best-effort con feedback en la UI.

#### Scenario: Reenviar con estado pendiente

- **WHEN** Melizza pulsa reenviar en una orden `PENDING`
- **THEN** el cliente recibe de nuevo el email de confirmación de reserva (con datos de Mercado Pago)

#### Scenario: Reenviar con estado entregado

- **WHEN** Melizza pulsa reenviar en una orden `DELIVERED`
- **THEN** el cliente recibe de nuevo el email de entregado (con tracking si existe)

#### Scenario: Reenviar tras un retroceso corregido

- **GIVEN** una orden quedó en `APPROVED` tras corregir un cambio erróneo
- **WHEN** Melizza usa el botón de reenvío
- **THEN** el cliente recibe el email de pedido aprobado aunque ese status no hubiera disparado auto-email en el último PATCH

### Requirement: Envío best-effort con Resend y React Email

Los emails MUST renderizarse con React Email y enviarse mediante Resend. Un fallo del proveedor de email MUST NOT hacer fallar la creación ni la actualización de la orden; el error MUST registrarse en logs del servidor.

#### Scenario: Resend no disponible al crear

- **WHEN** la orden se crea correctamente pero Resend responde error
- **THEN** la API responde éxito de creación (201) y el error de email queda logueado

#### Scenario: Resend no disponible al cambiar estado

- **WHEN** el status se actualiza correctamente pero el envío de email falla
- **THEN** la API responde éxito del PATCH y el error de email queda logueado

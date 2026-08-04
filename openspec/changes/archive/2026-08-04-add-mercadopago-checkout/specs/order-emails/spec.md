## MODIFIED Requirements

### Requirement: Confirmación de reserva por email al cliente

Al crear exitosamente una orden desde el diseñador web (`POST /api/orders`), el sistema SHALL enviar un email transaccional al `email` del cliente con: número de orden, resumen de totales (productos + envío cuando aplique, y recargo si corresponde), método de entrega y método de pago.

Si `paymentMethod` es Transferencia, el email MUST incluir los datos de transferencia Mercado Pago (alias, CVU, titular) provenientes de la fuente compartida de pago del sitio y el total sin recargo.

Si `paymentMethod` es Mercado Pago, el email MUST NOT incluir alias/CVU/titular; MUST indicar que el pago se completa online en Mercado Pago, el total con el recargo del 10%, y que al acreditarse el pago recibirá la confirmación de pedido aprobado.

El email SHOULD incluir un enlace o referencia a WhatsApp solo para consultas (y, en transferencia, para envío de comprobante), no como canal para recibir los datos bancarios cuando el pago es online.

#### Scenario: Reserva creada por transferencia

- **WHEN** un cliente confirma una reserva válida con Transferencia
- **THEN** recibe un email de confirmación que incluye el número de orden y los datos de Mercado Pago para transferir

#### Scenario: Reserva creada por Mercado Pago

- **WHEN** un cliente confirma una reserva válida con Mercado Pago
- **THEN** recibe un email con el número de orden y el total con recargo, sin alias/CVU, indicando pago online

#### Scenario: Datos de transferencia alineados con la UI

- **WHEN** el cliente eligió Transferencia y compara el email con la pantalla post-reserva
- **THEN** alias, CVU y titular coinciden con los mostrados en la confirmación

### Requirement: Aviso de pedido nuevo a Melizza

Al crear exitosamente una orden web, el sistema SHALL enviar un email a la dirección configurada como notificación de negocio (`ORDER_NOTIFY_EMAIL`) con número de orden, datos de contacto del cliente, método/datos de entrega, método de pago, estado de pago cuando aplique, y total a cobrar. El email SHOULD incluir un enlace a WhatsApp (`wa.me`) hacia el teléfono del cliente para abrir el chat directamente.

#### Scenario: Nuevo pedido web por transferencia

- **WHEN** se persiste una orden creada desde el sitio con Transferencia
- **THEN** Melizza recibe un email de aviso con los datos necesarios para gestionarla, incluyendo método Transferencia y total

#### Scenario: Nuevo pedido web por Mercado Pago

- **WHEN** se persiste una orden con Mercado Pago
- **THEN** Melizza recibe un email que indica método Mercado Pago, que el pago está pendiente de acreditación online, y el total con recargo

#### Scenario: Link WhatsApp al cliente

- **WHEN** Melizza abre el email de pedido nuevo desde Gmail web o la app móvil
- **THEN** puede tocar un enlace que abre WhatsApp con el chat del cliente (número normalizado)

### Requirement: Reenvío manual desde el CMS

El detalle de orden en el CMS SHALL ofrecer una acción **"Reenviar email con el último estado"** para administradores autenticados. Al invocarla, el sistema SHALL enviar al cliente el email correspondiente al `status` actual: confirmación de reserva si `PENDING` (adaptada al `paymentMethod` de la orden); aprobado / rechazado / entregado según corresponda. El reenvío MUST NOT notificar a Melizza. El envío es best-effort con feedback en la UI.

#### Scenario: Reenviar pendiente transferencia

- **WHEN** Melizza pulsa reenviar en una orden `PENDING` con Transferencia
- **THEN** el cliente recibe de nuevo el email de confirmación de reserva con datos bancarios

#### Scenario: Reenviar pendiente Mercado Pago

- **WHEN** Melizza pulsa reenviar en una orden `PENDING` con Mercado Pago
- **THEN** el cliente recibe de nuevo el email de reserva online (total con recargo, sin alias/CVU)

#### Scenario: Reenviar con estado entregado

- **WHEN** Melizza pulsa reenviar en una orden `DELIVERED`
- **THEN** el cliente recibe de nuevo el email de entregado (con tracking si existe)

#### Scenario: Reenviar tras un retroceso corregido

- **GIVEN** una orden quedó en `APPROVED` tras corregir un cambio erróneo
- **WHEN** Melizza usa el botón de reenvío
- **THEN** el cliente recibe el email de pedido aprobado aunque ese status no hubiera disparado auto-email en el último PATCH

## ADDED Requirements

### Requirement: Email de aprobado también desde webhook de pago

Cuando un webhook de Mercado Pago cambia el `status` de una orden de `PENDING` a `APPROVED` por pago acreditado, el sistema SHALL enviar al cliente el mismo email de pedido aprobado que se usa en la allowlist del CMS. El envío MUST ser best-effort e idempotente respecto de webhooks duplicados.

#### Scenario: Aprobado por pago online

- **WHEN** el webhook marca la orden como `APPROVED` por primera vez
- **THEN** el cliente recibe el email de pedido aprobado

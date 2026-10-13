## ADDED Requirements

### Requirement: Acción "Enviar pedido" con confirmación

El sistema SHALL ofrecer la acción **"Enviar pedido"**, habilitada solo cuando el pedido cumple las validaciones de mínimo por color, requisitos del pedido, referencia y teléfono. Al activarla, el sistema MUST abrir un **diálogo de confirmación** que muestre un resumen del pedido (referencia, teléfono, unidades totales y total estimado) y ofrezca dos acciones: **"Seguir editando"**, que cierra el diálogo sin guardar ni abrir WhatsApp, y **"Confirmar y enviar"**. El sistema MUST NOT ofrecer la acción "Enviar pedido por WhatsApp" directa ni "Descargar Excel".

#### Scenario: Abrir la confirmación

- **WHEN** el pedido es válido y el usuario pulsa "Enviar pedido"
- **THEN** se muestra el diálogo de confirmación con el resumen del pedido y las acciones "Seguir editando" y "Confirmar y enviar"

#### Scenario: Seguir editando

- **WHEN** el usuario pulsa "Seguir editando" en el diálogo
- **THEN** el diálogo se cierra, el pedido no se guarda, WhatsApp no se abre y el borrador permanece intacto

#### Scenario: Pedido inválido

- **WHEN** el pedido no cumple algún requisito
- **THEN** el botón "Enviar pedido" permanece deshabilitado y el resumen lista los motivos pendientes

### Requirement: Guardado del pedido y apertura de WhatsApp al confirmar

Al pulsar "Confirmar y enviar", el sistema MUST primero **guardar el pedido** en la base de datos (ver `wholesale-order-records`) y, solo si el guardado fue exitoso, abrir `https://wa.me/5491121816245?text=<mensaje>` (número de TikkiGuau, reutilizando `WHATSAPP_URL`) en una pestaña nueva, con el mensaje codificado para URL e incluyendo el número de pedido asignado. Mientras se guarda, el diálogo MUST mostrar un estado de carga y deshabilitar ambas acciones para evitar envíos duplicados. Si el guardado falla, el sistema MUST mostrar un mensaje de error en el diálogo, MUST NOT abrir WhatsApp y MUST permitir reintentar o seguir editando sin perder el pedido.

#### Scenario: Confirmación exitosa

- **WHEN** el usuario pulsa "Confirmar y enviar" y el servidor guarda el pedido
- **THEN** el pedido queda registrado con su número y se abre WhatsApp con el chat de TikkiGuau y el mensaje del pedido precargado

#### Scenario: Falla el guardado

- **WHEN** el servidor responde con error al guardar el pedido
- **THEN** el diálogo muestra el error, WhatsApp no se abre y el usuario puede reintentar o pulsar "Seguir editando"

#### Scenario: Doble clic

- **WHEN** el usuario pulsa "Confirmar y enviar" más de una vez mientras se guarda
- **THEN** se crea un único pedido

#### Scenario: Pedido no válido en el servidor

- **WHEN** el servidor rechaza el pedido por no cumplir las reglas vigentes (por ejemplo, un precio o mínimo cambió en el CMS)
- **THEN** el diálogo muestra el motivo, WhatsApp no se abre y el pedido no se guarda

### Requirement: Contenido del mensaje

El mensaje SHALL estar en español (Argentina) e incluir, en este orden: título del pedido mayorista, **número de pedido**, referencia, detalle agrupado por categoría, talla y color con el precio unitario de la regla, las cantidades por ítem de forma compacta (por ejemplo `A×10, B×10`), subtotal de unidades y monto por grupo, total de unidades, total estimado en ARS indicando que es estimado y sin envío, y las notas si existen. El mensaje MUST ser texto plano apto para WhatsApp (negritas con `*`) y MUST NOT incluir el teléfono del cliente ni otros datos personales más allá de lo que escriba en referencia y notas.

#### Scenario: Mensaje de ejemplo

- **WHEN** el pedido WH-1001 tiene 25 letras azules Talla 2 (A×10, B×10, C×5) y referencia "Pedido junio — Melisa"
- **THEN** el mensaje contiene el número WH-1001, la referencia, el grupo "Letras · Talla 2 (Mediana)" con el color Azul, `A×10, B×10, C×5`, el subtotal de 25 u y $22.025, y el total estimado

#### Scenario: Collares y correas

- **WHEN** el pedido incluye 30 collares Talla 1 color Negro
- **THEN** el mensaje lista "Collares · Talla 1 (Pequeña) — Negro: 30 u" con su subtotal

#### Scenario: Notas ausentes

- **WHEN** el usuario no completó notas
- **THEN** el mensaje omite la sección de notas

### Requirement: Mensaje demasiado largo con "Copiar texto"

Si la URL resultante supera el límite configurado en código (`WHATSAPP_MAX_URL_LENGTH`), el sistema MUST abrir WhatsApp con un **resumen breve** precargado (título, número de pedido, referencia, total de unidades, total estimado y un aviso de que el detalle completo se pegará a continuación) en lugar del detalle. En ese caso, tras guardar el pedido, el sistema MUST mostrar el botón **"Copiar texto"** junto con instrucciones en español de cómo usarlo (copiar el pedido completo, enviar el resumen en WhatsApp y pegar el pedido completo en el chat), y MUST NOT abrir WhatsApp automáticamente hasta que el usuario lo pida desde esa pantalla, para que pueda copiar primero. "Copiar texto" MUST copiar al portapapeles el **mensaje completo** y confirmar con una notificación; si la API del portapapeles no está disponible, el sistema MUST ofrecer un campo de texto seleccionable con el mensaje completo. Mientras el pedido no exceda el límite, el botón "Copiar texto" MUST NOT mostrarse y el mensaje precargado MUST ser el completo.

#### Scenario: Pedido muy extenso

- **WHEN** el mensaje codificado excede el límite y el usuario confirma el envío
- **THEN** el pedido se guarda y se muestra la pantalla con el botón "Copiar texto", las instrucciones de uso y el botón "Abrir WhatsApp" que abre el chat con el resumen breve

#### Scenario: Copiar el pedido completo

- **WHEN** el usuario pulsa "Copiar texto"
- **THEN** el portapapeles contiene el mensaje completo del pedido y se muestra una confirmación

#### Scenario: Portapapeles no disponible

- **WHEN** el navegador deniega o no soporta el acceso al portapapeles
- **THEN** el sistema muestra el mensaje completo en un campo de texto seleccionable

#### Scenario: Resumen breve dentro del límite

- **WHEN** se genera el resumen breve para un pedido extenso
- **THEN** su URL codificada no supera `WHATSAPP_MAX_URL_LENGTH` y contiene el número de pedido, la referencia, las unidades totales y el total estimado

#### Scenario: Pedido dentro del límite

- **WHEN** el mensaje codificado no excede el límite
- **THEN** WhatsApp se abre con el mensaje completo y no se muestra "Copiar texto"

### Requirement: Pantalla de pedido registrado

Tras guardar el pedido, el sistema SHALL mostrar una pantalla de confirmación con el número de pedido, la referencia, las unidades y el total estimado, e indicar que debe presionar "Enviar" en WhatsApp para completar el envío y que, aunque no lo haga, el pedido quedó registrado y TikkiGuau puede contactarlo al teléfono indicado. La pantalla SHALL ofrecer "Abrir WhatsApp" (para reintentar la apertura) y "Hacer un pedido nuevo". Al guardarse el pedido, el borrador local MUST eliminarse, de modo que reintentar WhatsApp reutilice el pedido ya guardado y no cree duplicados.

#### Scenario: Reintentar la apertura de WhatsApp

- **WHEN** el usuario cierra WhatsApp sin enviar y pulsa "Abrir WhatsApp" en la pantalla de pedido registrado
- **THEN** WhatsApp se abre de nuevo con el mismo mensaje y no se crea un pedido nuevo

#### Scenario: Pedido nuevo

- **WHEN** el usuario pulsa "Hacer un pedido nuevo"
- **THEN** la pantalla vuelve al armador con el pedido vacío

#### Scenario: Pestaña de WhatsApp bloqueada

- **WHEN** el navegador bloquea la apertura automática de la pestaña de WhatsApp
- **THEN** la pantalla de pedido registrado permite abrir WhatsApp con un clic

### Requirement: Sin pasarela ni emails

El flujo mayorista MUST NOT invocar Mercado Pago ni ninguna pasarela y MUST NOT enviar emails (ni al cliente ni a TikkiGuau). El pedido mayorista MUST NOT crear registros en la tabla `orders` ni aparecer en la vista de órdenes minoristas del CMS.

#### Scenario: Envío no mezcla canales

- **WHEN** un usuario confirma un pedido mayorista
- **THEN** la tabla `orders` y la vista de órdenes minoristas del CMS no cambian

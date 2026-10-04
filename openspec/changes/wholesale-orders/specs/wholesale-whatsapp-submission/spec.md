## ADDED Requirements

### Requirement: Envío del pedido por WhatsApp

El sistema SHALL ofrecer la acción **"Enviar pedido por WhatsApp"**, habilitada solo cuando el pedido cumple las validaciones de mínimo por color, requisitos del pedido y referencia. Al activarla, el sistema MUST abrir `https://wa.me/5491121816245?text=<mensaje>` (número de TikkiGuau, reutilizando `WHATSAPP_URL`) en una pestaña nueva, con el mensaje codificado para URL. El sistema MUST NOT ofrecer la acción "Descargar Excel".

#### Scenario: Envío de un pedido válido

- **WHEN** el pedido es válido y el usuario pulsa "Enviar pedido por WhatsApp"
- **THEN** se abre WhatsApp con el chat de TikkiGuau y el mensaje del pedido precargado

#### Scenario: Pedido inválido

- **WHEN** el pedido no cumple algún requisito
- **THEN** el botón permanece deshabilitado y el resumen lista los motivos pendientes

### Requirement: Contenido del mensaje

El mensaje SHALL estar en español (Argentina) e incluir, en este orden: título del pedido mayorista, referencia, detalle agrupado por categoría, talla y color con el precio unitario de la regla, las cantidades por ítem de forma compacta (por ejemplo `A×10, B×10`), subtotal de unidades y monto por grupo, total de unidades, total estimado en ARS indicando que es estimado y sin envío, y las notas si existen. El mensaje MUST ser texto plano apto para WhatsApp (negritas con `*`) y MUST NOT incluir datos personales del usuario más allá de lo que escriba en referencia y notas.

#### Scenario: Mensaje de ejemplo

- **WHEN** el pedido tiene 25 letras azules Talla 2 (A×10, B×10, C×5) y referencia "Pedido junio — Melisa"
- **THEN** el mensaje contiene la referencia, el grupo "Letras · Talla 2 (Mediana)" con el color Azul, `A×10, B×10, C×5`, el subtotal de 25 u y $22.025, y el total estimado

#### Scenario: Collares y correas

- **WHEN** el pedido incluye 30 collares Talla 1 color Negro
- **THEN** el mensaje lista "Collares · Talla 1 (Pequeña) — Negro: 30 u" con su subtotal

#### Scenario: Notas ausentes

- **WHEN** el usuario no completó notas
- **THEN** el mensaje omite la sección de notas

### Requirement: Sin persistencia ni pasarela

El flujo mayorista MUST NOT crear registros de pedido en la base de datos, MUST NOT invocar Mercado Pago ni ninguna pasarela y MUST NOT enviar emails. Ninguna API pública de escritura MUST existir para pedidos mayoristas. El pedido final queda en el chat de WhatsApp para que Melizza lo gestione con el cliente.

#### Scenario: Envío no deja rastro en el CMS

- **WHEN** un usuario envía un pedido mayorista por WhatsApp
- **THEN** la tabla `orders` y la vista de órdenes del CMS no cambian

### Requirement: Botón "Copiar texto" con ayuda al cliente

El sistema SHALL ofrecer junto al botón de WhatsApp la acción **"Copiar texto"**, habilitada bajo las mismas condiciones de validez que el envío. Al activarla, el sistema MUST copiar al portapapeles el **mensaje completo** del pedido (el mismo contenido definido en "Contenido del mensaje") y confirmar con una notificación. Junto al botón MUST mostrarse un texto de ayuda en español que explique que, si WhatsApp no trae el pedido completo, el cliente debe pegar el texto copiado en el chat. Si la API del portapapeles no está disponible, el sistema MUST ofrecer un campo de texto seleccionable con el mensaje completo para copiarlo manualmente.

#### Scenario: Copiar el pedido completo

- **WHEN** el pedido es válido y el usuario pulsa "Copiar texto"
- **THEN** el portapapeles contiene el mensaje completo del pedido y se muestra una confirmación

#### Scenario: Ayuda visible

- **WHEN** el pedido es válido
- **THEN** junto a los botones se indica que el texto copiado puede pegarse en el chat de WhatsApp si el pedido no llegó completo

#### Scenario: Portapapeles no disponible

- **WHEN** el navegador deniega o no soporta el acceso al portapapeles
- **THEN** el sistema muestra el mensaje completo en un campo de texto seleccionable

### Requirement: Mensaje demasiado largo

Si la URL resultante supera el límite configurado en código (`WHATSAPP_MAX_URL_LENGTH`), el botón "Enviar pedido por WhatsApp" MUST abrir WhatsApp con un **resumen breve** precargado (título, referencia, total de unidades, total estimado y un aviso de que el detalle completo se pegará a continuación) en lugar del detalle. Antes de abrir WhatsApp, el sistema MUST informar al usuario que debe usar "Copiar texto" y pegar el pedido completo en el chat, y MUST copiar automáticamente el mensaje completo al portapapeles cuando el navegador lo permita. Mientras el pedido no exceda el límite, el mensaje precargado MUST ser el completo.

#### Scenario: Pedido muy extenso

- **WHEN** el mensaje codificado excede el límite y el usuario pulsa "Enviar pedido por WhatsApp"
- **THEN** el sistema muestra el aviso, copia el mensaje completo al portapapeles y abre WhatsApp con el resumen breve precargado

#### Scenario: Resumen breve dentro del límite

- **WHEN** se genera el resumen breve para un pedido extenso
- **THEN** su URL codificada no supera `WHATSAPP_MAX_URL_LENGTH` y contiene la referencia, las unidades totales y el total estimado

#### Scenario: Pedido dentro del límite

- **WHEN** el mensaje codificado no excede el límite
- **THEN** WhatsApp se abre con el mensaje completo y no se muestra el aviso de pegado

### Requirement: Confirmación posterior al envío

Tras abrir WhatsApp, el sistema SHALL mostrar una confirmación indicando que debe presionar "Enviar" en WhatsApp para completar el pedido y SHALL ofrecer "Volver a abrir WhatsApp" y "Empezar un pedido nuevo". El borrador MUST conservarse hasta que el usuario elija vaciarlo.

#### Scenario: Reintentar el envío

- **WHEN** el usuario cierra WhatsApp sin enviar y vuelve a la página
- **THEN** su pedido sigue completo y puede reabrir WhatsApp

## ADDED Requirements

### Requirement: Creación pública de pedidos mayoristas validada en servidor

El sistema SHALL exponer `POST /api/wholesale/orders` sin autenticación para registrar un pedido mayorista. El servidor MUST validar el payload con zod (referencia de 3 a 80 caracteres, teléfono, notas de hasta 500 caracteres, líneas con categoría, talla, color, ítem y cantidad entera de 1 a 9999, sin líneas duplicadas) y MUST **recalcular** el pedido con las reglas vigentes de la base de datos y el catálogo vigente, sin confiar en precios ni totales enviados por el cliente. El servidor MUST rechazar con HTTP 400 y un mensaje en español cuando: la sección esté deshabilitada, alguna línea no esté disponible (regla inactiva, color o ítem no permitido, talla no disponible), o el pedido no cumpla los mínimos por color y los requisitos del pedido vigentes. Si es válido, MUST guardar el pedido y responder HTTP 201 con `id` y `orderNumber`. Los errores de base de datos MUST mapearse a un mensaje genérico sin exponer detalles.

#### Scenario: Pedido válido

- **WHEN** un cliente envía un pedido que cumple todas las reglas vigentes
- **THEN** el servidor responde 201 con el número de pedido y el pedido queda guardado con estado `NEW`

#### Scenario: Totales manipulados

- **WHEN** el payload incluye un total o precios distintos a los vigentes
- **THEN** el servidor ignora esos valores y guarda los calculados con las reglas del CMS

#### Scenario: Mínimo por color no cumplido

- **WHEN** el pedido tiene un grupo (categoría + talla + color) por debajo de su mínimo
- **THEN** el servidor responde 400 con el motivo y no guarda nada

#### Scenario: Sección deshabilitada

- **WHEN** `isEnabled` es `false`
- **THEN** el servidor responde 400 (o 403) con un mensaje de no disponibilidad y no guarda nada

#### Scenario: Payload inválido

- **WHEN** falta el teléfono, la referencia es demasiado corta o una cantidad no es un entero positivo
- **THEN** el servidor responde 400 con un mensaje en español

### Requirement: Teléfono de contacto obligatorio

El formulario del pedido SHALL solicitar un **teléfono de contacto** obligatorio, con indicación de ingresarlo con código de área, sin 0 ni 15. El sistema MUST validar en cliente y en servidor que contenga solo números y símbolos telefónicos (`+`, `-`, espacios, paréntesis, puntos) y entre 8 y 15 dígitos (misma regla que el teléfono del flujo minorista). El teléfono MUST persistir en el borrador local junto con referencia y notas.

#### Scenario: Teléfono ausente

- **WHEN** el usuario no completó el teléfono
- **THEN** el botón "Enviar pedido" permanece deshabilitado y el resumen indica que falta el teléfono

#### Scenario: Teléfono con formato inválido

- **WHEN** el usuario ingresa letras o menos de 8 dígitos
- **THEN** se muestra un error de validación y el pedido no puede enviarse

### Requirement: Modelo de datos aislado y snapshot del pedido

El sistema SHALL guardar los pedidos en la tabla nueva `wholesale_orders` (sin claves foráneas a tablas existentes) con: número de pedido único (formato `WH-<número>`, correlativo desde 1001), referencia, teléfono, notas opcionales, estado, unidades totales, monto total estimado en ARS, detalle del pedido como **snapshot** (por grupo: categoría, talla, color con nombre y hex, precio unitario, unidades, subtotal e ítems con etiqueta y cantidad) y fechas de creación y actualización. Los pedidos guardados MUST conservar sus valores aunque luego cambien precios, mínimos o catálogo.

#### Scenario: Snapshot inmutable

- **WHEN** Melizza cambia el precio de las letras Talla 2 después de recibido un pedido
- **THEN** el pedido guardado mantiene el precio y el total con los que se creó

#### Scenario: Número correlativo

- **WHEN** se crean dos pedidos consecutivos
- **THEN** reciben números `WH-1001` y `WH-1002` (o los siguientes disponibles) sin repetirse, incluso ante solicitudes simultáneas

#### Scenario: Aislamiento del retail

- **WHEN** se crea un pedido mayorista
- **THEN** no se escribe ninguna fila en `orders`, y las tablas existentes no cambian

### Requirement: Listado y detalle de pedidos mayoristas en el CMS

El sistema SHALL ofrecer en el CMS la sección **Mayorista → Pedidos** (`/admin/mayorista/pedidos`), separada de las órdenes minoristas (`/admin`), accesible solo con sesión de administrador. MUST listar los pedidos mayoristas del más reciente al más antiguo con número de pedido, referencia, teléfono, unidades, total estimado, estado y fecha; permitir buscar por número, referencia o teléfono y filtrar por estado; y abrir un detalle con el desglose completo (por categoría, talla y color, con cantidades por ítem, subtotales, notas) y un enlace para contactar al cliente por WhatsApp a su teléfono. `GET /api/wholesale/orders` MUST exigir sesión de administrador (401 sin sesión).

#### Scenario: Ver pedidos mayoristas

- **WHEN** un administrador entra a `/admin/mayorista/pedidos`
- **THEN** ve solo pedidos mayoristas, con su estado, y ninguna orden minorista

#### Scenario: Órdenes minoristas sin mezcla

- **WHEN** un administrador entra a `/admin`
- **THEN** la tabla de órdenes no incluye pedidos mayoristas

#### Scenario: Detalle con contacto

- **WHEN** el administrador abre un pedido
- **THEN** ve el detalle completo agrupado y un botón que abre `https://wa.me/<teléfono normalizado>` para contactar al cliente

#### Scenario: Sin sesión

- **WHEN** se solicita `GET /api/wholesale/orders` sin sesión
- **THEN** la respuesta es 401

### Requirement: Estados de seguimiento del pedido mayorista

Cada pedido mayorista SHALL tener un estado: `NEW` (Nuevo, inicial), `CONTACTED` (Contactado), `CLOSED` (Cerrado) o `CANCELLED` (Cancelado). El administrador MUST poder cambiar el estado desde el detalle mediante `PATCH /api/wholesale/orders/[id]` (con sesión; 404 si no existe, 400 si el estado es inválido). El cambio de estado MUST NOT modificar el snapshot del pedido ni enviar emails.

#### Scenario: Marcar como contactado

- **WHEN** el administrador cambia el estado de un pedido a "Contactado" y guarda
- **THEN** el listado y el detalle muestran el nuevo estado tras recargar

#### Scenario: Estado inválido

- **WHEN** se envía un estado fuera de los cuatro definidos
- **THEN** la API responde 400 y no modifica el pedido

### Requirement: Identificación visual de pedidos nuevos

El listado SHALL destacar los pedidos en estado `NEW` mediante su insignia de estado y mostrar el total de pedidos nuevos en el encabezado de la sección, para que Melizza identifique rápidamente los pedidos que aún no gestionó.

#### Scenario: Contador de nuevos

- **WHEN** hay 3 pedidos en estado `NEW`
- **THEN** el encabezado de la sección indica 3 pedidos nuevos

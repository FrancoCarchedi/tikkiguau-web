## ADDED Requirements

### Requirement: Reglas mayoristas independientes del retail

El sistema SHALL almacenar precios, mínimos y requisitos mayoristas en tablas propias, sin reutilizar ni modificar `product_prices`, `shipping_prices`, `orders` ni las tablas `catalog_*`. Cambiar una regla mayorista MUST NOT alterar precios, disponibilidad ni comportamiento del flujo minorista (`/disenar`, `POST /api/orders`, Mercado Pago, emails).

#### Scenario: Cambio de precio mayorista no afecta al retail

- **WHEN** un administrador cambia el precio mayorista de letras Talla 2
- **THEN** `GET /api/catalog` y los precios mostrados en `/disenar` y en la homepage permanecen idénticos

#### Scenario: Cambio de precio retail no afecta al mayorista

- **WHEN** un administrador cambia el precio de `collar` en `/admin/catalogo/precios`
- **THEN** los precios mostrados en `/mayorista` permanecen idénticos

### Requirement: Admin gestiona el precio unitario por categoría y talla

El sistema SHALL permitir a un administrador autenticado consultar y actualizar el precio unitario mayorista, en pesos argentinos (ARS) como entero sin decimales, para cada combinación de categoría (`LETTER`, `EMOJI`, `COLLAR`, `LEASH`) y talla (`1`, `2`). Existirá exactamente una regla por combinación (8 en total). El precio MUST ser un entero mayor a 0.

Los valores iniciales (seed) SHALL ser:

| Categoría | Talla 2 | Talla 1 |
|-----------|---------|---------|
| Letra | 881 | 821 |
| Emoji | 1031 | 935 |
| Collar | 10000 | 9200 |
| Correa | 13000 | 12000 |

#### Scenario: Consultar reglas en el CMS

- **WHEN** un administrador autenticado solicita las reglas de precio mayorista
- **THEN** el sistema devuelve las 8 reglas con categoría, talla, precio unitario, mínimo por color y estado activo

#### Scenario: Actualizar precio de emoji Talla 1

- **WHEN** un administrador envía `unitPriceArs: 950` para la regla `EMOJI` Talla 1
- **THEN** el sistema persiste 950 y `/mayorista` muestra ese precio a partir de la siguiente carga

#### Scenario: Precio inválido

- **WHEN** un administrador envía un precio igual a 0, negativo, decimal o no numérico
- **THEN** el sistema responde HTTP 400 con un mensaje en español y no modifica la regla

#### Scenario: Sin sesión

- **WHEN** una petición sin sesión intenta leer o modificar reglas mayoristas por la API de administración
- **THEN** el sistema responde HTTP 401

### Requirement: Admin gestiona la cantidad mínima por color

El sistema SHALL permitir configurar, por cada regla (categoría + talla), la cantidad mínima de unidades **por color** (`minUnitsPerColor`), entero mayor o igual a 0. El valor 0 MUST significar "sin mínimo por color". El valor inicial para las 8 reglas SHALL ser 25.

#### Scenario: Cambiar el mínimo por color de collares Talla 1

- **WHEN** un administrador envía `minUnitsPerColor: 10` para la regla `COLLAR` Talla 1
- **THEN** `/mayorista` exige al menos 10 unidades por cada color elegido de collares Talla 1 y no altera las demás reglas

#### Scenario: Mínimo inválido

- **WHEN** un administrador envía un mínimo negativo o decimal
- **THEN** el sistema responde HTTP 400 y no modifica la regla

### Requirement: Admin puede activar o desactivar cada categoría y talla

El sistema SHALL permitir activar o desactivar cada una de las 8 reglas. Una regla inactiva MUST NOT ofrecerse en `/mayorista`. Si ambas tallas de una categoría están inactivas, la categoría MUST ocultarse.

#### Scenario: Desactivar correas Talla 1

- **WHEN** un administrador desactiva la regla `LEASH` Talla 1
- **THEN** `/mayorista` no ofrece la talla pequeña en Correas pero sí la mediana

#### Scenario: Desactivar toda una categoría

- **WHEN** un administrador desactiva las dos tallas de `EMOJI`
- **THEN** la pestaña "Emojis" no aparece en `/mayorista`

### Requirement: Admin define los requisitos mínimos del pedido

El sistema SHALL permitir configurar, de forma independiente, dos requisitos de pedido:

- Mínimo de **unidades totales**: bandera `requireMinTotalUnits` y valor `minTotalUnits` (entero mayor a 0).
- Mínimo de **monto total estimado**: bandera `requireMinTotalAmount` y valor `minTotalAmountArs` (entero mayor a 0, en ARS).

Cada bandera MUST poder activarse o desactivarse sin perder el valor guardado. Cuando ambas banderas están activas, el pedido MUST cumplir ambos requisitos. Cuando ninguna está activa, el pedido SHALL exigir únicamente al menos una unidad. Los valores iniciales SHALL ser `requireMinTotalUnits = true`, `minTotalUnits = 250`, `requireMinTotalAmount = false`, `minTotalAmountArs = 200000`.

#### Scenario: Exigir solo unidades

- **WHEN** un administrador activa unidades (250) y desactiva monto
- **THEN** `/mayorista` valida solo el mínimo de 250 unidades y no muestra requisito de monto

#### Scenario: Exigir solo monto

- **WHEN** un administrador desactiva unidades y activa monto con `minTotalAmountArs: 300000`
- **THEN** `/mayorista` valida solo que el total estimado sea al menos $300.000

#### Scenario: Exigir ambos

- **WHEN** un administrador activa ambos requisitos
- **THEN** `/mayorista` exige que el pedido cumpla las unidades mínimas Y el monto mínimo

#### Scenario: Valor inválido con bandera activa

- **WHEN** un administrador activa un requisito con valor 0, negativo o decimal
- **THEN** el sistema responde HTTP 400 y no modifica los ajustes

#### Scenario: Conservar el valor al desactivar

- **WHEN** un administrador desactiva `requireMinTotalAmount` y luego lo reactiva sin cambiar el valor
- **THEN** el sistema conserva el `minTotalAmountArs` previo

### Requirement: Admin puede habilitar o deshabilitar la sección mayorista

El sistema SHALL ofrecer un interruptor `isEnabled`. Cuando es `false`, `/mayorista` MUST mostrar un mensaje de no disponibilidad con enlace de contacto por WhatsApp, y Navbar y Footer MUST ocultar los enlaces a la sección. El valor inicial SHALL ser `true`.

#### Scenario: Deshabilitar la sección

- **WHEN** un administrador pone `isEnabled` en `false`
- **THEN** `/mayorista` no muestra el armador de pedido y los enlaces de navegación desaparecen

### Requirement: Interfaz de administración del módulo Mayorista

El sistema SHALL ofrecer la página `/admin/mayorista`, protegida por sesión y enlazada desde el sidebar del CMS, con (a) una tabla de precios y mínimos por categoría y talla, (b) el formulario de requisitos del pedido y (c) el interruptor general. El formulario MUST validar con zod antes de enviar y MUST informar éxito o error con notificaciones.

#### Scenario: Acceso sin sesión

- **WHEN** un visitante sin sesión abre `/admin/mayorista`
- **THEN** es redirigido a `/admin/sign-in`

#### Scenario: Guardado exitoso

- **WHEN** un administrador edita precios y guarda
- **THEN** la interfaz muestra confirmación y los valores persisten tras recargar

#### Scenario: Aviso de configuración permisiva

- **WHEN** un administrador desactiva ambos requisitos de pedido
- **THEN** la interfaz muestra una advertencia de que cualquier pedido con al menos una unidad será aceptado

### Requirement: Lectura pública de la configuración vigente

El sistema SHALL exponer a `/mayorista`, sin autenticación, la configuración vigente (ajustes y reglas activas) mediante un helper de servidor. La configuración MUST leerse al cargar la página, de modo que los cambios del CMS se reflejen sin deploy.

#### Scenario: Cambio reflejado sin deploy

- **WHEN** un administrador cambia un precio y un visitante recarga `/mayorista`
- **THEN** el visitante ve el nuevo precio

#### Scenario: Base de datos no disponible

- **WHEN** la lectura de configuración falla
- **THEN** `/mayorista` muestra un estado de error con enlace de contacto por WhatsApp y MUST NOT mostrar precios por defecto hardcodeados

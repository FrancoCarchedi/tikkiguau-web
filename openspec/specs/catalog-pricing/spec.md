# catalog-pricing Specification

## Purpose
TBD - created by archiving change cms-dynamic-catalog. Update Purpose after archive.
## Requirements
### Requirement: Admin puede gestionar precios de productos en ARS

El sistema SHALL permitir a un administrador autenticado consultar y actualizar los precios de los tres productos: collar (`collar`), correa (`leash`) y combo (`both`). Cada precio MUST expresarse en pesos argentinos (ARS) como entero sin decimales, e incluir `pieces` (cantidad de piezas de personalización incluidas).

#### Scenario: Consultar precios de productos en CMS

- **WHEN** un administrador autenticado solicita los precios de productos
- **THEN** el sistema devuelve los tres tipos con monto ARS, piezas, etiqueta y descripción en español

#### Scenario: Actualizar precio de correa

- **WHEN** un administrador actualiza el precio de `leash` a un valor entero positivo
- **THEN** el sistema persiste el nuevo monto y la API pública refleja el cambio en adelante

#### Scenario: Validar monto inválido

- **WHEN** un administrador envía un precio negativo o no numérico
- **THEN** el sistema responde con HTTP 400

### Requirement: Admin puede gestionar precios de envío Correo Argentino

El sistema SHALL permitir a un administrador autenticado configurar el costo de envío para `CORREO_DOMICILIO` y `CORREO_SUCURSAL` en ARS. El retiro (`PICKUP`) MUST tener costo cero y no requiere fila editable separada (puede derivarse en código o almacenarse como 0).

#### Scenario: Actualizar costo de envío a domicilio

- **WHEN** un administrador actualiza el precio de `CORREO_DOMICILIO`
- **THEN** el checkout futuro usará ese monto al calcular el total de nuevas órdenes

#### Scenario: Retiro sin costo

- **WHEN** el sitio calcula envío para método `PICKUP`
- **THEN** el costo de envío aplicado es 0 ARS

### Requirement: Las órdenes existentes conservan snapshot de precios

El sistema MUST NOT recalcular `totalAmount` ni precios dentro de `orderItems` de órdenes ya persistidas cuando cambian los precios de catálogo.

#### Scenario: Cambio de precio no afecta órdenes históricas

- **WHEN** un administrador sube el precio del collar después de que existan órdenes con collar
- **THEN** las órdenes existentes mantienen su `totalAmount` y el detalle de `orderItems` sin modificación

### Requirement: El sitio público lee precios vigentes

El sistema SHALL exponer precios de productos y envío activos en la API pública para que la homepage y el diseñador muestren montos actualizados.

#### Scenario: Lectura pública de precios

- **WHEN** `ProductsSection` o el diseñador solicitan precios sin autenticación
- **THEN** el sistema devuelve los montos ARS actuales de productos y envíos configurados


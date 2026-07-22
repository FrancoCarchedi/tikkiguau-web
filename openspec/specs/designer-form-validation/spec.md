# designer-form-validation Specification

## Purpose

Validación de los formularios de contacto y entrega del diseñador (`/disenar`) en el cliente, alineada con la validación del `POST /api/orders`, para evitar pedidos con datos inválidos.

## Requirements

### Requirement: Datos de contacto con validación de campos

El paso de datos de contacto del diseñador SHALL validar nombre, apellido, email y teléfono antes de permitir avanzar. Las reglas MUST ser:

- **Nombre y apellido:** obligatorios, entre 2 y 60 caracteres tras trim, solo letras (Unicode, con acentos), marcas diacríticas, espacios, apóstrofos y guiones.
- **Email:** obligatorio, formato de email válido, máximo 120 caracteres.
- **Teléfono:** obligatorio; solo dígitos y símbolos telefónicos (`+`, espacios, `()`, `.`, `-`); entre 8 y 15 dígitos (ignorando no-dígitos).

#### Scenario: Email inválido

- **WHEN** el usuario ingresa un valor que no es un email válido (por ejemplo `hola@`) y sale del campo o intenta avanzar
- **THEN** el sistema muestra un mensaje de error de email y no avanza al paso de entrega

#### Scenario: Teléfono con pocos dígitos

- **WHEN** el usuario ingresa un teléfono con menos de 8 dígitos
- **THEN** el sistema muestra un error de teléfono y bloquea el avance

#### Scenario: Nombre con caracteres no permitidos

- **WHEN** el usuario ingresa un nombre con números o símbolos no permitidos
- **THEN** el sistema muestra un error de formato de nombre

#### Scenario: Datos de contacto válidos

- **WHEN** nombre, apellido, email y teléfono cumplen las reglas
- **THEN** el usuario puede avanzar al paso de entrega

### Requirement: Entrega validada según método

El paso de entrega SHALL exigir campos distintos según el método elegido:

- **PICKUP (retiro presencial):** no requiere dirección, ciudad ni código postal.
- **CORREO_DOMICILIO:** dirección (mínimo 5 caracteres), ciudad (mínimo 2) y código postal (4–12 caracteres alfanuméricos, espacios o guiones) son obligatorios.
- **CORREO_SUCURSAL:** ciudad y código postal son obligatorios con las mismas reglas; la preferencia de sucursal MAY ser opcional en UI.

#### Scenario: Retiro presencial sin dirección

- **WHEN** el usuario elige retiro presencial
- **THEN** puede avanzar sin completar campos de dirección

#### Scenario: Envío a domicilio incompleto

- **WHEN** el usuario elige envío a domicilio y deja vacía la dirección, ciudad o código postal
- **THEN** el sistema muestra errores en los campos faltantes o inválidos y no avanza

#### Scenario: Retiro por sucursal sin ciudad o CP

- **WHEN** el usuario elige retiro por sucursal sin ciudad o código postal válidos
- **THEN** el sistema bloquea el avance y muestra los errores correspondientes

### Requirement: Feedback de errores en el cliente

El diseñador SHALL mostrar errores por campo tras blur o al intentar avanzar con datos inválidos. En los pasos de contacto y entrega, el botón de avanzar MUST permanecer habilitado para que un intento fallido revele todos los errores pendientes. Los inputs inválidos SHOULD exponer `aria-invalid` y asociar el mensaje de error vía `aria-describedby`.

#### Scenario: Intento de avanzar con formulario incompleto

- **WHEN** el usuario está en datos de contacto o entrega con campos inválidos y pulsa “Siguiente”
- **THEN** permanece en el mismo paso y ve los mensajes de error de los campos inválidos

#### Scenario: Corrección tras blur

- **WHEN** el usuario corrige un campo inválido que ya fue tocado
- **THEN** el mensaje de error de ese campo desaparece cuando el valor pasa la validación

### Requirement: Validación del API alineada con el diseñador

El schema de creación de órdenes (`createOrderSchema` / `POST /api/orders`) SHALL aplicar reglas equivalentes de nombre, apellido, email, teléfono y campos de entrega según `deliveryMethod`, de modo que un payload inválido sea rechazado aunque se omita la validación del cliente.

#### Scenario: POST con email inválido

- **WHEN** un cliente envía `POST /api/orders` con un email mal formado
- **THEN** la API responde con error de validación y no crea la orden

#### Scenario: POST con domicilio incompleto

- **WHEN** un cliente envía `deliveryMethod: CORREO_DOMICILIO` sin dirección, ciudad o código postal válidos
- **THEN** la API rechaza el request con error de validación

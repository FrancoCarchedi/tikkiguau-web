## ADDED Requirements

### Requirement: Ruta pública del armador mayorista

El sistema SHALL servir `/mayorista` como página pública sin autenticación ni registro. La página MUST renderizarse con la configuración mayorista y el catálogo vigentes y MUST seguir la estética de marca TikkiGuau (sin referencias a Printonic).

#### Scenario: Visitante accede al armador

- **WHEN** un visitante abre `/mayorista` con la sección habilitada
- **THEN** ve el selector de categoría y talla, el paso de color, el paso de cantidades y el resumen "Tu pedido"

### Requirement: Selección de categoría y talla

El sistema SHALL ofrecer las categorías activas **Letras**, **Emojis**, **Collares** y **Correas**, y las tallas activas **Mediana (Talla 2)** y **Pequeña (Talla 1)**. La selección inicial MUST ser la primera categoría y talla activas. Cambiar de categoría o talla MUST conservar las cantidades ya cargadas en las demás combinaciones.

#### Scenario: Cambiar de categoría sin perder datos

- **WHEN** el usuario carga 30 letras azules Talla 2 y cambia a "Emojis"
- **THEN** las 30 letras permanecen en el pedido y el resumen las sigue contando

#### Scenario: Talla no disponible

- **WHEN** la regla de una talla está inactiva
- **THEN** el selector de talla no la ofrece

### Requirement: Paso 1 — elegir color

El sistema SHALL mostrar los colores disponibles para la categoría seleccionada:

- Letras y emojis: colores de elemento activos del catálogo (`catalog_element_colors`).
- Collares y correas: colores base activos del catálogo (`catalog_base_colors`).

El color elegido MUST mostrarse resaltado y MUST indicar la combinación activa (por ejemplo "Azul · Mediana · Letras A–Z") y el mínimo vigente por color (por ejemplo "mín. 25 u por color"). El color inicial SHALL ser el primero disponible.

#### Scenario: Elegir color de letras

- **WHEN** el usuario selecciona el color "Azul" en Letras
- **THEN** la grilla de cantidades muestra las letras en azul y se indica "mín. 25 u por color"

#### Scenario: Color con unidades cargadas

- **WHEN** un color tiene unidades cargadas en la combinación actual
- **THEN** su muestra de color exhibe un indicador con el subtotal de unidades de ese color

### Requirement: Paso 2 — cargar cantidades

Para **Letras**, el sistema SHALL mostrar un contador por cada letra activa del catálogo, respetando que la letra permita el color elegido. Para **Emojis**, un contador por cada emoji activo disponible en la talla elegida (`availableSizes`) que permita el color elegido, con su vista previa en el color elegido. Para **Collares** y **Correas**, un único contador para la combinación talla + color.

Los contadores MUST aceptar incrementos, decrementos y edición numérica directa, MUST NOT permitir valores negativos ni decimales y MUST limitar el valor a un máximo de 9999 por ítem.

#### Scenario: Incrementar una letra

- **WHEN** el usuario pulsa "+" en la letra "A"
- **THEN** la cantidad de "A" sube en 1 y el resumen se actualiza

#### Scenario: Edición numérica directa

- **WHEN** el usuario escribe 40 en el contador de "B"
- **THEN** la cantidad de "B" pasa a 40

#### Scenario: Entrada inválida

- **WHEN** el usuario escribe un valor negativo o no numérico
- **THEN** el contador conserva el último valor válido

#### Scenario: Letra que no permite el color

- **WHEN** la letra "Q" no tiene el color elegido entre sus colores permitidos en el catálogo
- **THEN** su contador no se ofrece para ese color

#### Scenario: Emoji no disponible en la talla

- **WHEN** el emoji "pez" solo está disponible en Talla 1 y la talla elegida es Talla 2
- **THEN** el emoji no aparece en la grilla

#### Scenario: Collar liso

- **WHEN** el usuario elige Collares, Talla 2, color Rojo
- **THEN** ve un único contador "Collar Talla 2 · Rojo" y ninguna grilla de letras o emojis

### Requirement: Cálculo del pedido

El sistema SHALL calcular en tiempo real: unidades totales, subtotal por combinación (categoría, talla, color) y total estimado en ARS, como suma de `cantidad × precio unitario` de la regla correspondiente. El total MUST ser un entero sin decimales y MUST NOT incluir envío ni impuestos. El monto se presenta como **estimado**.

#### Scenario: Total estimado

- **WHEN** el pedido tiene 30 letras Talla 2 y 25 emojis Talla 1
- **THEN** el total estimado es 30 × 881 + 25 × 935 = 49.805 ARS

#### Scenario: Pedido vacío

- **WHEN** no hay unidades cargadas
- **THEN** el precio estimado muestra "—" y se muestra el estado vacío con la guía para comenzar

### Requirement: Validación del mínimo por color

Para cada combinación (categoría, talla, color) con al menos una unidad, el sistema SHALL sumar las unidades de todos sus ítems y MUST marcarla como incumplida si la suma es menor que `minUnitsPerColor`. Las combinaciones sin unidades MUST NOT considerarse incumplidas. Si `minUnitsPerColor` es 0, la combinación siempre cumple.

#### Scenario: Suma de letras del mismo color

- **WHEN** el usuario carga 10 de "A", 10 de "B" y 5 de "C", todas azules Talla 2, con mínimo 25
- **THEN** la combinación suma 25 unidades y cumple el mínimo

#### Scenario: Color por debajo del mínimo

- **WHEN** el usuario carga 10 letras rojas Talla 2, con mínimo 25
- **THEN** la combinación se marca incumplida y se indica que faltan 15 unidades

#### Scenario: Colores separados por talla y categoría

- **WHEN** el usuario carga 20 letras azules Talla 2 y 20 letras azules Talla 1
- **THEN** ambas combinaciones se evalúan por separado y ambas quedan incumplidas

### Requirement: Validación de los requisitos del pedido

El sistema SHALL evaluar los requisitos configurados en el CMS:

- Si `requireMinTotalUnits` es verdadero, las unidades totales MUST ser mayores o iguales a `minTotalUnits`.
- Si `requireMinTotalAmount` es verdadero, el total estimado MUST ser mayor o igual a `minTotalAmountArs`.
- Si ambos están activos, MUST cumplirse ambos.
- Si ninguno está activo, MUST haber al menos una unidad.

El resumen SHALL mostrar, solo para los requisitos activos, el progreso y lo que falta (por ejemplo "Bajo mínimo — faltan 250 u para pedir"). Los requisitos desactivados MUST NOT mostrarse.

#### Scenario: Bajo el mínimo de unidades

- **WHEN** el requisito de unidades es 250 y el pedido tiene 100
- **THEN** el resumen indica "faltan 150 u"

#### Scenario: Bajo el mínimo de monto

- **WHEN** el requisito de monto es $300.000 y el total estimado es $250.000
- **THEN** el resumen indica que faltan $50.000

#### Scenario: Requisito desactivado oculto

- **WHEN** el requisito de monto está desactivado
- **THEN** el resumen no muestra ninguna referencia a un monto mínimo

#### Scenario: Pedido válido

- **WHEN** todas las combinaciones con unidades cumplen su mínimo por color y se cumplen los requisitos activos
- **THEN** el pedido se considera válido y el resumen muestra el estado de cumplimiento

### Requirement: Resumen lateral "Tu pedido"

El sistema SHALL mostrar un resumen persistente (columna lateral en escritorio; bloque inferior con barra resumen fija en móvil) con: unidades totales, estado de los requisitos, precio estimado, detalle por combinación con subtotal y estado del mínimo por color (cumple / faltan N), campo **Referencia del pedido** (obligatorio, 3 a 80 caracteres), campo **Notas** (opcional, hasta 500 caracteres) y la acción de envío.

#### Scenario: Detalle por combinación

- **WHEN** el pedido incluye letras azules y emojis rojos
- **THEN** el resumen lista ambas combinaciones con unidades, subtotal y estado del mínimo

#### Scenario: Quitar una combinación

- **WHEN** el usuario pulsa "Quitar" en una combinación del resumen
- **THEN** todas las cantidades de esa combinación vuelven a 0

#### Scenario: Referencia obligatoria

- **WHEN** el pedido es válido pero la referencia está vacía
- **THEN** la acción de envío permanece deshabilitada e indica que falta la referencia

### Requirement: Persistencia local del borrador

El sistema SHOULD conservar el borrador del pedido (cantidades, referencia y notas) en el navegador del usuario, para sobrevivir a una recarga. Al restaurarlo, el sistema MUST descartar los ítems cuya categoría, talla, color o elemento ya no estén disponibles. El sistema MUST ofrecer una acción "Vaciar pedido" con confirmación.

#### Scenario: Recarga de la página

- **WHEN** el usuario carga cantidades y recarga la página
- **THEN** las cantidades, la referencia y las notas se restauran

#### Scenario: Ítem retirado del catálogo

- **WHEN** una letra del borrador fue desactivada en el CMS
- **THEN** esa letra se descarta al restaurar y el resumen refleja el cambio

### Requirement: Estados de no disponibilidad

El sistema MUST mostrar un mensaje claro con enlace de contacto por WhatsApp cuando la sección esté deshabilitada, no haya categorías activas o la configuración no pueda cargarse.

#### Scenario: Sección deshabilitada

- **WHEN** `isEnabled` es `false`
- **THEN** `/mayorista` muestra el mensaje de no disponibilidad y no renderiza el armador

### Requirement: Accesibilidad y uso móvil

El armador SHALL ser utilizable desde 360 px de ancho. Los controles MUST ser operables con teclado, los contadores MUST tener etiquetas accesibles (por ejemplo "Aumentar cantidad de A") y los colores MUST ofrecer nombre accesible además del tono.

#### Scenario: Uso en móvil

- **WHEN** el usuario abre `/mayorista` en un viewport de 360 px
- **THEN** puede completar color, cantidades y envío sin scroll horizontal de la página

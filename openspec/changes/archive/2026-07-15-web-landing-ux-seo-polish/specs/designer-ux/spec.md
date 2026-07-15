## ADDED Requirements

### Requirement: Márgenes horizontales del diseñador en mobile

El contenedor principal de `/disenar` SHALL aplicar padding horizontal en mobile (`px-3` o equivalente) para que la card blanca no toque los bordes de la pantalla. La card SHOULD tener bordes redondeados visibles en mobile.

#### Scenario: Diseñador en teléfono

- **WHEN** el usuario abre `/disenar` en un viewport estrecho
- **THEN** ve margen entre el borde de la pantalla y el contenedor blanco del stepper

### Requirement: Encabezados de pasos alineados según breakpoint

Los títulos y subtítulos de cada paso del diseñador (producto, colores, diseño, carrito, datos, entrega, confirmación) SHALL usar alineación izquierda en mobile y centrado desde `md`, consistente con la landing.

#### Scenario: Paso producto en mobile

- **WHEN** el usuario está en el primer paso en mobile
- **THEN** "¿Qué querés personalizar?" y su subtítulo están alineados a la izquierda

#### Scenario: Paso producto en desktop

- **WHEN** el mismo paso se ve en desktop
- **THEN** título y subtítulo están centrados

#### Scenario: Pantalla de éxito

- **WHEN** el pedido fue confirmado exitosamente
- **THEN** el mensaje de confirmación MAY permanecer centrado (estado final, no paso de formulario)

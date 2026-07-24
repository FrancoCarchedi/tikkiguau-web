## ADDED Requirements

### Requirement: Correa admite letras y emojis

El paso de diseño de correa del diseñador SHALL ofrecer el teclado de letras del catálogo activo (mismas letras habilitadas que el collar) además de los emojis disponibles para la talla seleccionada. Los límites de cantidad MUST seguir siendo los de correa (`MIN_LEASH_ELEMENTS` / `MAX_LEASH_ELEMENTS`).

#### Scenario: Teclado de letras en diseño de correa

- **WHEN** el usuario está en el paso de diseño de correa
- **THEN** ve el teclado de letras activas del catálogo y puede agregar una letra como elemento

#### Scenario: Mezcla de letras y emojis en correa

- **WHEN** el usuario agrega letras y emojis a la correa dentro del máximo permitido
- **THEN** la vista previa y el carrito muestran ambos tipos de elementos en el orden elegido

#### Scenario: Copy del paso alineado

- **WHEN** el usuario ve el subtítulo del paso de diseño de correa
- **THEN** el texto menciona letras y emojis (no solo emojis)

### Requirement: Guía de personalización aplica a correa

La guía “Cómo personalizar” en el editor de elementos SHALL indicar que se pueden tocar letras o emojis cuando el modo es correa, igual que en collar.

#### Scenario: Texto de la guía en correa

- **WHEN** el usuario está personalizando una correa
- **THEN** la guía dice que puede tocar las letras o los emojis para agregarlos

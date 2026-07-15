## ADDED Requirements

### Requirement: Navegación in-page sin hash en URL

El sistema SHALL navegar entre secciones de la landing mediante scroll programático (`scrollToSection`) sin modificar el hash de la URL. El offset MUST compensar la altura del navbar fijo.

#### Scenario: Click en enlace del navbar

- **WHEN** el usuario hace clic en "Productos" en el navbar
- **THEN** la página hace scroll suave a `#productos` sin que la URL muestre `/#productos`

#### Scenario: Footer y hero

- **WHEN** el usuario activa un enlace de sección desde Footer o el botón "Ver productos" del Hero
- **THEN** el scroll se comporta igual que desde el navbar

### Requirement: Hero responsive con banner mobile dedicado

En viewports menores a `md`, el Hero SHALL mostrar `hero__banner_mobile.png` anclado al borde inferior (`object-bottom`) con copy y CTAs en la zona superior. En `md` y superiores SHALL usar el banner desktop existente con overlay degradé.

#### Scenario: Hero en mobile

- **WHEN** el viewport es mobile
- **THEN** el texto y botones quedan sobre el área roja superior y los perros visibles en la parte inferior

#### Scenario: CTA principal sin hover discordante

- **WHEN** el usuario pasa el mouse sobre "Diseñar mi collar" en el Hero
- **THEN** el fondo permanece blanco y el texto rojo de marca (sin transición a colores del variant default del botón)

### Requirement: Galería con grilla uniforme

La sección Galería SHALL renderizar todas las celdas con el mismo tamaño visual usando `aspect-[4/5]` y `object-cover`. En mobile MUST usar 2 columnas; en desktop large MUST usar 3 columnas. No MUST haber celdas spanning múltiples filas/columnas ni aspect ratios distintos por ítem.

#### Scenario: Grilla mobile

- **WHEN** el usuario ve la galería en un teléfono
- **THEN** observa una grilla de 2 columnas con celdas del mismo alto relativo

#### Scenario: Sin espacios vacíos por mosaico

- **WHEN** se renderiza la galería en cualquier breakpoint
- **THEN** no quedan huecos irregulares propios de un layout mosaic irregular

### Requirement: Encabezados de sección alineados según breakpoint

Los títulos y subtítulos de las secciones públicas (Productos, Galería, Medidas, Envíos, Testimonios, FAQ) SHALL alinearse a la izquierda en mobile y centrarse desde `md`.

#### Scenario: Header en mobile

- **WHEN** el viewport es menor a `md`
- **THEN** el bloque título + subtítulo de cada sección está alineado a la izquierda

#### Scenario: Header en desktop

- **WHEN** el viewport es `md` o mayor
- **THEN** el mismo bloque está centrado horizontalmente

### Requirement: Subtítulos de sección con tipografía consistente

Los subtítulos descriptivos bajo el `h2` de cada sección SHALL usar el tamaño base (`text-zinc-500`) sin `text-lg`, salvo estilos específicos de componentes internos (cards, pasos, etc.).

#### Scenario: Paridad Productos y Galería

- **WHEN** el usuario compara subtítulos de Productos, Galería y Testimonios en desktop
- **THEN** percibe el mismo tamaño tipográfico en los párrafos introductorios

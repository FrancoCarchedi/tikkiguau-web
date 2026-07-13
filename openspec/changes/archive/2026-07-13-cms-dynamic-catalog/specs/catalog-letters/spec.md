## ADDED Requirements

### Requirement: El abecedario A–Z es fijo en el sistema

El sistema SHALL mantener exactamente 26 letras (A–Z). Las letras MUST NOT crearse ni eliminarse desde el CMS; solo se configuran sus colores permitidos y estado activo.

#### Scenario: Seed inicial de letras

- **WHEN** se ejecuta el seed de catálogo en una base vacía
- **THEN** el sistema crea las 26 letras con la configuración de colores derivada de `ELEMENT_COLORS` en `types/collar.ts`

### Requirement: Admin puede configurar colores permitidos por letra

El sistema SHALL permitir a un administrador autenticado asignar qué colores de la paleta de elementos están habilitados para cada letra A–Z. Una letra MUST referenciar solo colores de elemento existentes.

#### Scenario: Actualizar colores de una letra

- **WHEN** un administrador autenticado actualiza los colores permitidos de la letra "M"
- **THEN** el sistema persiste la relación letra–colores y el diseñador solo ofrece esos colores al elegir la letra "M"

#### Scenario: Activar o desactivar una letra

- **WHEN** un administrador desactiva una letra
- **THEN** esa letra deja de aparecer como opción en el diseñador público, sin eliminarse de la base de datos

#### Scenario: Acceso no autorizado

- **WHEN** un usuario sin sesión intenta modificar la configuración de letras
- **THEN** el sistema responde con HTTP 401

### Requirement: El sitio público solo ve letras activas con colores activos

El sistema SHALL exponer en la API pública únicamente letras con `isActive: true`, cada una con la lista de colores de elemento activos asignados.

#### Scenario: Lectura pública de letras

- **WHEN** el diseñador solicita letras disponibles sin autenticación
- **THEN** el sistema devuelve solo letras activas y, para cada una, solo colores de elemento activos vinculados

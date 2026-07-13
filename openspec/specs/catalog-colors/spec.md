# catalog-colors Specification

## Purpose
TBD - created by archiving change cms-dynamic-catalog. Update Purpose after archive.
## Requirements
### Requirement: Admin puede gestionar colores base de collar y correa

El sistema SHALL permitir a un administrador autenticado crear, listar, editar y desactivar colores base usados para el material del collar y la correa. Cada color MUST tener `name` (etiqueta en español), `hexValue` (formato `#RRGGBB`), `isActive` y `sortOrder`.

#### Scenario: Listar colores base en el CMS

- **WHEN** un administrador autenticado solicita la lista de colores base
- **THEN** el sistema devuelve todos los colores base ordenados por `sortOrder`, incluyendo inactivos

#### Scenario: Crear color base

- **WHEN** un administrador autenticado envía un color base válido con nombre y hex únicos
- **THEN** el sistema persiste el color y lo devuelve con estado `isActive: true` por defecto

#### Scenario: Desactivar color base

- **WHEN** un administrador autenticado desactiva un color base existente
- **THEN** el color permanece en la base de datos con `isActive: false` y deja de exponerse en la API pública

#### Scenario: Acceso no autorizado

- **WHEN** un usuario sin sesión intenta crear o modificar colores base
- **THEN** el sistema responde con HTTP 401

### Requirement: Admin puede gestionar la paleta de colores para elementos

El sistema SHALL permitir a un administrador autenticado gestionar los colores disponibles para letras y emojis (paleta de elementos). Cada color de elemento MUST tener `hexValue` único, `isActive` y `sortOrder`.

#### Scenario: Listar colores de elementos en el CMS

- **WHEN** un administrador autenticado solicita la paleta de colores de elementos
- **THEN** el sistema devuelve todos los colores de elemento, activos e inactivos

#### Scenario: Desactivar color de elemento

- **WHEN** un administrador desactiva un color de elemento
- **THEN** ese color deja de estar disponible para nuevas selecciones en el diseñador, pero los diseños ya guardados en `orderItems` conservan el valor snapshot

### Requirement: El sitio público solo ve colores activos

El sistema SHALL exponer únicamente colores base y de elemento con `isActive: true` en los endpoints públicos de catálogo, ordenados por `sortOrder`.

#### Scenario: Lectura pública de colores activos

- **WHEN** el sitio web o diseñador solicita el catálogo público sin autenticación
- **THEN** el sistema devuelve solo colores con `isActive: true`


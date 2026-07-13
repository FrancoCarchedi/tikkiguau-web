# catalog-emojis Specification

## Purpose
TBD - created by archiving change cms-dynamic-catalog. Update Purpose after archive.
## Requirements
### Requirement: Admin puede gestionar emojis personalizados

El sistema SHALL permitir a un administrador autenticado crear, listar, editar, desactivar y eliminar emojis personalizados. Cada emoji MUST tener `key` (identificador único en kebab-case o slug, ej. `patitas`), `label` (nombre en español para UI), `svgMarkup` (contenido SVG válido) e `isActive`.

#### Scenario: Crear emoji con SVG

- **WHEN** un administrador autenticado crea un emoji con `key`, `label` y archivo SVG válido que no existen
- **THEN** el sistema persiste el emoji con el SVG almacenado y `isActive: true` por defecto

#### Scenario: Rechazar key duplicada

- **WHEN** un administrador intenta crear un emoji con una `key` ya existente
- **THEN** el sistema responde con HTTP 409

#### Scenario: Editar emoji existente

- **WHEN** un administrador actualiza el `label`, el SVG o los colores de un emoji existente
- **THEN** el sistema persiste los cambios y el diseñador refleja el emoji actualizado para nuevos diseños

#### Scenario: Desactivar emoji

- **WHEN** un administrador desactiva un emoji
- **THEN** el emoji deja de exponerse en la API pública pero permanece en BD para referencia histórica

#### Scenario: Eliminar emoji

- **WHEN** un administrador elimina un emoji que ya no desea ofrecer
- **THEN** el sistema elimina el registro del catálogo sin modificar `orderItems` de órdenes existentes

### Requirement: Admin puede asignar colores permitidos por emoji

El sistema SHALL permitir configurar qué colores de la paleta de elementos están habilitados para cada emoji, de forma análoga a las letras.

#### Scenario: Actualizar colores de un emoji

- **WHEN** un administrador actualiza los colores del emoji `corazon`
- **THEN** el diseñador solo ofrece esos colores al seleccionar ese emoji

### Requirement: Los SVG de emojis se almacenan en el catálogo

El sistema SHALL persistir el contenido SVG de cada emoji en la base de datos (campo `svgMarkup`). El diseñador MUST renderizar emojis desde ese markup dinámico, aplicando el color de personalización seleccionado. El sistema MUST validar que el archivo subido sea SVG seguro antes de persistirlo.

#### Scenario: Subir SVG inválido

- **WHEN** un administrador intenta crear o editar un emoji con un archivo que no es SVG válido
- **THEN** el sistema responde con HTTP 400 y no persiste el cambio

#### Scenario: Render dinámico en el diseñador

- **WHEN** el diseñador muestra un emoji activo con `svgMarkup` almacenado
- **THEN** el sistema renderiza el SVG aplicando el color de elemento elegido por el usuario

### Requirement: El sitio público solo ve emojis activos

El sistema SHALL exponer en la API pública únicamente emojis con `isActive: true`, `svgMarkup` presente y colores de elemento activos asignados, ordenados por `sortOrder`.

#### Scenario: Lectura pública de emojis

- **WHEN** el diseñador solicita emojis sin autenticación
- **THEN** el sistema devuelve solo emojis activos con su SVG y colores activos asignados


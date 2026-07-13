## ADDED Requirements

### Requirement: API pública agregada de catálogo

El sistema SHALL exponer un endpoint público `GET /api/catalog` (o equivalente documentado) que devuelva en una sola respuesta el catálogo activo: colores base, colores de elemento, letras con colores, emojis con colores y SVG, precios de productos y precios de envío. El endpoint MUST NOT requerir autenticación.

#### Scenario: Respuesta exitosa del catálogo público

- **WHEN** cualquier cliente realiza `GET /api/catalog`
- **THEN** el sistema responde HTTP 200 con JSON que incluye solo ítems activos, ordenados según `sortOrder` donde aplique

#### Scenario: Caché y revalidación

- **WHEN** el catálogo se actualiza desde el CMS
- **THEN** las peticiones públicas subsiguientes reflejan los cambios (sin caché stale indefinido; usar `Cache-Control` razonable o revalidación en cliente vía TanStack Query en admin y fetch en público)

### Requirement: API admin protegida por recurso

El sistema SHALL exponer rutas admin bajo `app/api/catalog/` (o subrutas por recurso) que requieran sesión Better Auth para operaciones de escritura (`POST`, `PATCH`, `PUT`, `DELETE`). Las lecturas admin MAY incluir ítems inactivos.

#### Scenario: Escritura sin sesión

- **WHEN** un cliente no autenticado envía `PATCH` a una ruta admin de catálogo
- **THEN** el sistema responde HTTP 401

#### Scenario: Lectura admin con ítems inactivos

- **WHEN** un administrador autenticado lista colores desde la ruta admin
- **THEN** la respuesta incluye registros con `isActive: false`

### Requirement: Validación de payloads con zod

Todas las rutas de escritura del catálogo MUST validar el body con esquemas zod y devolver HTTP 400 con mensaje en español ante datos inválidos.

#### Scenario: Payload inválido en creación de color

- **WHEN** un administrador envía un `hexValue` con formato incorrecto
- **THEN** el sistema responde HTTP 400 sin persistir el registro

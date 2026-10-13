## ADDED Requirements

### Requirement: Metadata y sitemap de la ruta mayorista

El sistema SHALL definir `metadata` propia para `/mayorista` (título, descripción en español, `canonical` y Open Graph) e incluir la URL en `sitemap.xml` mientras la sección esté publicada. La ruta MUST NOT quedar bloqueada por `robots.txt`.

#### Scenario: Ruta mayorista en el sitemap

- **WHEN** un cliente solicita `GET /sitemap.xml`
- **THEN** la respuesta incluye `https://tikkiguau.com/mayorista`

#### Scenario: Metadata propia

- **WHEN** se inspecciona el `<head>` de `/mayorista`
- **THEN** el título, la descripción y la URL canónica corresponden a la venta mayorista

### Requirement: La home no enlaza a la sección mayorista

La home (`/`) MUST NOT mostrar enlaces a `/mayorista` en el Navbar (escritorio y móvil), en el Footer ni en ninguna otra sección. El acceso a la sección SHALL ser por URL directa. La ruta MUST seguir siendo pública, indexable y presente en el sitemap.

#### Scenario: Navbar sin enlace mayorista

- **WHEN** se inspecciona el Navbar de la home con la sección mayorista habilitada
- **THEN** no existe ningún enlace a `/mayorista`

#### Scenario: Footer sin enlace mayorista

- **WHEN** se inspecciona el Footer de la home con la sección mayorista habilitada
- **THEN** no existe ningún enlace a `/mayorista`

#### Scenario: Acceso por URL directa

- **WHEN** un cliente abre `https://tikkiguau.com/mayorista`
- **THEN** la página carga el armador de pedido normalmente

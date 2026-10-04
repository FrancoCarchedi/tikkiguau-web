## ADDED Requirements

### Requirement: Metadata y sitemap de la ruta mayorista

El sistema SHALL definir `metadata` propia para `/mayorista` (título, descripción en español, `canonical` y Open Graph) e incluir la URL en `sitemap.xml` mientras la sección esté publicada. La ruta MUST NOT quedar bloqueada por `robots.txt`.

#### Scenario: Ruta mayorista en el sitemap

- **WHEN** un cliente solicita `GET /sitemap.xml`
- **THEN** la respuesta incluye `https://tikkiguau.com/mayorista`

#### Scenario: Metadata propia

- **WHEN** se inspecciona el `<head>` de `/mayorista`
- **THEN** el título, la descripción y la URL canónica corresponden a la venta mayorista

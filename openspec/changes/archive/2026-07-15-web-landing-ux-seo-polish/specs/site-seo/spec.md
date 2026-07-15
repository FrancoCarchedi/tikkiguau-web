## ADDED Requirements

### Requirement: Metadata global del sitio público

El sistema SHALL exportar metadata completa desde `app/layout.tsx` con `metadataBase` apuntando al dominio de producción (`https://tikkiguau.com`), título con template, descripción, keywords, autores, Open Graph (`type: website`, `locale: es_AR`), Twitter Card (`summary_large_image`), canonical de la home, e instrucciones de indexación para buscadores.

#### Scenario: Vista previa en redes sociales

- **WHEN** un usuario comparte la URL de la home en WhatsApp, Facebook o Twitter
- **THEN** el preview muestra título, descripción e imagen OG absoluta derivada de `metadataBase`

#### Scenario: Idioma y región

- **WHEN** un crawler lee el documento HTML de la home
- **THEN** el elemento `<html>` usa `lang="es-AR"` y Open Graph declara `locale: es_AR`

### Requirement: Datos estructurados de organización

El sistema SHALL incluir JSON-LD con entidades `Organization` y `WebSite` en el layout raíz, referenciando logo, URL, Instagram y punto de contacto por WhatsApp.

#### Scenario: Rich results de marca

- **WHEN** Google procesa la home
- **THEN** encuentra schema.org `Organization` y `WebSite` válidos en `application/ld+json`

### Requirement: Robots y sitemap

El sistema SHALL servir `robots.txt` y `sitemap.xml` mediante Metadata Routes de Next.js. El sitemap MUST incluir al menos `/` y `/disenar`. Robots MUST permitir el sitio público y MUST disallow `/admin` y `/api`.

#### Scenario: Sitemap accesible

- **WHEN** un cliente solicita `GET /sitemap.xml`
- **THEN** recibe URLs absolutas de la home y `/disenar` con `lastModified`

#### Scenario: Admin no indexable

- **WHEN** un crawler accede a rutas bajo `/admin`
- **THEN** la metadata de esas páginas indica `noindex, nofollow`

### Requirement: Metadata por ruta del diseñador

La ruta `/disenar` SHALL definir título, descripción y canonical propios, heredando Open Graph del layout cuando no se sobrescriban campos adicionales.

#### Scenario: Página diseñador en sitemap

- **WHEN** se consulta el sitemap
- **THEN** incluye la URL `/disenar` con prioridad menor que la home

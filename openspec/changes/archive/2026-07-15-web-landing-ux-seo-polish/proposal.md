## Why

La landing y el diseñador ya están en producción, pero faltaban piezas clave de descubrimiento (SEO y previews en redes), navegación fluida sin hashes en la URL, y ajustes de layout mobile que mejoran legibilidad y consistencia visual. Estos refinamientos reducen fricción en mobile, mejoran el posicionamiento en buscadores y unifican la presentación de secciones antes del lanzamiento comercial.

## What Changes

- Metadata SEO completa en `app/layout.tsx`: `metadataBase`, Open Graph, Twitter Cards, canonical, robots, keywords, JSON-LD (Organization + WebSite).
- `app/robots.ts` y `app/sitemap.ts` para indexación de `/` y `/disenar`; `/admin` con `noindex`.
- Navegación in-page sin hash: helper `scrollToSection` en Navbar, Footer y Hero (URL limpia, scroll suave con offset del navbar).
- Hero mobile con banner dedicado `hero__banner_mobile.png` (perros abajo, copy arriba); desktop conserva `hero__banner.png`.
- CTA principal del Hero sin cambio de color en hover (fondo y texto estables).
- Galería con grilla uniforme: celdas `aspect-[4/5]`, `object-cover`, 2 columnas en mobile y 3 en desktop (sin mosaico irregular).
- Encabezados de sección: título y subtítulo alineados a la izquierda en mobile, centrados desde `md` (landing y pasos del diseñador).
- Subtítulos de Productos y Galería normalizados al mismo tamaño que el resto de secciones (`text-zinc-500`, sin `text-lg`).
- Diseñador: márgenes horizontales en mobile (`px-3`) y card con bordes redondeados.

## Capabilities

### New Capabilities

- `site-seo`: Metadata esencial, Open Graph/Twitter, robots, sitemap y exclusión de `/admin` del índice.
- `landing-ux`: Layout y tipografía de secciones públicas, hero responsive, galería uniforme y navegación in-page.
- `designer-ux`: Espaciado mobile y alineación de encabezados en el flujo `/disenar`.

### Modified Capabilities

_(ninguna — las specs de catálogo no cambian en requisitos funcionales)_

## Impact

- **Archivos:** `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/admin/layout.tsx`, `app/disenar/page.tsx`, `lib/scroll-to-section.ts`, `components/web/*` (Hero, Navbar, Footer, GallerySection, ProductsSection, SizesSection, ShippingSection, TestimonialsSection, FAQSection), `components/designer/DesignerPage.tsx`, `components/designer/steps/*`.
- **Assets:** `public/images/hero__banner_mobile.png` (nuevo).
- **APIs / BD:** sin cambios.
- **tikkiguau-tiendas:** fuera de alcance.

## Non-goals

- Cambiar copy de FAQ, testimonios o textos de negocio (solo layout/SEO).
- Generar imagen OG dedicada distinta del hero (se reutiliza `hero__banner.png`).
- Modificar flujo de checkout, catálogo CMS o app de tiendas.
- Implementar analytics, hreflang multi-país o blog.

## Impacto en datos existentes

- Sin impacto en base de datos ni en órdenes existentes.
- Cambios solo en frontend, metadata estática y archivos de rutas Next.js (`robots`, `sitemap`).

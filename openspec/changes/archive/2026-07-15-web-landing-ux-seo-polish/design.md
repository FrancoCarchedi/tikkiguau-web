## Context

El sitio público (`tikkiguau.com`) usa Next.js App Router con metadata mínima en `layout.tsx` y secciones en `components/web/`. La navegación interna usaba anchors `#seccion`, lo que alteraba la URL. En mobile, el hero desktop recortaba mal el copy y la galería tenía un mosaico con celdas de distintos tamaños. El diseñador (`/disenar`) compartía patrones de UI pero sin márgenes laterales en pantallas chicas.

## Goals / Non-Goals

**Goals:**

- Exponer metadata SEO y social share completa desde el layout raíz.
- Generar `robots.txt` y `sitemap.xml` vía convenciones de Next.js Metadata Routes.
- Navegación in-page por TypeScript sin modificar `window.location.hash`.
- Hero mobile con arte dedicado y copy legible en la zona superior roja.
- Grilla de galería uniforme y tipografía de secciones consistente.
- Alineación responsive de títulos/subtítulos (izquierda mobile, centro desktop).
- Mejorar contenedor del diseñador en viewports estrechos.

**Non-goals:**

- Nuevas rutas de contenido, CMS de imágenes de galería, o A/B testing.
- SEO técnico avanzado (structured data de Product, breadcrumbs, FAQ schema).
- Cambios en `tikkiguau-tiendas`.

## Decisions

### 1. Metadata centralizada en `app/layout.tsx`

**Decisión:** Un único objeto `metadata` exportado con `metadataBase: https://tikkiguau.com`, template de título, Open Graph, Twitter, robots y JSON-LD embebido en el layout.

**Alternativa descartada:** `next/head` por página — más fragmentado y duplica OG en cada ruta pública.

### 2. `robots.ts` + `sitemap.ts` (Metadata Routes)

**Decisión:** Archivos en `app/` que Next genera automáticamente. Sitemap incluye `/` y `/disenar`. Robots bloquea `/admin` y `/api`.

**Alternativa descartada:** `public/robots.txt` estático — no se actualiza con rutas dinámicas ni host.

### 3. Scroll in-page sin hash

**Decisión:** `lib/scroll-to-section.ts` usa `element.getBoundingClientRect()` + `window.scrollTo({ behavior: 'smooth' })` con offset de 64px (altura navbar). Navbar, Footer y Hero usan `<button>` o handlers en lugar de `<a href="#...">`.

**Alternativa descartada:** Mantener anchors — altera URL y no es necesario para SEO de secciones en SPA-like landing.

### 4. Hero dual image (mobile / desktop)

**Decisión:** Dos `<Image fill>` con visibilidad condicional (`md:hidden` / `md:block`). Mobile: `hero__banner_mobile.png` con `object-bottom`. Desktop: banner original con overlay degradé lateral.

**Alternativa descartada:** Una sola imagen con `object-position` — no resolvía la composición con espacio vacío arriba en mobile.

### 5. Galería uniforme

**Decisión:** Reemplazar mosaico CSS Grid irregular por `grid-cols-2 lg:grid-cols-3` con celdas `aspect-[4/5]` y `object-cover`, inspirado en patrón de galería de referencia.

**Alternativa descartada:** Mantener mosaic — dejaba huecos y aspect ratios inconsistentes.

### 6. Tipografía de secciones

**Decisión:** Clase compartida `text-left md:text-center` en contenedores de encabezado. Subtítulos con `text-zinc-500` (tamaño base), `max-w-xl mx-auto`, `mb-4` en título donde aplica.

### 7. Diseñador mobile

**Decisión:** Wrapper externo `px-3`, card `rounded-2xl` en todos los breakpoints del contenedor blanco.

## Risks / Trade-offs

- **[OG image pesada]** → `hero__banner.png` es grande; aceptable para MVP; futuro: asset OG 1200×630 optimizado.
- **[JSON-LD estático]** → Teléfono/WhatsApp hardcodeados; si cambian contactos, actualizar layout.
- **[Sitemap mínimo]** → Solo 2 URLs; suficiente hoy; agregar rutas si crece el sitio.
- **[Galería crop]** → `object-cover` puede recortar fotos; trade-off por grilla uniforme.

## Migration Plan

1. Deploy de assets (`hero__banner_mobile.png`) y cambios en `components/web/`.
2. Verificar en producción: `/robots.txt`, `/sitemap.xml`, view-source de metadata OG.
3. Validar previews: Facebook Sharing Debugger / WhatsApp link preview.
4. Smoke test mobile: hero, galería 2 cols, scroll nav, diseñador con márgenes.

## Open Questions

- ¿Generar imagen OG dedicada (1200×630) con logo y copy, separada del hero?
- ¿Agregar FAQ structured data (`FAQPage`) en una iteración SEO posterior?

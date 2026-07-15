## 1. SEO y metadata

- [x] 1.1 Enriquecer `app/layout.tsx` con metadataBase, OG, Twitter, keywords, robots, icons, JSON-LD
- [x] 1.2 Crear `app/robots.ts` (allow `/`, disallow `/admin` y `/api`)
- [x] 1.3 Crear `app/sitemap.ts` (`/` y `/disenar`)
- [x] 1.4 Agregar `app/admin/layout.tsx` con `noindex`
- [x] 1.5 Metadata específica en `app/disenar/page.tsx` (title, canonical, OG)

## 2. Navegación in-page

- [x] 2.1 Crear `lib/scroll-to-section.ts` con offset del navbar
- [x] 2.2 Migrar Navbar y Footer a botones con `scrollToSection`
- [x] 2.3 Migrar CTA "Ver productos" del Hero a `scrollToSection`

## 3. Landing — Hero y galería

- [x] 3.1 Agregar asset `public/images/hero__banner_mobile.png`
- [x] 3.2 Hero dual: banner mobile (`object-bottom`) + desktop con overlay
- [x] 3.3 Fijar hover del CTA "Diseñar mi collar" (sin cambio de color del variant default)
- [x] 3.4 Refactor `GallerySection`: grilla uniforme `aspect-[4/5]`, 2 cols mobile / 3 cols desktop

## 4. Landing — tipografía de secciones

- [x] 4.1 Aplicar `text-left md:text-center` en headers de Productos, Galería, Medidas, Envíos, Testimonios, FAQ
- [x] 4.2 Normalizar subtítulos de Productos y Galería (`text-zinc-500`, sin `text-lg`)

## 5. Diseñador — mobile y headers

- [x] 5.1 Márgenes horizontales y `rounded-2xl` en `DesignerPage.tsx` (mobile)
- [x] 5.2 Aplicar `text-left md:text-center` en títulos/subtítulos de todos los steps del diseñador

## 6. Verificación

- [x] 6.1 Smoke test mobile: hero, galería 2 cols, scroll nav, diseñador con márgenes
- [x] 6.2 Verificar `/robots.txt` y `/sitemap.xml` en dev
- [ ] 6.3 Validar OG preview en producción (Facebook/WhatsApp) post-deploy

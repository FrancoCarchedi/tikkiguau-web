## 1. Prisma schema y migración



- [x] 1.1 Agregar modelos de catálogo en `prisma/schema.prisma` (`CatalogBaseColor`, `CatalogElementColor`, `CatalogLetter`, `CatalogLetterColor`, `CatalogEmoji` con `svgMarkup`, `CatalogEmojiColor`, `ProductPrice`, `ShippingPrice`) y enum `ProductType` si aplica

- [x] 1.2 Ejecutar `npx prisma migrate dev --name add-catalog-models` y `npx prisma generate`

- [x] 1.3 Verificar que la migración solo crea tablas nuevas sin alterar `orders` ni `stores`



## 2. Seed de catálogo



- [x] 2.1 Crear `prisma/seed-catalog.ts` con upserts idempotentes desde constantes de `types/collar.ts` y SVG extraído de `components/designer/custom-emojis/`

- [x] 2.2 Integrar seed de catálogo en `prisma/seed.ts` (admin + catálogo)

- [x] 2.3 Ejecutar `npm run seed` y verificar conteos: 9 colores base, 10 colores elemento, 26 letras, 8 emojis, 3 precios producto, 2 precios envío



## 3. Tipos y esquemas zod



- [x] 3.1 Crear `types/catalog.ts` con tipos de respuesta API (colores, letras, emojis, precios)

- [x] 3.2 Crear `lib/catalog/schemas.ts` con esquemas zod para create/update de cada entidad (incl. validación y sanitización de SVG para emojis)

- [x] 3.3 Crear `lib/catalog/sanitize-svg.ts` para whitelist de tags/atributos SVG seguros

- [x] 3.4 Crear helper `lib/catalog/get-public-catalog.ts` que arma el DTO agregado solo con ítems activos



## 4. API pública



- [x] 4.1 Implementar `GET /api/catalog/route.ts` usando `get-public-catalog.ts`

- [x] 4.2 Verificar manualmente: `GET /api/catalog` sin auth devuelve emojis activos con `svgMarkup`



## 5. API admin — colores



- [x] 5.1 Implementar `app/api/catalog/base-colors/route.ts` (GET admin, POST) y `[id]/route.ts` (PATCH)

- [x] 5.2 Implementar `app/api/catalog/element-colors/route.ts` y `[id]/route.ts` con mismo patrón de auth que `app/api/stores/route.ts`

- [x] 5.3 Verificar manualmente: 401 sin sesión, CRUD con sesión admin



## 6. API admin — letras y emojis



- [x] 6.1 Implementar `app/api/catalog/letters/route.ts` (GET) y `[id]/route.ts` (PATCH colores y isActive)

- [x] 6.2 Implementar `app/api/catalog/emojis/route.ts` (GET, POST con upload SVG) y `[id]/route.ts` (PATCH, DELETE)

- [x] 6.3 Verificar manualmente: crear emoji con SVG, editar markup, desactivar y eliminar sin afectar órdenes existentes



## 7. API admin — precios



- [x] 7.1 Implementar `app/api/catalog/product-prices/route.ts` (GET) y `[id]/route.ts` (PATCH amountArs, label, description)

- [x] 7.2 Implementar `app/api/catalog/shipping-prices/route.ts` y `[id]/route.ts` para CORREO_DOMICILIO y CORREO_SUCURSAL

- [x] 7.3 Verificar manualmente: cambio de precio se refleja en `GET /api/catalog`



## 8. Hooks TanStack Query (admin)



- [x] 8.1 Crear hooks en `app/admin/(protected)/hooks/`: `use-catalog-base-colors.ts`, `use-catalog-element-colors.ts`

- [x] 8.2 Crear `use-catalog-letters.ts`, `use-catalog-emojis.ts`

- [x] 8.3 Crear `use-catalog-pricing.ts` (productos + envíos)

- [x] 8.4 Configurar invalidación de `['catalog']` y queryKeys por recurso en mutations



## 9. UI admin — navegación y colores



- [x] 9.1 Agregar sección "Catálogo" en sidebar (`components/admin/app-sidebar.tsx`) con links a subpáginas

- [x] 9.2 Crear `app/admin/(protected)/catalogo/colores/page.tsx` con tabs base / elementos y tablas CRUD

- [x] 9.3 Verificar manualmente: crear color, desactivar, reordenar sortOrder si la UI lo expone



## 10. UI admin — letras, emojis y precios



- [x] 10.1 Crear `app/admin/(protected)/catalogo/letras/page.tsx` con selector de colores por letra

- [x] 10.2 Crear `app/admin/(protected)/catalogo/emojis/page.tsx` con CRUD, upload/edición de SVG, preview y asignación de colores

- [x] 10.3 Crear `app/admin/(protected)/catalogo/precios/page.tsx` para productos y envíos

- [x] 10.4 Verificar manualmente: flujo completo CRUD en las tres pantallas



## 11. Migrar consumidores públicos



- [x] 11.1 Crear hook o utilidad `hooks/use-catalog.ts` (o fetch server) para sitio público

- [x] 11.2 Migrar `components/web/ProductsSection.tsx` a precios desde catálogo dinámico

- [x] 11.3 Migrar `components/designer/CollarPreview.tsx` (y `LeashPreview` si aplica) a colores y emojis dinámicos

- [x] 11.4 Refactorizar `components/designer/custom-emojis/EmojiRenderer.tsx` para renderizar `svgMarkup` del catálogo con tintado por color

- [x] 11.5 Eliminar constantes obsoletas de catálogo en `types/collar.ts` (conservar tipos de diseño y límites MIN/MAX)

- [x] 11.6 Deprecar componentes estáticos en `components/designer/custom-emojis/*.tsx` tras validar paridad visual con seed

- [x] 11.7 Verificar manualmente: homepage muestra precios correctos; preview de collar usa emojis subidos desde CMS



## 12. Cierre



- [x] 12.1 Revisar que ningún import roto referencie `COLLAR_COLORS`, `ELEMENT_COLORS`, `CUSTOM_EMOJIS` o `PRODUCTS`

- [x] 12.2 Smoke test: cambiar precio en admin → refrescar homepage → precio actualizado; orden existente sin cambios en BD



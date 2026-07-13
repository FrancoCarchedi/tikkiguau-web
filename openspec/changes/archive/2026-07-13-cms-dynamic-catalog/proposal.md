## Why

El catálogo de TikkiGuau (colores, letras, emojis, precios de productos y envíos) vive hardcodeado en `types/collar.ts`. Cualquier cambio de precio u opción de diseño exige un deploy de código, lo que frena a Melizza y genera riesgo de desincronización entre el sitio web y lo que se comunica al cliente. Persistir el catálogo en la base de datos y gestionarlo desde el CMS es la prioridad del roadmap porque habilita el diseñador (`/disenar`) y el checkout guest con datos siempre actualizados sin tocar el repositorio.

## What Changes

- Nuevas tablas Prisma para colores de collar/correa, colores de elementos (letras/emojis), letras A–Z con colores permitidos, emojis personalizados, precios de productos y precios de envío.
- Seed inicial que reproduce los valores actuales de `types/collar.ts`.
- API routes protegidas (CMS) para CRUD y activar/desactivar cada entidad de catálogo.
- API pública de solo lectura que expone ítems activos para el sitio web y el diseñador.
- Pantallas en `/admin` para gestionar catálogo y precios, siguiendo el patrón de tiendas.
- Gestión completa de emojis desde el CMS: Melizza puede subir SVG nuevos, editar los existentes, y desactivar o eliminar emojis que ya no quiera ofrecer.
- Migración de consumidores (`components/web/`, `components/designer/`) para leer catálogo dinámico en lugar de constantes estáticas.
- `types/collar.ts` conserva tipos e interfaces de diseño; deja de ser fuente de verdad de precios y opciones visuales.

## Capabilities

### New Capabilities

- `catalog-colors`: Colores base de collar/correa y paleta de colores para letras y emojis (CRUD admin, activación, lectura pública).
- `catalog-letters`: Letras A–Z con colores permitidos configurables por letra (conjunto fijo, colores editables).
- `catalog-emojis`: Emojis personalizados gestionados desde el CMS (key, label, SVG, colores, activo) con CRUD completo: crear, editar, desactivar y eliminar.
- `catalog-pricing`: Precios de productos (collar, correa, combo) y costos de envío Correo Argentino (domicilio y sucursal).
- `catalog-public-api`: Endpoint(s) públicos agregados para que el sitio web consuma el catálogo activo sin autenticación.

### Modified Capabilities

_(ninguna — no existen specs previas en `openspec/specs/`)_

## Impact

- **Base de datos compartida:** Se agregan tablas nuevas en Neon Postgres compartido con `tikkiguau-tiendas`. No se modifican tablas existentes (`orders`, `stores`, auth). `tikkiguau-tiendas` queda fuera de alcance de código; las nuevas tablas no la afectan mientras no las consuma.
- **Prisma:** `prisma/schema.prisma`, migración, `prisma/seed.ts`.
- **API:** Nuevas rutas bajo `app/api/catalog/` (o equivalente) y rutas admin protegidas.
- **CMS:** Nuevas páginas y hooks en `app/admin/(protected)/`, incluyendo upload y edición de SVG para emojis.
- **Sitio público:** `components/web/ProductsSection.tsx`, `components/designer/*`, futuro `/disenar`.
- **Tipos:** Refactor de `types/collar.ts` para separar tipos de dominio de constantes de catálogo.

## Non-goals

- Implementar `/disenar`, checkout guest (`POST /api/orders`) o confirmación de orden (cambios separados que consumirán el catálogo dinámico).
- Editor vectorial avanzado en el CMS (solo subida/edición de archivos SVG simples; sin herramientas de diseño integradas).
- Gestionar tallas de collar/correa desde el CMS (permanecen en código por ahora).
- Modificar `tikkiguau-tiendas` ni su lógica de catálogo/precios.
- Recalcular `totalAmount` u `orderItems` de órdenes ya creadas.

## Impacto en datos existentes

- **Órdenes existentes:** `orderItems` y `totalAmount` son snapshot al momento de la compra; los cambios de catálogo no los alteran.
- **Migración inicial:** El seed carga el estado actual de `types/collar.ts`. Tras el deploy, el catálogo en BD reemplaza las constantes en runtime; no hay backfill de pedidos históricos.
- **Compatibilidad:** Nuevas tablas sin FK a `orders`; cero downtime esperado en tablas compartidas con la app de tiendas.

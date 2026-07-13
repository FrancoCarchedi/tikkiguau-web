## Context

El catálogo de personalización y precios vive en `types/collar.ts` como constantes (`COLLAR_COLORS`, `ELEMENT_COLORS`, `CUSTOM_EMOJIS`, `PRODUCTS`). El CMS ya gestiona órdenes y tiendas con el patrón: Prisma → API route con `auth.api.getSession` → hooks TanStack Query → tablas admin. La BD Neon es compartida con `tikkiguau-tiendas` pero las nuevas tablas de catálogo son exclusivas del sitio web.

## Goals / Non-Goals

**Goals:**

- Persistir catálogo y precios en Prisma con tablas normalizadas.
- CRUD admin con activación/desactivación, siguiendo el patrón de `/admin/tiendas`.
- Gestión de emojis con SVG persistido en BD: subir, editar, desactivar y eliminar desde el CMS.
- API pública agregada para consumidores del sitio web y diseñador.
- Seed que replica el estado actual de `types/collar.ts`.
- Conservar snapshot en `orderItems`; el diseñador lee catálogo vigente al crear órdenes nuevas.

**Non-Goals:**

- Editor vectorial avanzado en el CMS (sin herramientas de diseño integradas; solo upload/edición de SVG).
- Gestionar tallas desde admin.
- Implementar `/disenar` o checkout en este change.
- Modificar `tikkiguau-tiendas`.

## Decisions

### 1. Modelo de datos normalizado

**Decisión:** Tablas separadas con relaciones many-to-many para colores por letra/emoji.

| Modelo | Campos clave | Notas |
|--------|--------------|-------|
| `CatalogBaseColor` | `name`, `hexValue`, `isActive`, `sortOrder` | Colores de collar/correa |
| `CatalogElementColor` | `hexValue`, `isActive`, `sortOrder` | Paleta para letras/emojis |
| `CatalogLetter` | `letter` (A–Z, unique), `isActive`, `sortOrder` | 26 filas fijas |
| `CatalogLetterColor` | `letterId`, `elementColorId` | Colores permitidos por letra |
| `CatalogEmoji` | `key`, `label`, `svgMarkup`, `isActive`, `sortOrder` | SVG persistido en BD |
| `CatalogEmojiColor` | `emojiId`, `elementColorId` | Colores permitidos por emoji |
| `ProductPrice` | `productType` (enum), `amountArs`, `pieces`, `label`, `description` | 3 filas (collar/leash/both) |
| `ShippingPrice` | `deliveryMethod`, `amountArs` | CORREO_DOMICILIO, CORREO_SUCURSAL |

**Alternativa descartada:** JSON blob único `catalog_config` — más rápido de implementar pero peor para CRUD granular, validación y queries por entidad.

### 2. API surface

**Decisión:**

- `GET /api/catalog` — respuesta agregada pública (solo activos).
- Admin por recurso, ej.:
  - `GET/POST /api/catalog/base-colors`
  - `PATCH /api/catalog/base-colors/[id]`
  - Análogo para `element-colors`, `letters`, `emojis`, `product-prices`, `shipping-prices`

**Alternativa descartada:** Solo endpoints granulares públicos — más round-trips para el diseñador.

Auth: mismo patrón que `app/api/stores/route.ts`. Validación zod en `lib/catalog/schemas/` (o junto a cada route).

### 3. Tipos compartidos

**Decisión:** `types/collar.ts` conserva interfaces de dominio (`CollarDesign`, `CartItem`, `ProductType`, límites MIN/MAX). Nuevos tipos de API en `types/catalog.ts` mapeados desde Prisma. Eliminar constantes `COLLAR_COLORS`, `ELEMENT_COLORS`, `CUSTOM_EMOJIS`, `PRODUCTS` tras migrar consumidores.

### 4. Emojis: SVG en base de datos

**Decisión:** Cada `CatalogEmoji` almacena `svgMarkup` (texto SVG sanitizado). El admin sube un archivo `.svg` o reemplaza el markup al editar. `EmojiRenderer` pasa a renderizar SVG dinámico desde el catálogo (vía `dangerouslySetInnerHTML` con sanitización estricta, o parser que solo permita tags/atributos SVG seguros) y aplica `fill`/`color` según la personalización del usuario.

Flujo para emoji nuevo: (1) Melizza sube SVG en `/admin/catalogo/emojis`, (2) asigna colores permitidos, (3) queda disponible en el diseñador sin deploy.

**Alternativa descartada:** Mantener componentes React por emoji en `custom-emojis/` — requiere deploy por cada emoji nuevo y contradice el objetivo de autonomía de Melizza.

**Migración inicial:** El seed extrae el SVG de los componentes actuales en `components/designer/custom-emojis/` (o un mapa estático de markup en `prisma/seed-catalog.ts`) para poblar los 8 emojis existentes. Tras la migración, esos componentes pueden deprecarse.

### 5. Admin UI

**Decisión:** Sección "Catálogo" en sidebar con subpáginas:

- `/admin/catalogo/colores` — tabs base / elementos
- `/admin/catalogo/letras`
- `/admin/catalogo/emojis` — CRUD con upload/edición de SVG, preview y asignación de colores
- `/admin/catalogo/precios` — productos + envíos

Componentes reutilizando `DataTable`, diálogos y switches de activación como `stores-table`.

### 6. Consumo público

**Decisión:** Hook `useCatalog()` (TanStack Query o fetch en Server Component según página) con `queryKey: ['catalog']`. `ProductsSection` y `CollarPreview` reciben datos por props o hook.

Homepage puede usar Server Component que llama Prisma directamente o `fetch` interno a `/api/catalog` — preferir fetch a API para una sola fuente de verdad.

### 7. Seed

**Decisión:** Extender `prisma/seed.ts` (o `prisma/seed-catalog.ts` importado) con upsert idempotente:

- 9 `CatalogBaseColor` desde `COLLAR_COLORS`
- 10 `CatalogElementColor` desde `ELEMENT_COLORS`
- 26 `CatalogLetter` con todos los colores de elemento vinculados (estado inicial = todos permitidos)
- 8 `CatalogEmoji` desde `CUSTOM_EMOJIS` con SVG extraído de `components/designer/custom-emojis/` y todos los colores vinculados
- 3 `ProductPrice` y 2 `ShippingPrice` desde valores actuales

Correr con `npm run seed` tras migración.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| SVG malicioso subido al CMS | Validar MIME/tipo, sanitizar markup (whitelist de tags SVG), límite de tamaño |
| SVG con estructura incompatible con tintado | Documentar convención: paths con `fill` reemplazable; preview en admin antes de guardar |
| BD compartida: migración afecta tiendas | Solo tablas nuevas; sin FK a tablas existentes de tiendas |
| Desincronización precios homepage vs checkout | Una sola API `/api/catalog`; invalidar cache en mutations admin |
| Muchas tablas junction | Aceptable para 26 letras × ~10 colores; volumen bajo |

## Migration Plan

1. Agregar modelos Prisma y ejecutar `npx prisma migrate dev`.
2. Ejecutar seed de catálogo en staging/producción.
3. Desplegar API + admin CMS.
4. Migrar consumidores públicos a catálogo dinámico.
5. Eliminar constantes obsoletas de `types/collar.ts` y deprecar componentes estáticos en `custom-emojis/`.

**Rollback:** Revertir deploy de frontend a constantes estáticas; tablas nuevas son inertes para `tikkiguau-tiendas`. No eliminar tablas en rollback rápido.

## Open Questions

- ¿Valores iniciales de envío Correo Argentino? (Definir con Melizza; seed con placeholder 0 o monto acordado.)

## Context

El sitio vende solo minorista. El catálogo (colores base, colores de elemento, letras A–Z+Ñ, emojis SVG con `availableSizes`) y los precios retail viven en Prisma y se administran en `/admin/catalogo/*` (change archivado `cms-dynamic-catalog`). `/disenar` recibe el catálogo por `CatalogProvider` desde un Server Component (`force-dynamic`). Los hooks admin usan TanStack Query + Axios, las rutas de escritura verifican sesión con `requireAdminSession()` y la validación usa zod.

La app de referencia (imagen) define la UX: categoría + talla → paso 1 color → paso 2 cantidades → resumen lateral con mínimos → referencia/notas → WhatsApp. La paleta de 10 swatches de la imagen coincide con `catalog_element_colors` (Blanco, Negro, Rosa, Amarillo, Naranja, Celeste, Verde, Rojo, Azul, Lila), lo que confirma que el catálogo existente alcanza para letras y emojis.

Equivalencia de tallas: Talla 2 = M = "Mediana"; Talla 1 = XS = "Pequeña" (ver `COLLAR_SIZES`/`LEASH_SIZES`).

## Goals / Non-Goals

**Goals:**

- Canal mayorista configurable por Melizza (precios, mínimos por color, requisitos del pedido) sin deploy.
- Aislamiento total de la lógica y datos retail.
- Máxima reutilización: catálogo, `CatalogProvider`, helpers, patrones admin, `WHATSAPP_URL`.
- Lógica de cálculo y validación pura y testeable, independiente de React.

**Non-Goals:**

- Pasarela de pago, emails, cuentas de cliente, descuentos por volumen, envío (ver `proposal.md`).
- Reutilizar la tabla `Order` o mezclar pedidos mayoristas con las órdenes minoristas.
- Colores/letras/emojis exclusivos del canal mayorista.
- Modificar `tikkiguau-tiendas`.

## Decisions

### 1. Modelo de datos: tablas nuevas, aisladas y normalizadas

**Decisión:** dos tablas nuevas, sin FK a ninguna tabla existente.

```prisma
enum WholesaleCategory {
  LETTER
  EMOJI
  COLLAR
  LEASH
}

enum WholesaleSize {
  SIZE_1
  SIZE_2
}

model WholesalePriceRule {
  id               String            @id @default(cuid())
  category         WholesaleCategory
  size             WholesaleSize
  unitPriceArs     Int
  minUnitsPerColor Int               @default(25)
  isActive         Boolean           @default(true)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  @@unique([category, size])
  @@map("wholesale_price_rules")
}

model WholesaleSettings {
  id                    String   @id @default("default")
  isEnabled             Boolean  @default(true)
  requireMinTotalUnits  Boolean  @default(true)
  minTotalUnits         Int      @default(250)
  requireMinTotalAmount Boolean  @default(false)
  minTotalAmountArs     Int      @default(200000)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@map("wholesale_settings")
}
```

- Una fila por (categoría, talla) = las 8 reglas pedidas; precio y mínimo viajan juntos porque se editan juntos y comparten `isActive`.
- `WholesaleSettings` es una fila única (`id = "default"`, upsert). Es un patrón nuevo en el proyecto, justificado porque son parámetros globales, no una colección.
- Las banderas `require*` están separadas de los valores para que Melizza pueda apagar un requisito sin perder el número.
- `WholesaleSize` es un enum para impedir tallas inválidas en BD; los mappers lo convierten a `'1' | '2'` (la convención de `CollarSize`).

**Alternativas descartadas:**

- *Reutilizar `ProductPrice`:* mezcla precios retail y mayorista y haría que un cambio de Melizza pueda afectar al retail. Contradice el requisito principal.
- *Columna JSON de configuración:* contradice la regla del proyecto de evitar JSON para datos editables del CMS.
- *Tabla clave/valor de ajustes:* pierde tipado y validación por campo.

### 2. Reutilización del catálogo (solo lectura)

**Decisión:** el canal mayorista consume el catálogo existente con `getPublicCatalog()` y los helpers de `lib/catalog/catalog-helpers.ts`:

| Necesidad | Fuente |
|-----------|--------|
| Colores de letras y emojis | `catalog.elementColors` (activos) |
| Colores de collares y correas | `catalog.baseColors` (activos) |
| Letras disponibles y colores permitidos por letra | `getActiveLetters`, `letter.colors` |
| Emojis por talla y colores permitidos | `getActiveEmojis(catalog, size)`, `emoji.colors` |
| Render de emoji | `EmojiRenderer` |
| Nombre de color | `getBaseColorName` / `getElementColorName` |

`PublicCatalogDto` **no cambia**: los datos mayoristas se cargan con un helper separado, de modo que `GET /api/catalog` y `/disenar` ni siquiera conocen el canal mayorista.

**Consecuencia asumida:** desactivar una letra/emoji/color en el catálogo lo oculta en ambos canales. Precios y mínimos son independientes.

### 3. Carga de configuración en `/mayorista`

**Decisión:** `app/mayorista/page.tsx` es un Server Component `force-dynamic` (igual que `/disenar`) que ejecuta en paralelo `getPublicCatalog()` y `getPublicWholesaleConfig()` y entrega ambos a un componente cliente (`CatalogProvider` + prop `config`). No se crea endpoint público de lectura: no hay otro consumidor y evitaría un round-trip.

Si falla la carga, **no hay fallback estático**: a diferencia de `/disenar`, los precios mayoristas no existen en código, y mostrar valores viejos sería peor que mostrar un error con CTA de WhatsApp.

`getPublicWholesaleConfig()` devuelve solo reglas `isActive` y los ajustes; se deriva `isEnabled`.

### 4. API de administración

Mismo patrón que `app/api/catalog/product-prices`:

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/wholesale/price-rules` | GET | Lista las 8 reglas (incluye inactivas) |
| `/api/wholesale/price-rules/[id]` | PATCH | `unitPriceArs`, `minUnitsPerColor`, `isActive` |
| `/api/wholesale/settings` | GET | Ajustes vigentes |
| `/api/wholesale/settings` | PATCH | `isEnabled`, banderas y valores de requisitos |

- Todas llaman `requireAdminSession()` (401 sin sesión).
- Validación zod en `lib/wholesale/schemas.ts`. En `settings`, el schema valida el estado **resultante**: se fusiona el PATCH con la fila actual y se valida que, si una bandera queda activa, su valor sea entero positivo.
- Errores de Prisma se mapean a mensajes genéricos en español (HTTP 400/404/500); nunca se expone el error crudo.
- No hay POST/DELETE: el conjunto de reglas es fijo (8) y lo crea el seed.

### 5. Motor de cálculo puro (`lib/wholesale/order-calculator.ts`)

**Decisión:** toda la lógica de negocio vive en funciones puras sin React, para testearla de forma aislada y reutilizarla tanto en el resumen como en el armado del mensaje.

```ts
type WholesaleCategory = 'LETTER' | 'EMOJI' | 'COLLAR' | 'LEASH'
type WholesaleSizeValue = '1' | '2'

interface WholesaleOrderLine {
  category: WholesaleCategory
  size: WholesaleSizeValue
  colorHex: string
  itemKey: string // letra, key de emoji o 'plain' para collar/correa
  quantity: number
}

interface WholesaleGroupEvaluation {
  category: WholesaleCategory
  size: WholesaleSizeValue
  colorHex: string
  units: number
  subtotalArs: number
  minUnitsPerColor: number
  missingUnits: number // 0 si cumple
}

interface WholesaleOrderEvaluation {
  totalUnits: number
  totalAmountArs: number
  groups: WholesaleGroupEvaluation[]
  unitsRequirement: RequirementProgress | null  // null si está desactivado
  amountRequirement: RequirementProgress | null
  blockingReasons: string[]
  isValid: boolean
}

function evaluateWholesaleOrder(
  lines: WholesaleOrderLine[],
  config: PublicWholesaleConfig
): WholesaleOrderEvaluation
```

Semántica fijada:

- **Mínimo por color** = suma de todas las unidades del grupo (categoría + talla + color), no por ítem. 25 letras azules T2 repartidas entre A–Z cumplen; las azules T1 son otro grupo.
- Grupo con 0 unidades no cuenta; mínimo 0 = sin mínimo.
- **Requisitos de pedido:** si ambos están activos se exigen ambos (AND). Si ninguno, se exige ≥ 1 unidad. Las unidades totales suman todas las categorías.
- Precio de cada línea = `unitPriceArs` de la regla (categoría, talla); líneas cuya regla esté inactiva o inexistente se descartan antes de evaluar.
- `isValid` = todos los grupos cumplen + requisitos activos cumplidos + referencia válida (la referencia se evalúa en la capa de UI/envío, no en el calculador).

Requiere test runner: ver tarea 3.x (Vitest, solo para `lib/wholesale/`).

### 6. Estado del armador y borrador local

**Decisión:** un hook `useWholesaleOrder` (en `hooks/use-wholesale-order.ts`) con `useReducer` mantiene `lines`, `reference`, `notes`, categoría/talla/color activos. El estado es un arreglo plano de `WholesaleOrderLine` con `quantity > 0` (compacto, fácil de agrupar).

- Persistencia en `localStorage` bajo la clave versionada `tikkiguau.wholesale.draft.v1`, con parseo defensivo (zod) y descarte de líneas inválidas o ya no disponibles en el catálogo/config. Si el storage falla (modo privado), el armador funciona sin persistir.
- La hidratación ocurre en `useEffect` para evitar mismatches de SSR.
- El borrador incluye también el **teléfono** (`phone`, opcional al parsear para compatibilidad con borradores `v1` ya guardados).
- **Revisión:** el borrador se **elimina al registrarse el pedido** (el pedido ya está guardado en el servidor y reintentar WhatsApp reutiliza ese registro). Antes de la revisión se conservaba hasta "Empezar un pedido nuevo" porque WhatsApp no confirmaba el envío.

### 7. Estructura de UI pública

```
app/mayorista/page.tsx                 → Server Component, metadata, carga de datos
components/wholesale/
  WholesalePage.tsx                    → contenedor cliente, layout 2 columnas
  WholesaleHeader.tsx                  → marca + estado de mínimo
  CategorySizeSelector.tsx             → tabs de categoría + toggle de talla
  ColorPicker.tsx                      → paso 1
  QuantityGrid.tsx                     → paso 2 (letras / emojis)
  PlainProductQuantity.tsx             → paso 2 (collar / correa)
  QuantityCounter.tsx                  → −  [n]  +
  OrderSummary.tsx                     → "Tu pedido"
  SendOrderButton.tsx                  → CTA WhatsApp + alertas
  WholesaleUnavailable.tsx             → estado deshabilitado / error
```

- Letras: se reutiliza el orden del catálogo (`getActiveLetters`, que ya incluye la Ñ) en una grilla de tiles; cada tile muestra la letra en el color elegido y el contador.
- Emojis: tiles con `EmojiRenderer` y `fillColor` del color elegido; filtrados por `availableSizes` y colores permitidos.
- Collares/correas: un tile grande (“Collar Talla 2 · Rojo”) con contador, usando los colores base. Sin previsualización de `CollarPreview` en esta versión.
- Responsive: escritorio en dos columnas (selector | resumen sticky); móvil en una columna con barra inferior fija (unidades, total estimado, botón que despliega el resumen).
- Estilos: Tailwind + componentes shadcn existentes; paleta de marca de `globals.css`. Se descartan branding y textos de Printonic y el concepto “franja”.
- Copy en español (Argentina), voseo.

### 8. Mensaje de WhatsApp (`lib/wholesale/build-whatsapp-message.ts`)

Funciones puras (sin React):

- `buildWholesaleWhatsAppMessage(input): string` — mensaje completo.
- `buildWholesaleWhatsAppSummaryMessage(input): string` — resumen breve (título, referencia, unidades totales, total estimado y la línea "El detalle completo te lo pego a continuación").
- `buildWholesaleWhatsAppUrl(message): string` — usa `WHATSAPP_URL` y `encodeURIComponent`.
- `resolveWhatsAppPayload(input): { url: string; isSummaryOnly: boolean; fullMessage: string }` — decide si el mensaje completo entra en `WHATSAPP_MAX_URL_LENGTH`; si no, devuelve la URL con el resumen y `isSummaryOnly = true`.

```
*Pedido mayorista TikkiGuau*
Referencia: Pedido junio — Melisa

*Letras · Talla 2 (Mediana)* · $881 c/u
• Azul · 25 u · $22.025 → A×10, B×10, C×5
• Rojo · 30 u · $26.430 → A×15, Z×15

*Collares · Talla 1 (Pequeña)* · $9.200 c/u
• Negro · 30 u · $276.000

*Total: 85 unidades · $324.455 (estimado, sin envío)*

Notas: Lo necesito para el 20/06.
```

- Orden determinista: categoría (Letras, Emojis, Collares, Correas) → talla → color por `sortOrder` del catálogo → ítems por orden del catálogo.
- Formato compacto `ÍTEM×cantidad` para minimizar el largo.
- Texto de usuario (referencia/notas) se limpia de saltos de línea excesivos y se recorta a los máximos definidos.
- **Límite de longitud:** `WHATSAPP_MAX_URL_LENGTH` (valor inicial 6000 caracteres codificados, a validar en pruebas manuales).
- **Revisión:** el mensaje incluye el **número de pedido** (`Pedido: WH-1001`) justo debajo del título, para que Melizza cruce el chat con el registro del CMS. No incluye el teléfono (WhatsApp ya muestra el número del remitente y está guardado en el CMS). `WholesaleMessageInput` recibe `orderNumber` (obligatorio al construir el mensaje definitivo).
- **Botón "Copiar texto" (solo pedido extenso):** copia el mensaje completo con `navigator.clipboard.writeText` y confirma con `sonner`. Si el portapapeles falla o no está disponible, se muestra un `Textarea` de solo lectura con el mensaje para copiar a mano.
- **Pedido extenso (`isSummaryOnly`):** tras guardar el pedido, la pantalla de pedido registrado muestra instrucciones numeradas (1. copiá el pedido completo, 2. abrí WhatsApp y enviá el resumen, 3. pegá el pedido completo y enviá) con "Copiar texto" y "Abrir WhatsApp". No se abre WhatsApp automáticamente en este caso, para que el cliente pueda copiar primero (el número de pedido solo se conoce tras guardar, por lo que el texto completo no puede copiarse dentro del gesto del clic de confirmación). Se descartó truncar el detalle en silencio porque perdería información del pedido (y el detalle completo siempre queda en la base de datos).

### 9. Administración en el CMS

- Sidebar (`components/admin/admin-sidebar.tsx`): nuevo grupo **Mayorista** con los enlaces `/admin/mayorista/pedidos` ("Pedidos", revisión) y `/admin/mayorista` ("Reglas y precios"), con íconos distintos a los de Catálogo. Para que "Reglas y precios" no quede activo en `/admin/mayorista/pedidos`, la comparación de ruta activa es exacta (`pathname === href`).
- Página `app/admin/(protected)/mayorista/page.tsx` con header estándar y `WholesaleSettingsPanel` (componente en `app/admin/(protected)/components/`):
  1. **Estado general:** switch `isEnabled`.
  2. **Requisitos del pedido:** dos filas con switch + input numérico (unidades totales, monto mínimo ARS), advertencia si ambos están apagados.
  3. **Precios y mínimos:** tabla 4 categorías × 2 tallas con columnas Precio ARS, Mínimo por color, Activo.
- Formularios con **react-hook-form + zod** (`@hookform/resolvers`), alineado con la convención del proyecto. No se replica el patrón de `catalog-pricing-panel` basado en `document.getElementById` y borradores sueltos.
- Hooks en `app/admin/(protected)/hooks/`: `use-wholesale-settings.ts`, `use-wholesale-price-rules.ts`; keys en `lib/wholesale/query-keys.ts` (`['wholesale', ...]`) con invalidación en las mutations. Los cambios no necesitan invalidar `['catalog']`.

### 10. Valores por defecto de collares y correas (propuesta)

Melizza solo definió letras y emojis. Criterio para completar los 4 precios faltantes: **≈ 50 % del precio retail vigente** (collar $20.000, correa $26.000), redondeado, y **Talla 1 ≈ 92 % de Talla 2**, la misma relación que tienen hoy letras (821/881 = 0,93) y emojis (935/1031 = 0,91).

| Producto | Talla 2 | Talla 1 |
|----------|---------|---------|
| Collar | $10.000 | $9.200 |
| Correa | $13.000 | $12.000 |

Son **placeholders editables**: Melizza todavía no definió estos precios y los ajustará desde el CMS. El seed los carga solo para que el flujo sea utilizable; deben revisarse antes de publicar (checklist de go-live).

### 11. Navegación y SEO

- **Revisión:** `Navbar` y `Footer` **no enlazan** a `/mayorista` (pedido de Melizza). Se eliminan las props `showWholesaleLink`, la lectura de `isWholesaleEnabled()` en `app/page.tsx` y el helper `isWholesaleEnabled()` (código muerto). La sección se comparte por URL directa.
- `app/sitemap.ts` mantiene `/mayorista` (decisión confirmada: sigue indexable). `metadata` propia en la página. `robots.ts` sin cambios.

### 12. Pedidos mayoristas persistidos (revisión)

**Decisión:** tabla nueva `wholesale_orders` aislada (sin FK), independiente de `orders`. Se descartó reutilizar `Order`: tiene campos retail obligatorios (DNI, email, entrega, pago) y mezclaría ambos canales en `/admin` y en `tikkiguau-tiendas`.

```prisma
enum WholesaleOrderStatus {
  NEW
  CONTACTED
  CLOSED
  CANCELLED
}

model WholesaleOrder {
  id             String               @id @default(cuid())
  orderNumber    String               @unique
  reference      String
  phone          String
  notes          String?
  status         WholesaleOrderStatus @default(NEW)
  totalUnits     Int
  totalAmountArs Int
  items          Json
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt

  @@index([status, createdAt])
  @@map("wholesale_orders")
}
```

- `items` es un **snapshot** (igual criterio que `Order.orderItems`): arreglo de grupos `{ category, size, colorHex, colorName, unitPriceArs, units, subtotalArs, items: [{ itemKey, label, quantity }] }`. Es un JSON no editable (histórico), no un dato editable del CMS, por lo que no contradice la regla de evitar JSON para datos configurables. Un tipo `WholesaleOrderItemsSnapshot` y un parser zod lo validan al leerlo.
- **Número de pedido:** `WH-<n>` correlativo desde 1001, calculado leyendo el último y reintentando ante violación de unicidad (`P2002`, hasta 5 intentos) para soportar solicitudes simultáneas.
- **Migración:** segunda migración aditiva `add_wholesale_orders` (solo `CREATE TYPE`/`CREATE TABLE`/`CREATE INDEX`).

### 13. Creación del pedido (servidor)

`POST /api/wholesale/orders` (público, sin sesión):

1. Parseo con zod (`lib/wholesale/order-schemas.ts`): `reference` (sanitizada, 3–80), `phone` (misma regla que el minorista: caracteres telefónicos y 8–15 dígitos), `notes` (≤500), `lines` (1–2000 ítems, cantidades 1–9999, sin duplicados por `isSameLine`).
2. Servicio `createWholesaleOrder` (`lib/wholesale/create-wholesale-order.ts`): carga en paralelo `getPublicCatalog()` y `getPublicWholesaleConfig()`; rechaza si `!settings.isEnabled`; valida cada línea con `isLineAvailable`; **recalcula** con `evaluateWholesaleOrder` (la misma función pura del cliente) y rechaza si `!evaluation.isValid`; arma el snapshot con nombres de color y etiquetas de ítem del catálogo vigente; guarda.
3. Respuesta 201 `{ id, orderNumber }`. Errores de validación → 400 con mensaje en español; errores de BD → 500 con mensaje genérico (nunca el error crudo).
- El cliente nunca envía precios ni totales; el servidor ignora cualquier valor extra (`strict`/strip).
- Sin protección anti-spam adicional en esta versión (mismo criterio que `POST /api/orders` minorista); queda como riesgo documentado.

### 14. Flujo de envío en el cliente

```
[Enviar pedido] → ConfirmOrderDialog (resumen + Seguir editando / Confirmar y enviar)
   └─ Confirmar → POST /api/wholesale/orders
        ├─ error  → mensaje en el diálogo, WhatsApp NO se abre, reintento posible
        └─ éxito  → se limpia el borrador → pantalla "Pedido registrado" (OrderSubmittedView)
                    ├─ mensaje corto: abre WhatsApp automáticamente + botón "Abrir WhatsApp"
                    └─ mensaje largo (isSummaryOnly): instrucciones + "Copiar texto" + "Abrir WhatsApp" (sin apertura automática)
```

- **Popup blockers:** la apertura automática ocurre tras un `await`, fuera del gesto del clic. Para no ser bloqueada, al hacer clic en "Confirmar y enviar" (si el mensaje no es extenso) se abre una pestaña en blanco (`window.open('', '_blank')`) y, al guardar, se redirige a la URL de WhatsApp (`opener = null` antes de navegar); si falla el guardado se cierra. Si el navegador bloquea la pestaña, la pantalla de pedido registrado muestra "Abrir WhatsApp" (clic directo), por lo que el flujo nunca se pierde.
- **Sin duplicados:** el botón se deshabilita mientras se guarda y, tras el éxito, el borrador se vacía; "Abrir WhatsApp" reutiliza el pedido ya guardado (estado en memoria `SubmittedWholesaleOrder`).
- Componentes nuevos/cambiados: `SendOrderButton` ("Enviar pedido"), `ConfirmOrderDialog` (reemplaza `LargeOrderDialog`), `OrderSubmittedView`, `CopyOrderTextButton` (reutilizado solo en el caso extenso), hook `useSubmitWholesaleOrder` (mutation TanStack Query + Axios) y campo teléfono en `OrderSummary`.

### 15. Pedidos en el CMS

- Rutas: `GET /api/wholesale/orders` (admin; orden `createdAt desc`) y `PATCH /api/wholesale/orders/[id]` (admin; solo `status`). Ambas con `requireAdminSession()`; 404 si no existe; 400 por estado inválido. No hay DELETE.
- Página `app/admin/(protected)/mayorista/pedidos/page.tsx` con header estándar y contador de pedidos nuevos; componentes `wholesale-orders-table.tsx` (búsqueda por número/referencia/teléfono, filtro por estado, igual patrón que `orders-table.tsx`) y `wholesale-order-detail-sheet.tsx` (detalle agrupado, notas, estado, botón "Contactar por WhatsApp").
- Enlace de contacto: `https://wa.me/<dígitos>`; si el teléfono tiene exactamente 10 dígitos (formato nacional sin código de país) se antepone `549`; en otro caso se asume que ya incluye el código de país. Documentado como convención de la UI, no se transforma el dato guardado.
- Hooks: `use-wholesale-orders.ts` y `use-update-wholesale-order.ts`, con `wholesaleQueryKeys.orders = ['wholesale', 'orders']`.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Precios de collar/correa inventados llegan a producción | Valores marcados como propuesta; checklist de go-live exige confirmación; `isActive` permite apagar esas reglas |
| Mensaje de WhatsApp excede límites de URL | Formato compacto + límite explícito + resumen breve en la URL + botón "Copiar texto" con ayuda; prueba manual con pedido máximo (27 letras × 10 colores × 2 tallas) |
| El cliente no pega el detalle cuando solo llegó el resumen | Diálogo explícito, copia automática previa, ayuda permanente junto a los botones; Melizza puede pedir el detalle por chat |
| El usuario no pulsa “Enviar” en WhatsApp y cree que pidió | Pantalla de confirmación explícita; borrador conservado; reabrir WhatsApp |
| Precio estimado desactualizado respecto a lo que Melizza cotiza | Etiqueta “estimado”; el mensaje indica fecha/precios unitarios usados; Melizza confirma por chat |
| Manipulación de precios en el cliente | El servidor recalcula con reglas y catálogo vigentes y guarda sus propios totales; el cliente no envía precios |
| Spam o pedidos falsos en `POST /api/wholesale/orders` (endpoint público) | Validación estricta, tope de líneas y cantidades, mínimos exigidos en servidor; sin rate limiting en esta versión (igual que el retail). Evaluar límite por IP si aparece abuso |
| Pestaña de WhatsApp bloqueada tras guardar | Pestaña pre-abierta en el clic + pantalla "Pedido registrado" con "Abrir WhatsApp" |
| Teléfono mal cargado por el cliente | Validación 8–15 dígitos, ayuda "con código de área, sin 0 ni 15"; Melizza cuenta además con el chat de WhatsApp |
| Datos personales (teléfono) almacenados | Solo visibles en el CMS con sesión; sin exposición en APIs públicas |
| Acoplamiento catálogo ↔ mayorista | Documentado como decisión; solo se comparte visibilidad, no precios |
| `localStorage` con datos obsoletos | Versionado de clave + saneamiento al restaurar |
| Falta de runner de tests en el repo | Introducir Vitest acotado a `lib/wholesale/` (dependencia de desarrollo mínima) |
| Warning del CLI: reglas de `specs`/`design` en `openspec/config.yaml` no son un arreglo de strings (ítems YAML sin comillas con `:`) | No bloquea; se sugiere corregir el YAML en una tarea de mantenimiento aparte |

## Migration Plan

1. Agregar enums y modelos a `prisma/schema.prisma`; `npx prisma migrate dev --name add-wholesale-models` y `npx prisma generate`.
2. Verificar que la migración solo contiene `CREATE TYPE/CREATE TABLE` de objetos nuevos.
3. Agregar `prisma/seed-wholesale.ts` (upserts idempotentes por `(category,size)` y por `id = "default"`), integrarlo en `prisma/seed.ts` y ejecutar `npm run seed`. El seed **no debe pisar** valores editados por Melizza: en re-ejecuciones usa `update: {}` (solo crea lo faltante).
4. Desplegar API + CMS; Melizza revisa y confirma precios.
5. Desplegar `/mayorista` y enlaces de navegación.

**Producción (primera versión):** ya aplicada (migración `add_wholesale_models` + `npm run seed:wholesale`).

**Revisión (pedidos persistidos):** segunda migración aditiva `add_wholesale_orders`. Se prueba primero en la base de desarrollo; para producción se aplica **antes** del deploy del código (ver sección 14 de `tasks.md`). No requiere seed. Rollback: `isEnabled = false` o revertir el deploy; la tabla nueva es inerte.

**Rollback:** ocultar la sección con `isEnabled = false` (sin deploy) o revertir el deploy del frontend. Las tablas nuevas son inertes para el retail y para `tikkiguau-tiendas`; no se eliminan en un rollback rápido.

## Decisiones confirmadas

1. Collares y correas se venden **lisos** (talla + color + cantidad).
2. Los precios de collar y correa son **valores provisorios**: Melizza no los definió; se siembran los de la sección 10 y se ajustan luego desde el CMS.
3. El mínimo por color se suma por **categoría + talla + color**.
4. Si ambos requisitos del pedido están activos, se exigen **ambos** (unidades Y monto).
5. `/mayorista` es **público e indexable** (sitemap). ~~Enlace en Navbar y Footer~~ → **revisión:** sin enlaces desde la home; acceso por URL directa.
6. Si el mensaje supera el largo de URL, WhatsApp recibe un **resumen breve** y el cliente pega el detalle completo con el botón **"Copiar texto"** (que ahora aparece solo en ese caso, con instrucciones).
7. Las unidades totales **suman todas las categorías**.
8. Se incorpora **Vitest** como dependencia de desarrollo.

**Revisión (octubre 2026, validada con Melizza):**

9. Los pedidos mayoristas **se guardan** en la base de datos (`wholesale_orders`) y se ven en el CMS en **Mayorista → Pedidos**, separados de las órdenes minoristas.
10. El formulario pide **teléfono** obligatorio; no se pide nombre (la referencia identifica al cliente).
11. Botón **"Enviar pedido"** → diálogo de confirmación ("Seguir editando" / "Confirmar y enviar") → guarda y abre WhatsApp.
12. Estados: **Nuevo → Contactado → Cerrado**, más **Cancelado**.
13. **Sin email** a Melizza ni al cliente.
14. Si falla el guardado, **no se abre WhatsApp** y el cliente reintenta.
15. Formato de número de pedido `WH-1001`; el número se incluye en el mensaje de WhatsApp.

## Open Questions

_(ninguna pendiente)_

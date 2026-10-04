> Las decisiones de negocio pendientes fueron resueltas (ver "Decisiones confirmadas" en `design.md`). No quedan Open Questions bloqueantes.

## 1. Prisma schema y migración

- [x] 1.1 Agregar enums `WholesaleCategory` y `WholesaleSize` y modelos `WholesalePriceRule` y `WholesaleSettings` en `prisma/schema.prisma` (sin relaciones con modelos existentes)
- [x] 1.2 Ejecutar `npx prisma migrate dev --name add-wholesale-models` y `npx prisma generate`
- [x] 1.3 Verificar en `prisma/migrations/*_add_wholesale_models/migration.sql` que solo hay `CREATE TYPE`/`CREATE TABLE`/`CREATE UNIQUE INDEX` de objetos nuevos (sin `ALTER` sobre `orders`, `stores` ni `catalog_*`)

## 2. Seed (depende de 1)

- [x] 2.1 Crear `prisma/seed-wholesale.ts` con las 8 reglas por defecto (precios: letra 881/821, emoji 1031/935, collar 10000/9200, correa 13000/12000; `minUnitsPerColor` 25) y la fila `WholesaleSettings` (`id: "default"`, unidades 250 activo, monto 200000 inactivo, `isEnabled` true)
- [x] 2.2 Usar `upsert` con `update: {}` para no pisar valores editados desde el CMS en re-ejecuciones
- [x] 2.3 Integrar `seedWholesale` en `prisma/seed.ts` y ejecutar `npm run seed`
- [x] 2.4 Verificar conteos: 8 reglas y 1 fila de ajustes; re-ejecutar el seed tras editar un valor y confirmar que no se revierte

## 3. Tipos, esquemas y lógica pura (depende de 1)

- [x] 3.1 Crear `types/wholesale.ts`: `WholesaleCategory`, `WholesaleSizeValue`, `WholesalePriceRuleDto`, `WholesaleSettingsDto`, `PublicWholesaleConfig`, `WholesaleOrderLine`, `WholesaleOrderEvaluation`
- [x] 3.2 Crear `lib/wholesale/constants.ts`: etiquetas de categoría/talla ("Mediana (Talla 2)", "Pequeña (Talla 1)"), orden de categorías, `MAX_UNITS_PER_ITEM = 9999`, límites de referencia (3–80) y notas (500), `WHATSAPP_MAX_URL_LENGTH`
- [x] 3.3 Crear `lib/wholesale/schemas.ts` (zod): `updateWholesalePriceRuleSchema` y `updateWholesaleSettingsSchema` (validar estado resultante: valor entero positivo si la bandera está activa)
- [x] 3.4 Crear `lib/wholesale/mappers.ts`: Prisma ↔ DTO (`SIZE_1`/`SIZE_2` ↔ `'1'`/`'2'`)
- [x] 3.5 Crear `lib/wholesale/get-public-wholesale-config.ts` (solo reglas activas + ajustes) y `isWholesaleEnabled()` tolerante a errores
- [x] 3.6 Crear `lib/wholesale/order-calculator.ts` con `evaluateWholesaleOrder` (grupos por categoría+talla+color, mínimos por color, requisitos de unidades/monto con semántica AND, razones de bloqueo)
- [x] 3.7 Agregar Vitest como devDependency (alcance `lib/wholesale/`), script `test` y tests de `order-calculator`: suma por grupo, grupos independientes por talla, mínimo 0, requisito solo unidades / solo monto / ambos / ninguno, líneas con regla inactiva
- [x] 3.8 Crear `lib/wholesale/build-whatsapp-message.ts` (`buildWholesaleWhatsAppMessage`, `buildWholesaleWhatsAppSummaryMessage`, `buildWholesaleWhatsAppUrl` con `WHATSAPP_URL`, `resolveWhatsAppPayload`) y tests: orden determinista, formato compacto, omisión de notas, sanitización de texto de usuario, resumen breve cuando se supera `WHATSAPP_MAX_URL_LENGTH` y mensaje completo cuando no
- [x] 3.9 Verificación: `npm run test` y `npm run lint` sin errores

## 4. API de administración (depende de 3)

- [x] 4.1 Crear `app/api/wholesale/price-rules/route.ts` (GET, con `requireAdminSession`)
- [x] 4.2 Crear `app/api/wholesale/price-rules/[id]/route.ts` (PATCH `unitPriceArs`, `minUnitsPerColor`, `isActive`; 400 con mensaje en español, 404 si no existe)
- [x] 4.3 Crear `app/api/wholesale/settings/route.ts` (GET y PATCH con upsert de `id = "default"` y validación del estado resultante)
- [x] 4.4 Mapear errores de Prisma a mensajes genéricos (sin exponer detalles de BD)
- [x] 4.5 Verificación manual: 401 sin sesión en las 4 operaciones; PATCH con precio 0/negativo/decimal devuelve 400; `GET /api/catalog` no cambia tras editar reglas mayoristas

## 5. Hooks TanStack Query del CMS (depende de 4)

- [x] 5.1 Crear `lib/wholesale/query-keys.ts` (`['wholesale', 'settings']`, `['wholesale', 'price-rules']`) e `invalidateWholesaleQueries`
- [x] 5.2 Crear `app/admin/(protected)/hooks/use-wholesale-price-rules.ts` (query + mutation con invalidación)
- [x] 5.3 Crear `app/admin/(protected)/hooks/use-wholesale-settings.ts` (query + mutation con invalidación)

## 6. UI de administración (depende de 5)

- [x] 6.1 Agregar grupo "Mayorista" con enlace a `/admin/mayorista` en `components/admin/admin-sidebar.tsx`
- [x] 6.2 Crear `app/admin/(protected)/mayorista/page.tsx` con el header estándar (patrón de `catalogo/precios/page.tsx`)
- [x] 6.3 Crear `app/admin/(protected)/components/wholesale-settings-panel.tsx`: switch general, requisitos del pedido (switch + input por requisito) y advertencia cuando ambos están apagados; react-hook-form + zod
- [x] 6.4 Crear `app/admin/(protected)/components/wholesale-price-rules-panel.tsx`: tabla categoría × talla con precio, mínimo por color y switch activo; guardado con feedback `sonner`
- [x] 6.5 Verificación manual: editar cada campo, recargar y confirmar persistencia; redirección a sign-in sin sesión; probar los 4 escenarios de requisitos (unidades / monto / ambos / ninguno)

## 7. Armador público — base (depende de 3)

- [x] 7.1 Crear `hooks/use-wholesale-order.ts` (reducer: líneas, referencia, notas, categoría/talla/color activos) con acciones `setQuantity`, `removeGroup`, `clearOrder`
- [x] 7.2 Crear `lib/wholesale/draft-storage.ts`: persistencia en `localStorage` versionada, parseo con zod y saneamiento contra catálogo/config vigentes; integrarla al hook (hidratación en `useEffect`)
- [x] 7.3 Crear `components/wholesale/QuantityCounter.tsx` (−/+/input numérico, mínimo 0, máximo 9999, etiquetas accesibles)
- [x] 7.4 Crear `components/wholesale/CategorySizeSelector.tsx` (tabs Letras/Emojis/Collares/Correas y toggle Mediana/Pequeña, respetando reglas activas)
- [x] 7.5 Crear `components/wholesale/ColorPicker.tsx` (colores de elemento para letras/emojis; colores base para collares/correas; indicador de unidades por color; barra de combinación activa y "mín. N u por color")

## 8. Armador público — cantidades y resumen (depende de 7)

- [x] 8.1 Crear `components/wholesale/QuantityGrid.tsx` para letras (orden de `getActiveLetters`, filtrando letras que no permiten el color) y emojis (`getActiveEmojis` por talla, filtro por color permitido, `EmojiRenderer` con el color elegido)
- [x] 8.2 Crear `components/wholesale/PlainProductQuantity.tsx` para collares/correas (contador único por talla + color)
- [x] 8.3 Crear `components/wholesale/OrderSummary.tsx`: unidades, progreso de requisitos activos, precio estimado, detalle por grupo con estado del mínimo, "Quitar", referencia (3–80) y notas (≤500); estado vacío
- [x] 8.4 Crear `components/wholesale/WholesalePage.tsx` y `WholesaleHeader.tsx`: layout de dos columnas en escritorio, barra inferior fija con resumen en móvil, botón "Vaciar pedido" con confirmación
- [x] 8.5 Crear `components/wholesale/WholesaleUnavailable.tsx` (sección deshabilitada, sin categorías activas o error de carga, con CTA de WhatsApp)
- [x] 8.6 Verificación manual: cálculo de totales, mínimos por color en letras/emojis/collares/correas, emoji exclusivo de Talla 1, restauración del borrador tras recarga y descarte de ítems desactivados

## 9. Envío por WhatsApp (depende de 3.8 y 8)

- [x] 9.1 Crear `components/wholesale/SendOrderButton.tsx`: deshabilitado con lista de motivos pendientes; abre la URL de `resolveWhatsAppPayload` en pestaña nueva con `noopener`
- [x] 9.2 Crear `components/wholesale/CopyOrderTextButton.tsx`: copia el mensaje completo con `navigator.clipboard`, confirma con `sonner`, mismo criterio de habilitación que el envío, fallback con `Textarea` de solo lectura si el portapapeles falla; incluir el texto de ayuda fijo para pegar el pedido en el chat
- [x] 9.3 Implementar el diálogo de pedido extenso (`isSummaryOnly`): copia automática del mensaje completo dentro del gesto del clic, instrucción de pegar el detalle, "Copiar texto" de respaldo y apertura de WhatsApp con el resumen breve
- [x] 9.4 Implementar la confirmación posterior al envío ("Volver a abrir WhatsApp" y "Empezar un pedido nuevo"), conservando el borrador
- [x] 9.5 Verificación manual en móvil y escritorio: el mensaje llega legible al chat de TikkiGuau; "Copiar texto" pega el pedido completo; prueba con un pedido máximo (letras × 10 colores × 2 tallas) para fijar `WHATSAPP_MAX_URL_LENGTH` y confirmar el flujo de resumen breve + pegado

## 10. Ruta, navegación y SEO (depende de 8 y 3.5)

- [x] 10.1 Crear `app/mayorista/page.tsx` (`force-dynamic`, `metadata` propia, carga paralela de catálogo y configuración, `CatalogProvider`, manejo de error sin fallback de precios)
- [x] 10.2 Pasar `showWholesaleLink` desde `app/page.tsx` a `components/web/Navbar.tsx` y `components/web/Footer.tsx` y agregar el enlace "Mayoristas"
- [x] 10.3 Agregar `/mayorista` a `app/sitemap.ts` (y confirmar que `app/robots.ts` no lo bloquea)
- [x] 10.4 Verificación manual: con `isEnabled = false` desaparecen los enlaces y `/mayorista` muestra el mensaje de no disponibilidad

## 11. Cierre y no regresión del retail

- [x] 11.1 Smoke test retail: homepage, `/disenar` completo (diseño → contacto → entrega → confirmación) y `GET /api/catalog` sin diferencias respecto de antes del change
- [x] 11.2 Confirmar que el envío mayorista no crea filas en `orders` ni invoca Mercado Pago o Resend
- [x] 11.3 Cambiar un precio retail y uno mayorista y verificar que cada uno afecta solo a su canal
- [x] 11.4 Revisión de tipos y estilo: sin `any`, `npm run lint` y `npm run build` sin errores
- [x] 11.5 Actualizar `docs/DOCUMENTATION.md` (sección mayorista, flujo y CMS) y `openspec/config.yaml` (estado implementado, roadmap, estructura de carpetas)
- [ ] 11.6 Checklist de go-live con Melizza: precios de collar/correa confirmados, requisitos del pedido definidos, copy final revisado

## 12. Puesta en producción (aplicar lo hecho en desarrollo)

Todo el trabajo anterior se ejecutó contra la base de **desarrollo**. La base de producción (compartida con `tikkiguau-tiendas`) todavía no tiene las tablas ni los datos mayoristas. Ejecutar en este orden; **la migración y el seed van antes del deploy del código**.

- [ ] 12.1 Respaldo previo: crear un branch/snapshot de la base de producción en Neon (restauración rápida ante cualquier problema)
- [ ] 12.2 Apuntar la terminal a producción **sin editar el `.env` local**: definir `DATABASE_URL` de producción solo para la sesión (PowerShell: `$env:DATABASE_URL = "<url de producción>"`; cerrar la terminal al terminar). Confirmar el destino antes de continuar: `npm run seed:wholesale` imprime el host y la base destino; abortar si no es producción
- [ ] 12.3 Revisar el estado de migraciones con `npx prisma migrate status`: debe listar `20261004180000_add_wholesale_models` como pendiente y ninguna otra. Si Prisma informa historial divergente o migraciones fallidas, detenerse y revisar antes de seguir
- [ ] 12.4 Aplicar la migración con `npx prisma migrate deploy` (nunca `migrate dev` ni `migrate reset` en producción). Es aditiva: solo `CREATE TYPE`/`CREATE TABLE`/`CREATE UNIQUE INDEX` de `wholesale_price_rules` y `wholesale_settings`, sin cambios sobre `orders`, `stores` ni `catalog_*`, por lo que no afecta a `tikkiguau-tiendas`
- [ ] 12.5 Verificar la migración: `npx prisma migrate status` sin pendientes y las dos tablas existentes en Neon (vacías)
- [ ] 12.6 Sembrar solo datos mayoristas con `npm run seed:wholesale` (no `npm run seed`, que además toca usuario admin y catálogo). Es idempotente y no pisa valores editados. Verificar 8 reglas de precio y 1 fila de ajustes
- [ ] 12.7 Desplegar el código a Vercel (el build ejecuta `prisma generate`; no corre migraciones). Confirmar que la variable `DATABASE_URL` del entorno de producción en Vercel apunta a la base de producción
- [ ] 12.8 Smoke test en producción: `/admin/mayorista` carga reglas y ajustes; `/mayorista` renderiza con los datos sembrados; el enlace "Mayoristas" aparece en Navbar y Footer; `GET /api/catalog`, homepage y `/disenar` sin cambios
- [ ] 12.9 Con Melizza, desde `/admin/mayorista` en producción: reemplazar los precios provisorios de collares y correas, confirmar mínimos por color y definir los requisitos del pedido (cierra 11.6). No enviar pedidos de prueba reales a WhatsApp sin avisarle
- [ ] 12.10 Rollback si algo falla: poner `isEnabled = false` en `/admin/mayorista` (oculta la sección y los enlaces sin deploy) o revertir el deploy en Vercel. Las tablas nuevas son inertes para el retail y no se eliminan en un rollback rápido
- [ ] 12.11 Cierre: archivar el change con `openspec archive wholesale-orders` una vez validado en producción y actualizar la sección "Roadmap" de `openspec/config.yaml`

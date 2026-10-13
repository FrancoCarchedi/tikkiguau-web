## Why

TikkiGuau solo vende al público minorista (`/disenar`, con pago por transferencia o Mercado Pago). Melizza quiere abrir un canal **mayorista** para revendedores y negocios: pedidos por volumen de letras, emojis, collares y correas, con precios y mínimos distintos a los del retail. Hoy esos pedidos se gestionan de forma informal; una sección dedicada ordena el pedido (colores, cantidades, mínimos, total estimado), lo **registra** para que Melizza lo vea en el CMS aunque el cliente no llegue a enviar el mensaje, y lo entrega ya armado por WhatsApp, sin agregar pasarela de pago.

> **Revisión (octubre 2026):** tras validar la primera versión con Melizza se ajustó el alcance: (1) la home ya no enlaza a `/mayorista`; (2) los pedidos mayoristas se guardan en la base de datos con el teléfono del cliente y se listan en el CMS, separados de las órdenes minoristas; (3) el botón de envío pasa a ser "Enviar pedido" con un diálogo de confirmación que guarda el pedido y luego abre WhatsApp.

## What Changes

- Nueva ruta pública **`/mayorista`** con un armador de pedido por pasos, basado en la app de referencia (categoría + talla → color → cantidades, resumen lateral):
  - Categorías: **Letras**, **Emojis**, **Collares**, **Correas**. Tallas: Talla 2 (Mediana) y Talla 1 (Pequeña).
  - Letras y emojis: grilla con contador por ítem. Collares y correas: contador único por color (sin personalización).
  - Resumen en vivo: unidades, faltantes para el mínimo, precio estimado, estado de cada mínimo por color.
  - Referencia del pedido (obligatoria), **teléfono de contacto** (obligatorio) y notas (opcional).
  - Botón **"Enviar pedido"** que abre un diálogo de confirmación ("Seguir editando" / "Confirmar y enviar"). Al confirmar: (1) el pedido se **guarda en la base de datos** con un número de pedido y (2) se abre **WhatsApp** a TikkiGuau con el mensaje precargado. Si el mensaje supera el largo de URL, se muestra el botón **"Copiar texto"** con instrucciones para pegar el pedido completo en el chat. Se descarta "Descargar Excel".
- Nuevo módulo **Mayorista** en el CMS (`/admin/mayorista`) donde Melizza configura, sin deploy:
  - Precio unitario por categoría y talla (8 precios).
  - Cantidad mínima por color por categoría y talla (8 mínimos).
  - Requisitos del pedido: mínimo de **unidades totales**, mínimo de **monto total**, o ambos (cada uno activable y con su valor).
  - Interruptor para habilitar/deshabilitar toda la sección y cada categoría/talla.
  - **Pedidos mayoristas** (`/admin/mayorista/pedidos`): listado y detalle de los pedidos recibidos, con teléfono del cliente (enlace a WhatsApp), detalle por categoría/talla/color/ítem, y estado de seguimiento (Nuevo → Contactado → Cerrado, o Cancelado). Sección propia, sin mezclarse con las órdenes minoristas de `/admin`.
- Tablas Prisma **nuevas y aisladas** para reglas mayoristas y para los pedidos mayoristas; seed con los valores por defecto.
- Reutilización del catálogo existente (colores base, colores de elementos, letras, emojis, tallas por emoji) en modo solo lectura.
- **Sin enlaces** a `/mayorista` en la home (ni Navbar ni Footer): se accede por URL directa que comparte Melizza. La ruta sigue siendo pública, indexable y presente en el sitemap.

## Capabilities

### New Capabilities

- `wholesale-pricing-rules`: administración (CMS) de precios, mínimos por color y requisitos de pedido mayorista; aislamiento respecto del retail; lectura pública de la configuración.
- `wholesale-order-builder`: armador público de pedido mayorista (categorías, tallas, colores, cantidades, cálculo, validación de mínimos).
- `wholesale-whatsapp-submission`: confirmación y envío del pedido (guardado + WhatsApp), generación del mensaje, copia de texto para pedidos extensos; sin pasarela.
- `wholesale-order-records`: registro de pedidos mayoristas en la base de datos (creación pública validada en servidor) y gestión en el CMS (listado, detalle, estados), aislada de las órdenes minoristas.

### Modified Capabilities

- `site-seo`: la ruta `/mayorista` incorpora metadata propia y entrada en el sitemap; la home no enlaza a ella.

## Impact

- **Prisma:** `prisma/schema.prisma` (+ migración), `prisma/seed-wholesale.ts`, `prisma/seed.ts`.
- **Lógica:** nuevo `lib/wholesale/` (cálculo, validación, mensaje), `types/wholesale.ts`.
- **API:** `app/api/wholesale/settings`, `app/api/wholesale/price-rules` (admin); `app/api/wholesale/orders` (`POST` público validado en servidor, `GET` admin) y `app/api/wholesale/orders/[id]` (`PATCH` admin de estado).
- **CMS:** `app/admin/(protected)/mayorista/` y `mayorista/pedidos/`, hooks `use-wholesale-*.ts`, entradas en `components/admin/admin-sidebar.tsx`.
- **Público:** `app/mayorista/page.tsx`, `components/wholesale/*`, `app/sitemap.ts`. `components/web/Navbar.tsx`, `components/web/Footer.tsx` y `app/page.tsx` dejan de recibir/mostrar el enlace mayorista.
- **BD compartida con `tikkiguau-tiendas`:** se agregan **solo tablas y enums nuevos** sin FK a tablas existentes (`wholesale_price_rules`, `wholesale_settings`, `wholesale_orders`). No se modifica `orders`, `stores` ni el catálogo. `tikkiguau-tiendas` queda **fuera de alcance**.
- **Retail:** `ProductPrice`, `GET /api/catalog`, `POST /api/orders`, emails y Mercado Pago no se tocan.

## Non-goals

- Pasarela de pago, Mercado Pago, transferencia o emails automáticos en el flujo mayorista (ni al cliente ni a Melizza: los pedidos se consultan en el CMS).
- Reutilizar la tabla `Order` o mezclar pedidos mayoristas en `/admin` (órdenes minoristas).
- Cuentas de cliente para mayoristas (el contacto es solo referencia + teléfono).
- Personalización de collares y correas mayoristas (letras/emojis aplicados); se venden lisos.
- Cuentas de cliente, listas de precios por cliente, descuentos por escalón/franja de volumen o cupones.
- Cálculo de envío mayorista; se coordina por WhatsApp.
- Exportar o descargar el pedido como Excel.
- Gestionar colores, letras o emojis específicos para mayorista (se comparten con retail).
- Modificar `tikkiguau-tiendas`.

## Impacto en datos existentes

- **Órdenes y catálogo retail:** sin cambios. Cero escrituras sobre `orders`, `product_prices`, `shipping_prices` ni tablas `catalog_*`. Los pedidos mayoristas se guardan en la tabla propia `wholesale_orders`.
- **Migraciones:** `add_wholesale_models` (ya aplicada en producción) y una segunda migración aditiva `add_wholesale_orders` (enum `WholesaleOrderStatus` + tabla `wholesale_orders`); ambas crean únicamente objetos nuevos, compatibles con el schema que usa `tikkiguau-tiendas`.
- **Datos personales:** se almacena el teléfono del cliente (y la referencia/notas que escriba). Solo es legible desde el CMS con sesión de administrador.
- **Seed:** inserta las 8 reglas de precio/mínimo y la fila única de ajustes con los defaults acordados. Los precios de collar y correa son **propuestas a confirmar con Melizza** (ver `design.md`).
- **Acoplamiento deliberado:** activar/desactivar letras, emojis o colores en el catálogo afecta también a mayorista; precios y mínimos son independientes.

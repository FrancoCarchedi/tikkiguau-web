## Why

TikkiGuau solo vende al público minorista (`/disenar`, con pago por transferencia o Mercado Pago). Melizza quiere abrir un canal **mayorista** para revendedores y negocios: pedidos por volumen de letras, emojis, collares y correas, con precios y mínimos distintos a los del retail. Hoy esos pedidos se gestionan de forma informal; una sección dedicada ordena el pedido (colores, cantidades, mínimos, total estimado) y lo entrega ya armado por WhatsApp, sin agregar pasarela de pago ni carga operativa en el CMS.

## What Changes

- Nueva ruta pública **`/mayorista`** con un armador de pedido por pasos, basado en la app de referencia (categoría + talla → color → cantidades, resumen lateral):
  - Categorías: **Letras**, **Emojis**, **Collares**, **Correas**. Tallas: Talla 2 (Mediana) y Talla 1 (Pequeña).
  - Letras y emojis: grilla con contador por ítem. Collares y correas: contador único por color (sin personalización).
  - Resumen en vivo: unidades, faltantes para el mínimo, precio estimado, estado de cada mínimo por color.
  - Referencia del pedido (obligatoria) y notas (opcional).
  - Botón **"Enviar pedido por WhatsApp"** a TikkiGuau y botón **"Copiar texto"** con ayuda para que el cliente pegue el pedido completo en el chat (necesario cuando el pedido es muy extenso). Se descarta "Descargar Excel".
- Nuevo módulo **Mayorista** en el CMS (`/admin/mayorista`) donde Melizza configura, sin deploy:
  - Precio unitario por categoría y talla (8 precios).
  - Cantidad mínima por color por categoría y talla (8 mínimos).
  - Requisitos del pedido: mínimo de **unidades totales**, mínimo de **monto total**, o ambos (cada uno activable y con su valor).
  - Interruptor para habilitar/deshabilitar toda la sección y cada categoría/talla.
- Tablas Prisma **nuevas y aisladas** para reglas mayoristas; seed con los valores por defecto.
- Reutilización del catálogo existente (colores base, colores de elementos, letras, emojis, tallas por emoji) en modo solo lectura.
- Enlace a `/mayorista` en Navbar y Footer; entrada en sitemap.

## Capabilities

### New Capabilities

- `wholesale-pricing-rules`: administración (CMS) de precios, mínimos por color y requisitos de pedido mayorista; aislamiento respecto del retail; lectura pública de la configuración.
- `wholesale-order-builder`: armador público de pedido mayorista (categorías, tallas, colores, cantidades, cálculo, validación de mínimos).
- `wholesale-whatsapp-submission`: generación del mensaje y envío por WhatsApp; sin persistencia ni pasarela.

### Modified Capabilities

- `site-seo`: la ruta `/mayorista` incorpora metadata propia y entrada en el sitemap.

## Impact

- **Prisma:** `prisma/schema.prisma` (+ migración), `prisma/seed-wholesale.ts`, `prisma/seed.ts`.
- **Lógica:** nuevo `lib/wholesale/` (cálculo, validación, mensaje), `types/wholesale.ts`.
- **API (admin):** `app/api/wholesale/settings`, `app/api/wholesale/price-rules`.
- **CMS:** `app/admin/(protected)/mayorista/`, hooks `use-wholesale-*.ts`, entrada en `components/admin/admin-sidebar.tsx`.
- **Público:** `app/mayorista/page.tsx`, `components/wholesale/*`, `components/web/Navbar.tsx`, `components/web/Footer.tsx`, `app/sitemap.ts`.
- **BD compartida con `tikkiguau-tiendas`:** se agregan **solo tablas nuevas** sin FK a tablas existentes. No se modifica `orders`, `stores` ni el catálogo. `tikkiguau-tiendas` queda **fuera de alcance**.
- **Retail:** `ProductPrice`, `GET /api/catalog`, `POST /api/orders`, emails y Mercado Pago no se tocan.

## Non-goals

- Pasarela de pago, Mercado Pago, transferencia o emails automáticos en el flujo mayorista.
- Persistir pedidos mayoristas (sin `Order`, sin listado en el CMS, sin estados ni número de pedido).
- Personalización de collares y correas mayoristas (letras/emojis aplicados); se venden lisos.
- Cuentas de cliente, listas de precios por cliente, descuentos por escalón/franja de volumen o cupones.
- Cálculo de envío mayorista; se coordina por WhatsApp.
- Exportar o descargar el pedido como Excel.
- Gestionar colores, letras o emojis específicos para mayorista (se comparten con retail).
- Modificar `tikkiguau-tiendas`.

## Impacto en datos existentes

- **Órdenes y catálogo retail:** sin cambios. Cero escrituras sobre `orders`, `product_prices`, `shipping_prices` ni tablas `catalog_*`.
- **Migración:** crea únicamente tablas y enums nuevos; compatible con el schema que usa `tikkiguau-tiendas`.
- **Seed:** inserta las 8 reglas de precio/mínimo y la fila única de ajustes con los defaults acordados. Los precios de collar y correa son **propuestas a confirmar con Melizza** (ver `design.md`).
- **Acoplamiento deliberado:** activar/desactivar letras, emojis o colores en el catálogo afecta también a mayorista; precios y mínimos son independientes.

## Why

El diseñador restringía las correas a solo emojis, mientras que el copy de negocio (FAQ, documentación) ya prometía letras y emojis en collares y correas. Había que alinear el UI con la decisión de producto.

## What Changes

- El `ElementEditor` muestra el teclado de letras también en `mode="leash"`.
- Subtítulos y empty state de correa mencionan letras y emojis.
- La guía “Cómo personalizar” usa el mismo texto que en collar.

## Capabilities

### New Capabilities

- `designer-leash-letters`: Paridad de personalización collar/correa (letras + emojis) en `/disenar`.

### Modified Capabilities

_(ninguna)_

## Impact

- **Archivos:** `components/designer/steps/ElementEditor.tsx`, `components/designer/DesignerPage.tsx`, `components/designer/LeashPreview.tsx`.
- **APIs / BD:** sin cambios (el modelo ya persistía `type: 'letter'` en correas).
- **tikkiguau-tiendas:** sync en change aparte / mismo sprint de paridad.

## Non-goals

- Cambiar límites MIN/MAX de piezas de correa.
- Cambiar catálogo CMS de letras/emojis.
- Alterar el flujo de checkout o envío.

## Impacto en datos existentes

- Sin impacto en órdenes ya creadas.
- Pedidos nuevos de correa pueden incluir letras en `orderItems` (formato ya soportado).

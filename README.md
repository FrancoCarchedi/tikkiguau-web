# TikkiGuau Page

- **Objetivo**: Diseñar y desarrollar un proyecto de sitio web + panel de administración (CMS) para TikkiGuau, una marca especializada en diseños personalizados de collares para perros. El sitio web debe mostrar el producto con todas sus características, imágenes, tabla de medidas, información de envíos, métodos de pago, y un previsualizador de collares donde el usuario podrá armar el diseño a medida de su collar para posteriormente comprarlo.

- **Reglas de negocio**:
  - **Catálogo de Productos**: Existen 3 opciones de compra base con precios fijos: Collar ($20.000 ARS), Correa ($22.000 ARS) y Combo Collar + Correa ($37.000 ARS). 
  - **Personalización**: Las opciones de diseño y personalización se gestionan desde el código fuente del frontend.
  - **Checkout y Usuarios**: Todas las compras se realizan como invitado (Guest Checkout). No hay registro de usuarios o clientes en el sitio web.
  - **Envíos**: El usuario puede elegir retiro, envío por Correo Argentino a domicilio, o a una sucursal. Si se elige Correo Argentino, el costo del envío se calculará y sumará automáticamente al precio final de compra.
  - **Pagos**: Únicamente mediante transferencia bancaria. Al finalizar la orden, el sitio le indicará al usuario que de enviar su comprobante de pago vía WhatsApp citando el Número de Orden generado.

- **Requerimientos técnicos**: Tanto para el sitio web como para el CMS se utilizará Tailwind para la generación de componentes de UI. Para el CMS se utilizará Better Auth para hacer autenticación, una base de datos Neon Postgres, Prisma como ORM para interactuar con la base de datos, TanStack Query y Axios para fetching de datos, mutations, estados, caching y errores.

## CMS

Necesito integrar la base de datos Postgres Neon, y Prisma ORM para optimizar las consultas. En primer lugar, necesito crear un seeder que yo pueda ejecutar para crear el usuario administrador, el cual será el único usuario en la plataforma que tendrá acceso total.
La ruta para acceder al panel de administración será `midominio/admin`, y si no estoy autenticado me redirigirá a `midominio/admin/sign-in`.
Una vez iniciada la sesión, debo poder ver una tabla de ordenes **(Orders)** con una lista de ordenes.
Para las ordenes tendré id, número de orden, nombre, apellido, email, dirección, ciudad, código postal, fecha de creación de la orden, fecha de actualización de la orden, entrega (o algo que determine si el cliente pasa a buscar el producto por la tienda, o elige que se la envien a su domicilio o a una sucursal de Correo Argentino), y estado del pedido (los típicos estados que se suelen utilizar para ordenes).

## CMS (Panel de Administración)

El panel será de acceso exclusivo para el Administrador para procesar y hacer seguimiento de las ventas.

- **Autenticación (Better Auth)**:
  - Existirá un script (seeder) ejecutable para generar el usuario administrador único con acceso total (por el momento, un esquema de rol único).
  - La ruta será `/admin`. Si la sesión no está activa, redireccionará obligatoriamente a `/admin/sign-in`.

- **Gestión de Órdenes**:
  Habrá un dashboard principal con la tabla de órdenes registradas. Cada orden contendrá en Base de Datos:
  - **Datos Generales**: `ID`, `Número de Orden` (código corto amigable), `Fecha de creación`, `Fecha de actualización`.
  - **Datos del Cliente (Guest)**: `Nombre`, `Apellido`, `Email`, `Teléfono`.
  - **Datos de Envío**: `Tipo de entrega` (Retiro, Envío Domicilio, Envío Sucursal), `Dirección`, `Ciudad`, `Código Postal`, `Tracking Code` (código de seguimiento de Correo Argentino que el admin podrá cargar manualmente).
  - **Datos Financieros**: `Total Orden` (calculando productos + envío si aplica).
  - **Detalle de Compra (JSON)**: Campo estructurado en JSON (Ej: `order_items`) que almacene los productos comprados (collar, correa o combo) junto con el detalle exacto de su personalización en el momento en que se generó la compra.

    Ejemplo de estructura JSON:

    ```json
    [
      {
        "productType": "both",
        "productLabel": "Combo (Collar + Correa)",
        "price": 37000,
        "collar": {
          "size": "Talla 1",
          "colorValue": "#C70F11",
          "colorName": "Rojo",
          "elements": [
            { "type": "letter", "value": "L", "colorValue": "#0041B9", "colorName": "Azul" },
            { "type": "emoji",  "value": "corazon", "colorValue": "#FAFAFA", "colorName": "Blanco" },
            { "type": "letter", "value": "A", "colorValue": "#E0374E", "colorName": "Rojo" }
          ]
        },
        "correa": {
          "size": "Talla 1",
          "colorValue": "#111111",
          "colorName": "Negro",
          "elements": [
            { "type": "emoji", "value": "patitas", "colorValue": "#FAFAFA", "colorName": "Blanco" },
            { "type": "emoji", "value": "calavera", "colorValue": "#FAFAFA", "colorName": "Blanco" },
            { "type": "emoji", "value": "patitas", "colorValue": "#FAFAFA", "colorName": "Blanco" }
          ]
        }
      },
      {
        "productType": "collar",
        "productLabel": "Collar",
        "price": 20000,
        "collar": {
          "size": "Talla 2",
          "colorValue": "#2A6A5C",
          "colorName": "Verde oscuro",
          "elements": [
            { "type": "letter", "value": "R", "colorValue": "#1B1B1B", "colorName": "Negro" },
            { "type": "letter", "value": "E", "colorValue": "#FAC2DD", "colorName": "Rosa" },
            { "type": "letter", "value": "X", "colorValue": "#1B1B1B", "colorName": "Negro" }
          ]
        }
      }
    ]
    ```
  - **Estado**: Se manejará un ciclo de vida lineal y simple: `Pendiente` -> `Aprobado` -> `Rechazado` -> `Entregado`.

- **Gestión de Tiendas**:
  - Habrá una sección que será navegable desde la sidebar donde se podrá gestionar las tiendas. La idea desde aca es tener un listado de tiendas.
  Cada tienda tendrá un id, nombre, una palabra clave (keyword), fecha de creación, y fecha de actualización.

## Website

- Integración del carrito de compras capaz de acumular productos individuales o combos.
- Previsualizador interactivo que construya el JSON final que se enviará en el pedido.
- Flujo de checkout que capture los datos del contacto, sume los costos logísticos según el método de entrega seleccionado y culmine derivando al pago manual por WhatsApp.
## Emails (Resend)

Ver `.env.example` para `RESEND_API_KEY`, `EMAIL_FROM` y `ORDER_NOTIFY_EMAIL`.

Hay que verificar el dominio de env�o en el dashboard de Resend (registros DNS SPF/DKIM). Sin esas variables la app funciona pero no env�a correos (la creaci�n/actualizaci�n de �rdenes no falla).

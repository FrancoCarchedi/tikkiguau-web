## Context

`ElementEditor` usaba `showLetters = mode === 'collar'`, ocultando el teclado QWERTY en correas. Tipos, handlers (`addLeashElement`) y `LeashPreview` ya renderizaban letras si estaban en el array.

## Goals / Non-Goals

**Goals:**

- Exponer letras en el paso de diseño de correa.
- Alinear copy (subtítulo, empty state, guía).

**Non-goals:**

- Nuevos tipos de elemento o límites distintos.
- Cambios de CMS.

## Decisions

### 1. Gate por producto unificado

**Decisión:** `showLetters = mode === 'collar' || mode === 'leash'` (equivalente a siempre true con los modos actuales).

**Alternativa descartada:** Componente separado para correa — duplicaría teclado y DnD.

### 2. Sin cambios de persistencia

**Decisión:** Reutilizar `CollarElement` y el snapshot JSON existente.

## Risks / Trade-offs

- **[Pedidos de correa más complejos de confeccionar]** → aceptado: es la oferta comercial documentada; los límites MAX siguen acotando piezas.

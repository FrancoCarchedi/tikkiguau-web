import { Camera } from "lucide-react";
import { COLLAR_COLORS } from "@/types/collar";

/*
  Mosaic layout (desktop, 3 cols × 3 rows of 180px each):

  Col:  1          2          3
       ┌──────────┬─────────────────┐
  R1   │  A tall  │   B wide        │
       │  (1×2)   ├─────────┬───────┤
  R2   │          │  C      │  D    │
       ├──────────┴──────────┤       │
  R3   │  E wide             │  F    │
       └─────────────────────┴───────┘
*/

const ITEMS = [
  { colorIndex: 0, label: "Collar personalizado",   aspectRatio: "1:1",  minRes: "800 × 800 px" },
  { colorIndex: 4, label: "Correa con diseño",      aspectRatio: "9:2",  minRes: "1600 × 360 px" },
  { colorIndex: 5, label: "Diseño con letras",      aspectRatio: "2:1",  minRes: "800 × 360 px" },
  { colorIndex: 2, label: "Combo collar + correa",  aspectRatio: "2:1",  minRes: "800 × 360 px" },
  { colorIndex: 7, label: "Diseño con emojis",      aspectRatio: "9:2",  minRes: "1600 × 360 px" },
  { colorIndex: 3, label: "Collar talla XS",        aspectRatio: "2:1",  minRes: "800 × 360 px" },
];

function PlaceholderCell({
  colorIndex,
  label,
  aspectRatio,
  minRes,
  className = "",
}: {
  colorIndex: number;
  label: string;
  aspectRatio: string;
  minRes: string;
  className?: string;
}) {
  const color = COLLAR_COLORS[colorIndex];
  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-2xl overflow-hidden group ${className}`}
      style={{ backgroundColor: color.value }}
    >
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[20px_20px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-2 text-white/75 group-hover:text-white/95 transition-colors">
        <Camera className="w-8 h-8" strokeWidth={1.5} />
        <span className="text-sm font-semibold text-center px-4">{label}</span>
        <div className="flex flex-col items-center gap-0.5 mt-1">
          <span className="text-xs font-medium text-white/80 bg-black/20 backdrop-blur-sm rounded-full px-2.5 py-0.5">
            {aspectRatio}
          </span>
          <span className="text-xs text-white/60">{minRes}</span>
        </div>
      </div>

      {/* Color label */}
      <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-black/20 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white">
        {color.name}
      </span>
    </div>
  );
}

export default function GallerySection() {
  return (
    <section id="galeria" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Únicos como tu mascota
          </h2>
          <p className="mt-4 text-lg text-zinc-500 max-w-2xl mx-auto">
            Cada diseño es una combinación irrepetible de colores, letras y
            emojis. Próximamente, las fotos de nuestros productos.
          </p>
        </div>

        {/* Mosaic — desktop */}
        <div
          className="hidden md:grid grid-cols-3 gap-4"
          style={{ gridTemplateRows: "repeat(3, 180px)" }}
        >
          {/* A: col 1, rows 1–2 (tall) */}
          <PlaceholderCell
            colorIndex={ITEMS[0].colorIndex}
            label={ITEMS[0].label}
            aspectRatio={ITEMS[0].aspectRatio}
            minRes={ITEMS[0].minRes}
            className="col-start-1 row-start-1 row-span-2"
          />
          {/* B: cols 2–3, row 1 (wide) */}
          <PlaceholderCell
            colorIndex={ITEMS[1].colorIndex}
            label={ITEMS[1].label}
            aspectRatio={ITEMS[1].aspectRatio}
            minRes={ITEMS[1].minRes}
            className="col-start-2 col-span-2 row-start-1"
          />
          {/* C: col 2, row 2 */}
          <PlaceholderCell
            colorIndex={ITEMS[2].colorIndex}
            label={ITEMS[2].label}
            aspectRatio={ITEMS[2].aspectRatio}
            minRes={ITEMS[2].minRes}
            className="col-start-2 row-start-2"
          />
          {/* D: col 3, row 2 */}
          <PlaceholderCell
            colorIndex={ITEMS[3].colorIndex}
            label={ITEMS[3].label}
            aspectRatio={ITEMS[3].aspectRatio}
            minRes={ITEMS[3].minRes}
            className="col-start-3 row-start-2"
          />
          {/* E: cols 1–2, row 3 (wide) */}
          <PlaceholderCell
            colorIndex={ITEMS[4].colorIndex}
            label={ITEMS[4].label}
            aspectRatio={ITEMS[4].aspectRatio}
            minRes={ITEMS[4].minRes}
            className="col-start-1 col-span-2 row-start-3"
          />
          {/* F: col 3, row 3 */}
          <PlaceholderCell
            colorIndex={ITEMS[5].colorIndex}
            label={ITEMS[5].label}
            aspectRatio={ITEMS[5].aspectRatio}
            minRes={ITEMS[5].minRes}
            className="col-start-3 row-start-3"
          />
        </div>

        {/* Mosaic — mobile (2-col uniform grid) */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {ITEMS.map((item, i) => (
            <PlaceholderCell
              key={i}
              colorIndex={item.colorIndex}
              label={item.label}
              aspectRatio={item.aspectRatio}
              minRes={item.minRes}
              className="aspect-square"
            />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-zinc-400 italic">
          Las fotos reales de los productos se agregarán próximamente.
        </p>
      </div>
    </section>
  );
}


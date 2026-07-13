import Image from "next/image";
import { Camera } from "lucide-react";
import type { CatalogBaseColorDto } from "@/types/catalog";

type GalleryItem = {
  colorIndex: number;
  label: string;
  aspectRatio: string;
  minRes: string;
  imageSrc?: string;
  imageSrcSquare?: string;
  imageAlt?: string;
};

/*
  Mosaic layout (desktop, 3 cols × 3 rows of 180px each):

  Col:  1          2          3
       ┌──────────┬─────────────────┐
  R1   │  A tall  │   B wide        │
       │  (1×2)   ├─────────┬───────┤
  R2   │          │  C      │  D    │
       ├──────────┴──────────┤ tall │
  R3   │  E wide             │ (1×2)│
       └─────────────────────┴───────┘
*/

const ITEMS: GalleryItem[] = [
  {
    colorIndex: 0,
    label: "Collar personalizado",
    aspectRatio: "1:1",
    minRes: "800 × 800 px",
    imageSrc: "/images/collar_personalizado.png",
    imageSrcSquare: "/images/collar_personalizado.png",
    imageAlt: "Collar personalizado",
  },
  {
    colorIndex: 4,
    label: "Collares personalizados con emojis",
    aspectRatio: "9:2",
    minRes: "1600 × 360 px",
    imageSrc: "/images/diseno_emojis.png",
    imageSrcSquare: "/images/diseno_emojis_square.png",
    imageAlt: "Collares personalizados con emojis",
  },
  {
    colorIndex: 5,
    label: "Diseño con letras",
    aspectRatio: "2:1",
    minRes: "800 × 360 px",
    imageSrc: "/images/diseno_letras.png",
    imageSrcSquare: "/images/diseno_letras_square.png",
    imageAlt: "Correa personalizada con letras",
  },
  {
    colorIndex: 2,
    label: "Vamos Argentina!",
    aspectRatio: "2:3",
    minRes: "800 × 1200 px",
    imageSrc: "/images/vamos_argentina.png",
    imageSrcSquare: "/images/vamos_argentina.png",
    imageAlt: "¡Vamos Argentina! Collar personalizado de Argentina",
  },
  {
    colorIndex: 7,
    label: "Diseño con emojis",
    aspectRatio: "9:2",
    minRes: "1600 × 360 px",
    imageSrc: "/images/pet_delivery.png",
    imageSrcSquare: "/images/pet_delivery_square.png",
    imageAlt: "Empaque personalizado de productos de TikkiGuau",
  },
];

function GalleryCell({
  colorIndex,
  label,
  aspectRatio,
  minRes,
  imageSrc,
  imageSrcSquare,
  imageAlt,
  className = "",
  baseColors,
  imageVariant = "desktop",
}: GalleryItem & {
  className?: string;
  baseColors: CatalogBaseColorDto[];
  imageVariant?: "desktop" | "mobile";
}) {
  const resolvedImageSrc =
    imageVariant === "mobile" && imageSrcSquare ? imageSrcSquare : imageSrc;

  if (resolvedImageSrc) {
    return (
      <div
        className={`relative rounded-2xl overflow-hidden group ${className}`}
      >
        <Image
          src={resolvedImageSrc}
          alt={imageAlt ?? label}
          fill
          className="object-cover object-center"
          sizes={
            imageVariant === "mobile"
              ? "50vw"
              : "(max-width: 1280px) 66vw, 805px"
          }
        />
      </div>
    );
  }

  const color = baseColors[colorIndex] ?? baseColors[0];
  if (!color) return null;
  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-2xl overflow-hidden group ${className}`}
      style={{ backgroundColor: color.hexValue }}
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

export default function GallerySection({
  baseColors,
}: {
  baseColors: CatalogBaseColorDto[];
}) {
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
          <GalleryCell
            {...ITEMS[0]}
            className="col-start-1 row-start-1 row-span-2"
            baseColors={baseColors}
          />
          {/* B: cols 2–3, row 1 (wide) */}
          <GalleryCell
            {...ITEMS[1]}
            className="col-start-2 col-span-2 row-start-1"
            baseColors={baseColors}
          />
          {/* C: col 2, row 2 */}
          <GalleryCell
            {...ITEMS[2]}
            className="col-start-2 row-start-2"
            baseColors={baseColors}
          />
          {/* D: col 3, rows 2–3 (tall / vertical) */}
          <GalleryCell
            {...ITEMS[3]}
            className="col-start-3 row-start-2 row-span-2"
            baseColors={baseColors}
          />
          {/* E: cols 1–2, row 3 (wide) */}
          <GalleryCell
            {...ITEMS[4]}
            className="col-start-1 col-span-2 row-start-3"
            baseColors={baseColors}
          />
        </div>

        {/* Mosaic — mobile (2-col grid; last item spans both cols as wide image) */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {ITEMS.map((item, i) => {
            const isLast = i === ITEMS.length - 1;
            return (
              <GalleryCell
                key={i}
                {...item}
                // Last item: force horizontal pet_delivery (not the square crop)
                imageSrcSquare={isLast ? undefined : item.imageSrcSquare}
                imageVariant="mobile"
                className={isLast ? "col-span-2 aspect-[9/2]" : "aspect-square"}
                baseColors={baseColors}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

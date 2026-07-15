import Image from "next/image";
import type { CatalogBaseColorDto } from "@/types/catalog";

type GalleryItem = {
  label: string;
  imageSrc: string;
  imageAlt: string;
};

const ITEMS: GalleryItem[] = [
  {
    label: "Collar personalizado",
    imageSrc: "/images/vamos_argentina.png",
    imageAlt: "Collar personalizado",
  },
  {
    label: "Collares personalizados con emojis",
    imageSrc: "/images/lola.png",
    imageAlt: "Collares personalizados con emojis",
  },
  {
    label: "Diseño con letras",
    imageSrc: "/images/oreo.png",
    imageAlt: "Correa personalizada con letras",
  },
  {
    label: "Vamos Argentina!",
    imageSrc: "/images/pet_livery.png",
    imageAlt: "¡Vamos Argentina! Collar personalizado de Argentina",
  },
  {
    label: "Diseño con emojis",
    imageSrc: "/images/collares.png",
    imageAlt: "Empaque personalizado de productos de TikkiGuau",
  },
  {
    label: "Diseño con emojis",
    imageSrc: "/images/mora.png",
    imageAlt: "Empaque personalizado de productos de TikkiGuau",
  },
];

function GalleryCell({ label, imageSrc, imageAlt }: GalleryItem) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl group">
      <Image
        src={imageSrc}
        alt={imageAlt ?? label}
        fill
        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}

export default function GallerySection({
  baseColors: _baseColors,
}: {
  baseColors: CatalogBaseColorDto[];
}) {
  return (
    <section id="galeria" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left md:text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mb-4">
            Únicos como tu mascota
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Cada diseño es una combinación irrepetible de colores, letras y
            emojis.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {ITEMS.map((item) => (
            <GalleryCell key={item.imageSrc} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

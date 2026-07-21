"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { scrollToSection } from "@/lib/scroll-to-section";

export default function Hero() {
  return (
    <section className="relative flex items-start md:items-center min-h-screen pt-16 overflow-hidden">
      {/* Mobile: perros abajo, espacio rojo arriba para el copy */}
      <Image
        src="/images/hero__banner_mobile.webp"
        alt="Dos perros con collares personalizados TikkiGuau"
        fill
        className="object-cover object-bottom md:hidden"
        priority
        quality={90}
        sizes="100vw"
      />

      {/* Desktop */}
      <Image
        src="/images/hero__banner.webp"
        alt="Dos perros con collares personalizados TikkiGuau"
        fill
        className="hidden object-cover object-right md:block"
        priority
        quality={90}
        sizes="100vw"
      />

      {/* Overlay solo en desktop: en mobile el banner ya es rojo limpio arriba */}
      <div className="absolute inset-0 hidden bg-linear-to-r from-[#C70F11]/40 via-[#C70F11]/20 to-transparent md:block" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-56 md:py-24">
        <div className="max-w-xl">
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
            Accesorios únicos para mascotas únicas
          </h1>
          <p className="mt-6 text-base sm:text-xl text-white/90 leading-relaxed drop-shadow-sm">
            Elegí colores, letras y emojis. Armá el diseño perfecto para tu
            perro o gato y hacelo realidad desde casa.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/disenar"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white text-[#C70F11] hover:bg-white hover:text-[#C70F11] [a]:hover:bg-white [a]:hover:text-[#C70F11] border-transparent font-bold text-base px-8 h-12 shadow-md"
              )}
            >
              Diseñar mi collar
            </Link>
            <button
              type="button"
              onClick={() => scrollToSection("productos")}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-transparent text-white border-white hover:bg-white/10 font-semibold text-base px-8 h-12 cursor-pointer"
              )}
            >
              Ver productos
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

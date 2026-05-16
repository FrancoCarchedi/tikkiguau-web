import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative flex items-center min-h-screen pt-16 overflow-hidden">
      {/* Background banner */}
      <Image
        src="/images/hero__banner.png"
        alt="Dos perros con collares personalizados TikkiGuau"
        fill
        className="object-cover object-right"
        priority
        quality={90}
      />

      {/* Overlay: subtle gradient on desktop for text legibility, stronger on mobile */}
      <div className="absolute inset-0 bg-linear-to-r from-[#C70F11]/80 via-[#C70F11]/50 to-transparent md:from-[#C70F11]/40 md:via-[#C70F11]/20 md:to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
            Collares únicos para mascotas únicas
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/90 leading-relaxed drop-shadow-sm">
            Elegí colores, letras y emojis. Armá el diseño perfecto para tu
            perro o gato y hacelo realidad desde casa.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/disenar"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white text-[#C70F11] hover:bg-white/90 border-transparent font-bold text-base px-8 h-12 shadow-md"
              )}
            >
              Diseñar mi collar
            </Link>
            <a
              href="#productos"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-transparent text-white border-white hover:bg-white/10 font-semibold text-base px-8 h-12"
              )}
            >
              Ver productos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

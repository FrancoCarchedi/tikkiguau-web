import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { ProductPriceDto } from "@/types/catalog";
import type { ProductType } from "@/types/collar";

const PRODUCT_CONFIG: Record<
  ProductType,
  { accent: string; bgAccent: string; badge?: string; pieces: string }
> = {
  collar: {
    accent: "#1C5394",
    bgAccent: "#1C5394",
    pieces: "6 piezas",
  },
  leash: {
    accent: "#2A6A5C",
    bgAccent: "#2A6A5C",
    pieces: "10 piezas",
  },
  both: {
    accent: "#C70F11",
    bgAccent: "#C70F11",
    badge: "Más elegido",
    pieces: "16 piezas (6 collar + 10 correa)",
  },
};

const ORDERED_PRODUCTS = ["collar", "leash", "both"] as ProductType[];

function formatPrice(amountArs: number): string {
  return `$${amountArs.toLocaleString("es-AR")}`;
}

export default function ProductsSection({
  productPrices,
}: {
  productPrices: ProductPriceDto[];
}) {
  return (
    <section id="productos" className="py-24 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left md:text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mb-4">
            Nuestros productos
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Diseñá el collar o la correa perfecta para tu mascota. <br />
            Combiná colores, letras y emojis a tu gusto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {ORDERED_PRODUCTS.map((type) => {
            const product = productPrices.find((p) => p.productType === type);
            if (!product) return null;
            const config = PRODUCT_CONFIG[type];
            const isFeatured = type === "both";

            return (
              <div
                key={type}
                className={cn(
                  "relative flex flex-col rounded-2xl bg-white overflow-hidden transition-shadow",
                  isFeatured
                    ? "shadow-xl ring-2 ring-[#C70F11]"
                    : "shadow-md hover:shadow-lg"
                )}
              >
                <div
                  className="h-2 w-full shrink-0"
                  style={{ backgroundColor: config.accent }}
                />

                <div className="flex flex-col flex-1 p-7 gap-5">
                  <div>
                    <div className="flex flex-wrap items-start gap-3">
                      <h3 className="text-2xl font-extrabold text-zinc-900">
                        {product.label}
                      </h3>
                      {config.badge && (
                        <span className="inline-flex items-center rounded-full bg-[#C70F11] px-3 py-0.5 text-xs font-bold text-white uppercase tracking-wide mt-1">
                          {config.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">
                      {product.description}
                    </p>
                  </div>

                  <div>
                    <span className="text-4xl font-extrabold text-zinc-900">
                      {formatPrice(product.amountArs)}
                    </span>
                    <span className="ml-1 text-sm font-medium text-zinc-400">
                      ARS
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: config.accent }}
                    >
                      {product.pieces} piezas
                    </span>
                    <span className="text-xs text-zinc-400">
                      para personalizar
                    </span>
                  </div>

                  <hr className="border-zinc-100" />

                  {type === "both" && (
                    <ul className="text-sm text-zinc-500 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#1C5394] inline-block" />
                        Collar — 6 piezas
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2A6A5C] inline-block" />
                        Correa — 10 piezas
                      </li>
                    </ul>
                  )}

                  <div className="flex-1" />

                  <Link
                    href="/disenar"
                    className={cn(
                      buttonVariants({ size: "default" }),
                      "w-full justify-center font-semibold border-transparent",
                      isFeatured
                        ? "bg-[#C70F11] text-white hover:bg-[#a50d0f]"
                        : "bg-zinc-900 text-white hover:bg-zinc-700"
                    )}
                  >
                    Diseñar {product.label.toLowerCase()}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

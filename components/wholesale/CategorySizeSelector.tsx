"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, SIZE_SHORT_LABELS } from "@/lib/wholesale/constants";
import type { WholesaleCategory, WholesaleSizeValue } from "@/types/wholesale";

interface CategorySizeSelectorProps {
  categories: WholesaleCategory[];
  sizes: WholesaleSizeValue[];
  selectedCategory: WholesaleCategory;
  selectedSize: WholesaleSizeValue;
  onSelectCategory: (category: WholesaleCategory) => void;
  onSelectSize: (size: WholesaleSizeValue) => void;
  /** Unidades cargadas por categoría, para mostrar un indicador en cada pestaña. */
  unitsByCategory: Record<WholesaleCategory, number>;
}

const CATEGORY_ICONS: Record<WholesaleCategory, string> = {
  LETTER: "Aa",
  EMOJI: "★",
  COLLAR: "◯",
  LEASH: "∿",
};

export default function CategorySizeSelector({
  categories,
  sizes,
  selectedCategory,
  selectedSize,
  onSelectCategory,
  onSelectSize,
  unitsByCategory,
}: CategorySizeSelectorProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div role="tablist" aria-label="Categoría" className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = category === selectedCategory;
          const units = unitsByCategory[category];

          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectCategory(category)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C70F11]/60",
                isSelected
                  ? "border-[#C70F11] bg-[#C70F11] text-white shadow-sm"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              )}
            >
              <span aria-hidden className="text-base leading-none">
                {CATEGORY_ICONS[category]}
              </span>
              {CATEGORY_LABELS[category]}
              {units > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    isSelected ? "bg-white/25" : "bg-zinc-100 text-zinc-600"
                  )}
                >
                  {units}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {sizes.length > 1 && (
        <div
          role="radiogroup"
          aria-label="Talla"
          className="inline-flex rounded-xl border border-zinc-200 bg-white p-1"
        >
          {sizes.map((size) => {
            const isSelected = size === selectedSize;

            return (
              <button
                key={size}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectSize(size)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C70F11]/60",
                  isSelected
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                )}
              >
                {SIZE_SHORT_LABELS[size]}
                <span className="ml-1 text-xs font-normal opacity-70">T{size}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

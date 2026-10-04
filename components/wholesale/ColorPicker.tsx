"use client";

import { cn } from "@/lib/utils";
import type { WholesaleColorOption } from "@/lib/wholesale/catalog-options";

interface ColorPickerProps {
  colors: WholesaleColorOption[];
  selectedColorHex: string;
  onSelectColor: (colorHex: string) => void;
  /** Unidades cargadas por color en la combinación actual (categoría + talla). */
  unitsByColor: Record<string, number>;
  /** Descripción de la combinación activa, por ejemplo "Azul · Mediana · Letras A–Z". */
  selectionLabel: string;
  minUnitsPerColor: number;
  unitsInSelectedColor: number;
}

export default function ColorPicker({
  colors,
  selectedColorHex,
  onSelectColor,
  unitsByColor,
  selectionLabel,
  minUnitsPerColor,
  unitsInSelectedColor,
}: ColorPickerProps) {
  const missingUnits = Math.max(0, minUnitsPerColor - unitsInSelectedColor);
  const hasUnits = unitsInSelectedColor > 0;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="wholesale-step-color">
      <h2
        id="wholesale-step-color"
        className="text-xs font-bold uppercase tracking-widest text-zinc-500"
      >
        1 · Elegí el color
      </h2>

      <div role="radiogroup" aria-label="Color" className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = color.hexValue.toUpperCase() === selectedColorHex.toUpperCase();
          const units = unitsByColor[color.hexValue.toUpperCase()] ?? 0;

          return (
            <button
              key={color.hexValue}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={color.name}
              title={color.name}
              onClick={() => onSelectColor(color.hexValue)}
              className="relative flex flex-col items-center gap-1 focus-visible:outline-none"
            >
              <span
                className={cn(
                  "block size-9 rounded-full border-2 transition-transform sm:size-10",
                  isSelected
                    ? "scale-110 border-zinc-900 ring-2 ring-zinc-900/20"
                    : "border-zinc-200 hover:scale-105"
                )}
                style={{ backgroundColor: color.hexValue }}
              />
              {units > 0 && (
                <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-[#C70F11] px-1 text-center text-[10px] font-bold leading-5 text-white tabular-nums">
                  {units}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm">
        <span className="font-semibold text-zinc-800">{selectionLabel}</span>
        {minUnitsPerColor > 0 && (
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              hasUnits && missingUnits > 0 ? "text-amber-700" : "text-zinc-500"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-2 rounded-full",
                !hasUnits ? "bg-zinc-300" : missingUnits > 0 ? "bg-amber-500" : "bg-emerald-500"
              )}
            />
            {hasUnits
              ? missingUnits > 0
                ? `${unitsInSelectedColor} / ${minUnitsPerColor} u · faltan ${missingUnits}`
                : `${unitsInSelectedColor} u · mínimo cumplido`
              : `mín. ${minUnitsPerColor} u por color`}
          </span>
        )}
      </div>
    </section>
  );
}

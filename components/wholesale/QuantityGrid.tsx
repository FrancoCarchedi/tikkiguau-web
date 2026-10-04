"use client";

import { EmojiRenderer } from "@/components/designer/custom-emojis/EmojiRenderer";
import { cn } from "@/lib/utils";
import type { WholesaleItemOption } from "@/lib/wholesale/catalog-options";
import { isLightColor } from "@/lib/wholesale/color";
import type { WholesaleCategory } from "@/types/wholesale";
import QuantityCounter from "./QuantityCounter";

interface QuantityGridProps {
  category: Extract<WholesaleCategory, "LETTER" | "EMOJI">;
  items: WholesaleItemOption[];
  colorHex: string;
  quantities: Record<string, number>;
  onChangeQuantity: (itemKey: string, quantity: number) => void;
}

export default function QuantityGrid({
  category,
  items,
  colorHex,
  quantities,
  onChangeQuantity,
}: QuantityGridProps) {
  const needsDarkBackground = isLightColor(colorHex);

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
        No hay {category === "LETTER" ? "letras" : "emojis"} disponibles para este color y talla.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => {
        const quantity = quantities[item.key] ?? 0;

        return (
          <li
            key={item.key}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border bg-white p-3 shadow-sm transition-colors",
              quantity > 0 ? "border-[#C70F11]/50" : "border-zinc-200"
            )}
          >
            <div
              className={cn(
                "flex h-16 w-full items-center justify-center rounded-lg",
                needsDarkBackground ? "bg-zinc-800" : "bg-zinc-50"
              )}
            >
              {category === "LETTER" ? (
                <span
                  className="text-4xl font-extrabold leading-none select-none"
                  style={{ color: colorHex }}
                >
                  {item.label}
                </span>
              ) : (
                <EmojiRenderer
                  emojiKey={item.key}
                  fillColor={colorHex}
                  style={{ width: "2.5rem", height: "2.5rem" }}
                />
              )}
            </div>
            {category === "EMOJI" && (
              <span className="text-xs font-medium text-zinc-600">{item.label}</span>
            )}
            <QuantityCounter
              value={quantity}
              onChange={(value) => onChangeQuantity(item.key, value)}
              itemLabel={item.label}
            />
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_UNITS_PER_ITEM } from "@/lib/wholesale/constants";

interface QuantityCounterProps {
  value: number;
  onChange: (value: number) => void;
  /** Texto accesible del elemento, por ejemplo "A" o "collar Talla 2 azul". */
  itemLabel: string;
  size?: "compact" | "large";
  tone?: "light" | "dark";
}

function parseQuantity(rawValue: string): number {
  const digitsOnly = rawValue.replace(/\D/g, "");
  if (digitsOnly === "") return 0;
  return Math.min(MAX_UNITS_PER_ITEM, parseInt(digitsOnly, 10));
}

export default function QuantityCounter({
  value,
  onChange,
  itemLabel,
  size = "compact",
  tone = "light",
}: QuantityCounterProps) {
  const isLarge = size === "large";
  const buttonClass = cn(
    "flex shrink-0 items-center justify-center rounded-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C70F11]/60",
    isLarge ? "size-10" : "size-7",
    tone === "dark"
      ? "bg-zinc-700 text-white hover:bg-zinc-600"
      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
  );

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        className={buttonClass}
        disabled={value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label={`Disminuir cantidad de ${itemLabel}`}
      >
        <MinusIcon className={isLarge ? "size-4" : "size-3"} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(event) => onChange(parseQuantity(event.target.value))}
        onFocus={(event) => event.target.select()}
        aria-label={`Cantidad de ${itemLabel}`}
        className={cn(
          "min-w-0 rounded-md border bg-transparent text-center font-semibold tabular-nums outline-none focus-visible:border-[#C70F11] focus-visible:ring-2 focus-visible:ring-[#C70F11]/30",
          isLarge ? "h-10 w-20 text-lg" : "h-7 w-10 text-xs",
          tone === "dark"
            ? "border-zinc-600 text-white"
            : "border-zinc-200 text-zinc-900"
        )}
      />
      <button
        type="button"
        className={buttonClass}
        disabled={value >= MAX_UNITS_PER_ITEM}
        onClick={() => onChange(Math.min(MAX_UNITS_PER_ITEM, value + 1))}
        aria-label={`Aumentar cantidad de ${itemLabel}`}
      >
        <PlusIcon className={isLarge ? "size-4" : "size-3"} />
      </button>
    </div>
  );
}

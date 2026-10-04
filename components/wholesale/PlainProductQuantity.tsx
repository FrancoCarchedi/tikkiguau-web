"use client";

import { formatWholesaleArs } from "@/lib/wholesale/format";
import QuantityCounter from "./QuantityCounter";

interface PlainProductQuantityProps {
  productLabel: string;
  sizeLabel: string;
  colorName: string;
  colorHex: string;
  unitPriceArs: number;
  quantity: number;
  onChangeQuantity: (quantity: number) => void;
}

export default function PlainProductQuantity({
  productLabel,
  sizeLabel,
  colorName,
  colorHex,
  unitPriceArs,
  quantity,
  onChangeQuantity,
}: PlainProductQuantityProps) {
  const itemLabel = `${productLabel} ${sizeLabel} ${colorName}`;

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:justify-between">
      <div className="flex items-center gap-4">
        <span
          className="block size-14 shrink-0 rounded-full border border-zinc-200"
          style={{ backgroundColor: colorHex }}
          aria-hidden
        />
        <div>
          <p className="text-base font-semibold text-zinc-900">
            {productLabel} · {sizeLabel}
          </p>
          <p className="text-sm text-zinc-500">
            {colorName} · liso · {formatWholesaleArs(unitPriceArs)} c/u
          </p>
        </div>
      </div>
      <QuantityCounter
        value={quantity}
        onChange={onChangeQuantity}
        itemLabel={itemLabel}
        size="large"
      />
    </div>
  );
}

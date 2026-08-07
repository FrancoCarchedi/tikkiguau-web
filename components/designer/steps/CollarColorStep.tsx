"use client";

import { Check } from 'lucide-react';
import { useRequiredCatalog } from '@/components/catalog/catalog-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COLLAR_SIZES, type CollarSize } from '@/types/collar';

interface CollarColorStepProps {
  selectedColor: string;
  selectedSize: CollarSize;
  neckLengthCm?: number;
  onSelectColor: (color: string) => void;
  onSelectSize: (size: CollarSize) => void;
  onNeckLengthChange: (neckLengthCm: number | undefined) => void;
}

function parseNeckLengthInput(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed === '') return undefined;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return Math.round(value * 10) / 10;
}

export default function CollarColorStep({
  selectedColor,
  selectedSize,
  neckLengthCm,
  onSelectColor,
  onSelectSize,
  onNeckLengthChange,
}: CollarColorStepProps) {
  const catalog = useRequiredCatalog();

  return (
    <div className="space-y-5">
      <div className="text-left md:text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Elige el color y talla del collar
        </h2>
        <p className="text-muted-foreground mt-1">
          Selecciona el color y talla que mejor se adapte a tu mascota
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3 max-w-lg mx-auto">
        {catalog.baseColors.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => onSelectColor(color.hexValue)}
            className="group flex flex-col items-center gap-1.5"
          >
            <div
              className={`w-12 h-12 rounded-full border-4 transition-all duration-200 flex items-center justify-center cursor-pointer hover:scale-110 ${
                selectedColor === color.hexValue
                  ? 'border-primary shadow-soft scale-110'
                  : 'border-transparent shadow-card'
              }`}
              style={{ backgroundColor: color.hexValue }}
            >
              {selectedColor === color.hexValue && (
                <Check className="w-5 h-5 text-white drop-shadow-md" />
              )}
            </div>
            <span className="text-xs text-muted-foreground font-medium text-center leading-tight">
              {color.name}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 max-w-lg mx-auto">
        {COLLAR_SIZES.map((size) => (
          <button
            key={size.value}
            type="button"
            onClick={() => onSelectSize(size.value)}
            className={`w-full py-3 px-4 rounded-xl border-2 text-left transition-all ${
              selectedSize === size.value
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 mb-2">
              <span className="font-semibold text-foreground">{size.label}</span>
              <span className={`text-sm font-medium ${selectedSize === size.value ? 'text-primary' : 'text-muted-foreground'}`}>
                {size.description}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${selectedSize === size.value ? 'text-foreground/70' : 'text-muted-foreground'}`}>
              {size.details}
            </p>
          </button>
        ))}
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <Label htmlFor="neckLengthCm">
          Longitud aproximada del cuello{' '}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <div className="relative">
          <Input
            id="neckLengthCm"
            type="number"
            inputMode="decimal"
            min={1}
            max={100}
            step={0.5}
            placeholder="Ej: 32"
            value={neckLengthCm ?? ''}
            onChange={(event) =>
              onNeckLengthChange(parseNeckLengthInput(event.target.value))
            }
            className="pr-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            cm
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Nos ayuda a ajustar mejor el largo del collar según el talle y las letras o
          emojis que elijas. Podés medirlo con una cinta alrededor del cuello, sin
          apretar.
        </p>
      </div>
    </div>
  );
}

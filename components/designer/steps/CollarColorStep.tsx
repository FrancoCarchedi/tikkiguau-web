"use client";

import { Check } from 'lucide-react';
import { useRequiredCatalog } from '@/components/catalog/catalog-provider';
import { COLLAR_SIZES, type CollarSize } from '@/types/collar';

interface CollarColorStepProps {
  selectedColor: string;
  selectedSize: CollarSize;
  onSelectColor: (color: string) => void;
  onSelectSize: (size: CollarSize) => void;
}

export default function CollarColorStep({
  selectedColor,
  selectedSize,
  onSelectColor,
  onSelectSize,
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
    </div>
  );
}

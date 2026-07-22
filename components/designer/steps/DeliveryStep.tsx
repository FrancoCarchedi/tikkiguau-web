"use client";

import { Building2, Check, Home, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRequiredCatalog } from '@/components/catalog/catalog-provider';
import { getShippingAmount } from '@/lib/catalog/catalog-helpers';
import { formatArsPrice } from '@/types/catalog';
import type { DeliveryData, DeliveryMethod } from '@/types/collar';

interface DeliveryStepProps {
  data: DeliveryData;
  onChange: (data: DeliveryData) => void;
}

const DELIVERY_OPTIONS: {
  method: DeliveryMethod;
  icon: typeof Home;
  title: string;
  description: string;
}[] = [
  {
    method: 'PICKUP',
    icon: Home,
    title: 'Retiro presencial',
    description:
      'Pasás a buscar tu pedido directamente en nuestra dirección (San Miguel, Provincia de Buenos Aires).',
  },
  {
    method: 'CORREO_SUCURSAL',
    icon: Building2,
    title: 'Retiro por sucursal',
    description: 'Retirás el paquete en la sucursal de Correo Argentino más cercana.',
  },
  {
    method: 'CORREO_DOMICILIO',
    icon: MapPin,
    title: 'Envío a domicilio',
    description: 'Tu pedido llega hasta la puerta de tu casa.',
  },
];

export default function DeliveryStep({ data, onChange }: DeliveryStepProps) {
  const catalog = useRequiredCatalog();

  const selectMethod = (method: DeliveryMethod) => {
    onChange({
      method,
      address: method === 'CORREO_DOMICILIO' ? data.address : undefined,
      city: method !== 'PICKUP' ? data.city : undefined,
      postalCode: method !== 'PICKUP' ? data.postalCode : undefined,
      branchPreference: method === 'CORREO_SUCURSAL' ? data.branchPreference : undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-left md:text-center">
        <h2 className="text-2xl font-semibold text-foreground">Método de entrega</h2>
        <p className="text-muted-foreground mt-1">
          Elegí cómo querés recibir tu pedido
        </p>
      </div>

      <div className="space-y-3">
        {DELIVERY_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = data.method === option.method;
          const shippingCost = getShippingAmount(catalog, option.method);
          const shippingLabel =
            shippingCost === 0 ? 'Sin costo' : formatArsPrice(shippingCost);

          return (
            <button
              key={option.method}
              type="button"
              onClick={() => selectMethod(option.method)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
                    isSelected ? 'bg-primary/15' : 'bg-muted'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">{option.title}</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {shippingLabel}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                </div>
                {isSelected && (
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {data.method === 'CORREO_DOMICILIO' && (
        <div className="space-y-4 pt-2 border-t border-border">
          <div className="space-y-2">
            <Label htmlFor="address">Dirección completa</Label>
            <Input
              id="address"
              placeholder="Calle, número, piso/depto"
              value={data.address ?? ''}
              onChange={(event) => onChange({ ...data, address: event.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                placeholder="Ciudad"
                value={data.city ?? ''}
                onChange={(event) => onChange({ ...data, city: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Código postal</Label>
              <Input
                id="postalCode"
                placeholder="Ej: 1425"
                value={data.postalCode ?? ''}
                onChange={(event) => onChange({ ...data, postalCode: event.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {data.method === 'CORREO_SUCURSAL' && (
        <div className="space-y-4 pt-2 border-t border-border">
          <div className="space-y-2">
            <Label htmlFor="branchPreference">Ciudad / sucursal preferida</Label>
            <Input
              id="branchPreference"
              placeholder="Ej: Palermo, CABA"
              value={data.branchPreference ?? ''}
              onChange={(event) =>
                onChange({ ...data, branchPreference: event.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="branchCity">Ciudad</Label>
              <Input
                id="branchCity"
                placeholder="Ciudad"
                value={data.city ?? ''}
                onChange={(event) => onChange({ ...data, city: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchPostalCode">Código postal</Label>
              <Input
                id="branchPostalCode"
                placeholder="Ej: 1425"
                value={data.postalCode ?? ''}
                onChange={(event) => onChange({ ...data, postalCode: event.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

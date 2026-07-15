"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserData } from '@/types/collar';

interface UserDataStepProps {
  data: UserData;
  onChange: (data: UserData) => void;
}

export default function UserDataStep({ data, onChange }: UserDataStepProps) {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-left md:text-center">
        <h2 className="text-2xl font-semibold text-foreground">Tus datos de contacto</h2>
        <p className="text-muted-foreground mt-1">
          Los usamos para confirmar tu pedido y coordinar la entrega
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            placeholder="Tu nombre"
            value={data.name}
            onChange={(event) => onChange({ ...data, name: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            placeholder="Tu apellido"
            value={data.lastName}
            onChange={(event) => onChange({ ...data, lastName: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={data.email}
            onChange={(event) => onChange({ ...data, email: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono / WhatsApp</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Ej: 1132345678"
            value={data.phone}
            onChange={(event) => onChange({ ...data, phone: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

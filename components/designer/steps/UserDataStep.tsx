"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getUserDataFieldErrors,
  type UserDataField,
} from '@/lib/designer/validation';
import type { UserData } from '@/types/collar';

interface UserDataStepProps {
  data: UserData;
  onChange: (data: UserData) => void;
  /** When true, show all field errors (e.g. after a failed "Siguiente"). */
  forceShowErrors?: boolean;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

export default function UserDataStep({
  data,
  onChange,
  forceShowErrors = false,
}: UserDataStepProps) {
  const [touched, setTouched] = useState<Partial<Record<UserDataField, boolean>>>(
    {}
  );
  const errors = getUserDataFieldErrors(data);

  const markTouched = (field: UserDataField) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const showError = (field: UserDataField) =>
    touched[field] || forceShowErrors ? errors[field] : undefined;

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
            name="given-name"
            autoComplete="given-name"
            placeholder="Tu nombre"
            value={data.name}
            aria-invalid={Boolean(showError('name'))}
            aria-describedby={showError('name') ? 'name-error' : undefined}
            onBlur={() => markTouched('name')}
            onChange={(event) => onChange({ ...data, name: event.target.value })}
          />
          <FieldError id="name-error" message={showError('name')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            name="family-name"
            autoComplete="family-name"
            placeholder="Tu apellido"
            value={data.lastName}
            aria-invalid={Boolean(showError('lastName'))}
            aria-describedby={showError('lastName') ? 'lastName-error' : undefined}
            onBlur={() => markTouched('lastName')}
            onChange={(event) => onChange({ ...data, lastName: event.target.value })}
          />
          <FieldError id="lastName-error" message={showError('lastName')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={data.email}
            aria-invalid={Boolean(showError('email'))}
            aria-describedby={showError('email') ? 'email-error' : undefined}
            onBlur={() => markTouched('email')}
            onChange={(event) => onChange({ ...data, email: event.target.value })}
          />
          <FieldError id="email-error" message={showError('email')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono / WhatsApp</Label>
          <Input
            id="phone"
            name="tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Ej: 11 3234-5678"
            value={data.phone}
            aria-invalid={Boolean(showError('phone'))}
            aria-describedby={showError('phone') ? 'phone-error' : undefined}
            onBlur={() => markTouched('phone')}
            onChange={(event) => onChange({ ...data, phone: event.target.value })}
          />
          <FieldError id="phone-error" message={showError('phone')} />
        </div>
      </div>
    </div>
  );
}

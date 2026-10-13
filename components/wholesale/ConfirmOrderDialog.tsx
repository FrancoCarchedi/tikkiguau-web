"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { formatWholesaleArs } from "@/lib/wholesale/format";
import WhatsAppIcon from "./WhatsAppIcon";

export interface ConfirmOrderSummary {
  reference: string;
  phone: string;
  totalUnits: number;
  totalAmountArs: number;
}

interface ConfirmOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: ConfirmOrderSummary;
  isSubmitting: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right font-semibold text-zinc-900">{value}</dd>
    </div>
  );
}

export default function ConfirmOrderDialog({
  open,
  onOpenChange,
  summary,
  isSubmitting,
  errorMessage,
  onConfirm,
}: ConfirmOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isSubmitting && onOpenChange(nextOpen)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Enviar tu pedido?</DialogTitle>
          <DialogDescription>
            Vamos a registrar tu pedido y abrir WhatsApp para que se lo envíes a TikkiGuau. Revisá
            los datos antes de confirmar.
          </DialogDescription>
        </DialogHeader>

        <dl className="flex flex-col gap-2 rounded-xl bg-zinc-50 p-4">
          <SummaryRow label="Referencia" value={summary.reference} />
          <SummaryRow label="Teléfono" value={summary.phone} />
          <SummaryRow label="Unidades" value={`${summary.totalUnits} u`} />
          <SummaryRow
            label="Total estimado"
            value={`${formatWholesaleArs(summary.totalAmountArs)} (sin envío)`}
          />
        </dl>

        {errorMessage && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Seguir editando
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="gap-2 bg-[#25D366] text-white hover:bg-[#1fb857]"
          >
            {isSubmitting ? <Spinner className="size-4" /> : <WhatsAppIcon className="size-4" />}
            {isSubmitting ? "Enviando…" : errorMessage ? "Reintentar" : "Confirmar y enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

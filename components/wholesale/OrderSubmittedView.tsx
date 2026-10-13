"use client";

import { CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWholesaleArs } from "@/lib/wholesale/format";
import type { SubmittedWholesaleOrder } from "@/types/wholesale";
import CopyOrderTextButton from "./CopyOrderTextButton";
import WhatsAppIcon from "./WhatsAppIcon";

interface OrderSubmittedViewProps {
  submittedOrder: SubmittedWholesaleOrder;
  onStartNewOrder: () => void;
}

export default function OrderSubmittedView({
  submittedOrder,
  onStartNewOrder,
}: OrderSubmittedViewProps) {
  const { isSummaryOnly, wasWhatsAppOpened } = submittedOrder;

  function openWhatsApp() {
    window.open(submittedOrder.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section
      aria-labelledby="wholesale-submitted-title"
      className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <CheckCircle2Icon className="size-12 text-emerald-600" aria-hidden />
        <h2 id="wholesale-submitted-title" className="text-xl font-bold text-zinc-900">
          ¡Pedido registrado!
        </h2>
        <p className="text-sm text-zinc-600">
          Tu número de pedido es{" "}
          <strong className="font-mono text-zinc-900">{submittedOrder.orderNumber}</strong>
        </p>
      </div>

      <dl className="flex flex-col gap-2 rounded-xl bg-zinc-50 p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Referencia</dt>
          <dd className="text-right font-semibold text-zinc-900">{submittedOrder.reference}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Unidades</dt>
          <dd className="font-semibold text-zinc-900">{submittedOrder.totalUnits} u</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Total estimado</dt>
          <dd className="font-semibold text-zinc-900">
            {formatWholesaleArs(submittedOrder.totalAmountArs)} (sin envío)
          </dd>
        </div>
      </dl>

      {isSummaryOnly ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-zinc-900">
            Tu pedido es muy extenso. Para enviarlo completo seguí estos pasos:
          </p>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-zinc-700">
            <li>
              Tocá <strong>«Copiar texto»</strong> para copiar el pedido completo.
            </li>
            <li>
              Tocá <strong>«Abrir WhatsApp»</strong> y enviá el mensaje con el resumen.
            </li>
            <li>Pegá el pedido completo en el chat y enviá también ese mensaje.</li>
          </ol>
          <CopyOrderTextButton message={submittedOrder.fullMessage} disabled={false} variant="default" />
        </div>
      ) : (
        <p className="text-sm text-zinc-700">
          {wasWhatsAppOpened ? (
            <>
              Abrimos WhatsApp con tu pedido. <strong>Presioná «Enviar» en el chat</strong> para
              completar el envío.
            </>
          ) : (
            <>
              Tocá <strong>«Abrir WhatsApp»</strong> y presioná «Enviar» en el chat para completar el
              envío.
            </>
          )}
        </p>
      )}

      <Button
        type="button"
        size="lg"
        onClick={openWhatsApp}
        className="h-12 w-full gap-2 bg-[#25D366] text-base font-semibold text-white hover:bg-[#1fb857]"
      >
        <WhatsAppIcon className="size-5" />
        {wasWhatsAppOpened ? "Volver a abrir WhatsApp" : "Abrir WhatsApp"}
      </Button>

      <p className="text-xs leading-relaxed text-zinc-500">
        Aunque no envíes el mensaje, tu pedido ya quedó registrado y TikkiGuau puede contactarte al
        teléfono que indicaste.
      </p>

      <Button type="button" variant="ghost" onClick={onStartNewOrder}>
        Hacer un pedido nuevo
      </Button>
    </section>
  );
}

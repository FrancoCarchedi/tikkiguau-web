"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import {
  resolveWhatsAppPayload,
  type WholesaleMessageInput,
} from "@/lib/wholesale/build-whatsapp-message";
import CopyOrderTextButton from "./CopyOrderTextButton";
import LargeOrderDialog from "./LargeOrderDialog";
import SendOrderButton from "./SendOrderButton";

interface OrderActionsProps {
  messageInput: WholesaleMessageInput;
  canSend: boolean;
  pendingReasons: string[];
  onStartNewOrder: () => void;
}

export default function OrderActions({
  messageInput,
  canSend,
  pendingReasons,
  onStartNewOrder,
}: OrderActionsProps) {
  const [isLargeDialogOpen, setIsLargeDialogOpen] = useState(false);
  const [wasCopiedAutomatically, setWasCopiedAutomatically] = useState(false);
  const [wasWhatsAppOpened, setWasWhatsAppOpened] = useState(false);

  const payload = useMemo(
    () => (canSend ? resolveWhatsAppPayload(messageInput) : null),
    [canSend, messageInput]
  );

  function openWhatsApp() {
    if (!payload) return;
    window.open(payload.url, "_blank", "noopener,noreferrer");
    setIsLargeDialogOpen(false);
    setWasWhatsAppOpened(true);
  }

  async function handleSend() {
    if (!payload) return;

    if (!payload.isSummaryOnly) {
      openWhatsApp();
      return;
    }

    // La copia debe iniciarse dentro del gesto del clic para que los navegadores móviles la permitan.
    setWasCopiedAutomatically(false);
    setIsLargeDialogOpen(true);
    setWasCopiedAutomatically(await copyToClipboard(payload.fullMessage));
  }

  return (
    <div className="flex flex-col gap-3">
      <SendOrderButton disabled={!canSend} onSend={handleSend} />
      <CopyOrderTextButton message={payload?.fullMessage ?? ""} disabled={!canSend} />

      <p className="text-xs leading-relaxed text-zinc-500">
        Si WhatsApp no trae tu pedido completo, tocá <strong>«Copiar texto»</strong> y pegalo en el
        chat.
      </p>

      {!canSend && pendingReasons.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-4 text-xs text-amber-700">
          {pendingReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}

      {wasWhatsAppOpened && payload && (
        <div
          role="status"
          className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          <p>
            Abrimos WhatsApp. <strong>Presioná «Enviar» en el chat</strong> para completar tu pedido.
            Guardamos tu borrador por si necesitás reintentar.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={openWhatsApp}>
              Volver a abrir WhatsApp
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setWasWhatsAppOpened(false);
                onStartNewOrder();
              }}
            >
              Empezar un pedido nuevo
            </Button>
          </div>
        </div>
      )}

      {payload && (
        <LargeOrderDialog
          open={isLargeDialogOpen}
          onOpenChange={setIsLargeDialogOpen}
          fullMessage={payload.fullMessage}
          wasCopiedAutomatically={wasCopiedAutomatically}
          onOpenWhatsApp={openWhatsApp}
        />
      )}
    </div>
  );
}

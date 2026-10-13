"use client";

import { useMemo, useState } from "react";
import { useSubmitWholesaleOrder } from "@/hooks/use-submit-wholesale-order";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import {
  resolveWhatsAppPayload,
  sanitizeReference,
  type WholesaleMessageInput,
  type WholesaleWhatsAppPayload,
} from "@/lib/wholesale/build-whatsapp-message";
import { PROVISIONAL_ORDER_NUMBER } from "@/lib/wholesale/constants";
import type {
  CreateWholesaleOrderPayload,
  SubmittedWholesaleOrder,
} from "@/types/wholesale";
import ConfirmOrderDialog from "./ConfirmOrderDialog";
import SendOrderButton from "./SendOrderButton";

const SUBMIT_FALLBACK_ERROR =
  "No pudimos registrar tu pedido. Revisá tu conexión e intentá de nuevo.";

interface OrderActionsProps {
  messageInput: Omit<WholesaleMessageInput, "orderNumber">;
  orderPayload: CreateWholesaleOrderPayload;
  canSend: boolean;
  pendingReasons: string[];
  onSubmitted: (submittedOrder: SubmittedWholesaleOrder) => void;
}

/**
 * Los navegadores solo permiten abrir pestañas dentro del gesto del usuario. Como WhatsApp se
 * abre después de guardar (asíncrono), la pestaña se reserva en el clic y se redirige al guardar.
 */
function redirectReservedTab(
  reservedTab: Window | null,
  whatsappPayload: WholesaleWhatsAppPayload
): boolean {
  if (!reservedTab) return false

  if (whatsappPayload.isSummaryOnly) {
    reservedTab.close()
    return false
  }

  reservedTab.opener = null
  reservedTab.location.href = whatsappPayload.url
  return true
}

export default function OrderActions({
  messageInput,
  orderPayload,
  canSend,
  pendingReasons,
  onSubmitted,
}: OrderActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate: submitOrder, isPending: isSubmitting } = useSubmitWholesaleOrder();

  const confirmSummary = useMemo(
    () => ({
      reference: sanitizeReference(messageInput.reference),
      phone: orderPayload.phone.trim(),
      totalUnits: messageInput.evaluation.totalUnits,
      totalAmountArs: messageInput.evaluation.totalAmountArs,
    }),
    [messageInput, orderPayload.phone]
  );

  function handleOpenDialog() {
    setErrorMessage(null);
    setIsDialogOpen(true);
  }

  function handleConfirm() {
    const provisionalPayload = resolveWhatsAppPayload({
      ...messageInput,
      orderNumber: PROVISIONAL_ORDER_NUMBER,
    });
    const reservedTab = provisionalPayload.isSummaryOnly ? null : window.open("", "_blank");

    setErrorMessage(null);
    submitOrder(orderPayload, {
      onSuccess: ({ orderNumber }) => {
        const whatsappPayload = resolveWhatsAppPayload({ ...messageInput, orderNumber });
        const wasWhatsAppOpened = redirectReservedTab(reservedTab, whatsappPayload);

        setIsDialogOpen(false);
        onSubmitted({
          orderNumber,
          reference: confirmSummary.reference,
          totalUnits: confirmSummary.totalUnits,
          totalAmountArs: confirmSummary.totalAmountArs,
          whatsappUrl: whatsappPayload.url,
          isSummaryOnly: whatsappPayload.isSummaryOnly,
          fullMessage: whatsappPayload.fullMessage,
          wasWhatsAppOpened,
        });
      },
      onError: (error) => {
        reservedTab?.close();
        setErrorMessage(getApiErrorMessage(error, SUBMIT_FALLBACK_ERROR));
      },
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <SendOrderButton disabled={!canSend} onSend={handleOpenDialog} />

      <p className="text-xs leading-relaxed text-zinc-500">
        Al enviar, tu pedido queda registrado y se abre WhatsApp para que se lo mandes a TikkiGuau.
      </p>

      {!canSend && pendingReasons.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-4 text-xs text-amber-700">
          {pendingReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}

      <ConfirmOrderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        summary={confirmSummary}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

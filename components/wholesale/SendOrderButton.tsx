"use client";

import { Button } from "@/components/ui/button";
import WhatsAppIcon from "./WhatsAppIcon";

interface SendOrderButtonProps {
  disabled: boolean;
  onSend: () => void;
}

export default function SendOrderButton({ disabled, onSend }: SendOrderButtonProps) {
  return (
    <Button
      type="button"
      size="lg"
      disabled={disabled}
      onClick={onSend}
      className="h-12 w-full gap-2 bg-[#25D366] text-base font-semibold text-white hover:bg-[#1fb857] disabled:bg-[#25D366]/40"
    >
      <WhatsAppIcon className="size-5" />
      Enviar pedido por WhatsApp
    </Button>
  );
}

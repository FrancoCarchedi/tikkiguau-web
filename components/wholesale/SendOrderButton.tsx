"use client";

import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      className="h-12 w-full gap-2 bg-[#C70F11] text-base font-semibold text-white hover:bg-[#a50d0f] disabled:bg-[#C70F11]/40"
    >
      <SendIcon className="size-5" aria-hidden />
      Enviar pedido
    </Button>
  );
}

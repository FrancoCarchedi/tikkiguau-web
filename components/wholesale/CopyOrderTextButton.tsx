"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/copy-to-clipboard";

interface CopyOrderTextButtonProps {
  message: string;
  disabled: boolean;
  variant?: "outline" | "default";
}

export default function CopyOrderTextButton({
  message,
  disabled,
  variant = "outline",
}: CopyOrderTextButtonProps) {
  const [wasCopied, setWasCopied] = useState(false);
  const [manualCopyText, setManualCopyText] = useState<string | null>(null);

  async function handleCopy() {
    const copied = await copyToClipboard(message);

    if (copied) {
      setManualCopyText(null);
      setWasCopied(true);
      toast.success("Pedido copiado. Pegalo en el chat de WhatsApp.");
      window.setTimeout(() => setWasCopied(false), 2500);
      return;
    }

    setManualCopyText(message);
    toast.error("No pudimos copiar automáticamente. Copiá el texto de abajo.");
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant={variant}
        disabled={disabled}
        onClick={handleCopy}
        className="w-full"
      >
        {wasCopied ? <CheckIcon className="mr-2 size-4" /> : <CopyIcon className="mr-2 size-4" />}
        {wasCopied ? "¡Copiado!" : "Copiar texto"}
      </Button>

      {manualCopyText && (
        <Textarea
          readOnly
          value={manualCopyText}
          rows={8}
          aria-label="Texto del pedido para copiar manualmente"
          onFocus={(event) => event.target.select()}
          className="text-xs"
        />
      )}
    </div>
  );
}

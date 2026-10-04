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
import CopyOrderTextButton from "./CopyOrderTextButton";
import WhatsAppIcon from "./WhatsAppIcon";

interface LargeOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fullMessage: string;
  wasCopiedAutomatically: boolean;
  onOpenWhatsApp: () => void;
}

export default function LargeOrderDialog({
  open,
  onOpenChange,
  fullMessage,
  wasCopiedAutomatically,
  onOpenWhatsApp,
}: LargeOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tu pedido es muy extenso</DialogTitle>
          <DialogDescription>
            El detalle completo no entra en el enlace de WhatsApp. Vamos a abrir el chat con un
            resumen y vos pegás el pedido completo a continuación.
          </DialogDescription>
        </DialogHeader>

        <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-700">
          <li>
            {wasCopiedAutomatically
              ? "Copiamos el pedido completo a tu portapapeles."
              : "Tocá «Copiar texto» para copiar el pedido completo."}
          </li>
          <li>Se abrirá WhatsApp con un resumen: enviá ese mensaje.</li>
          <li>Pegá el pedido completo en el chat y enviá también ese mensaje.</li>
        </ol>

        <CopyOrderTextButton message={fullMessage} disabled={false} />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onOpenWhatsApp}
            className="gap-2 bg-[#25D366] text-white hover:bg-[#1fb857]"
          >
            <WhatsAppIcon className="size-4" />
            Abrir WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

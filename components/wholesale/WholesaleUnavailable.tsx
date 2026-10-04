import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { WHATSAPP_URL } from "@/lib/payment-details";
import { cn } from "@/lib/utils";
import WhatsAppIcon from "./WhatsAppIcon";

type UnavailableReason = "disabled" | "empty" | "error";

const MESSAGES: Record<UnavailableReason, { title: string; description: string }> = {
  disabled: {
    title: "La venta mayorista no está disponible por el momento",
    description:
      "Escribinos por WhatsApp y te contamos cuándo volvemos a tomar pedidos por mayor.",
  },
  empty: {
    title: "Todavía no hay productos disponibles para pedidos mayoristas",
    description: "Escribinos por WhatsApp y te asesoramos con tu pedido.",
  },
  error: {
    title: "No pudimos cargar el armador de pedidos",
    description:
      "Intentá de nuevo en unos minutos o escribinos por WhatsApp para hacer tu pedido por mayor.",
  },
};

export default function WholesaleUnavailable({ reason }: { reason: UnavailableReason }) {
  const { title, description } = MESSAGES[reason];

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
      <p className="text-zinc-500">{description}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 gap-2 bg-[#25D366] px-5 text-white hover:bg-[#1fb857]"
          )}
        >
          <WhatsAppIcon className="size-4" />
          Escribir por WhatsApp
        </a>
        <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

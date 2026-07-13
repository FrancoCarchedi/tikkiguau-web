import { Home, MapPin, Building2, ArrowRight } from "lucide-react";
import type { ShippingPriceDto } from "@/types/catalog";
import { formatArsPrice } from "@/types/catalog";
import type { DeliveryMethod } from "@/types/collar";
import { resolveShippingAmount } from "@/lib/catalog/catalog-helpers";

const DELIVERY_OPTIONS: {
  method: DeliveryMethod;
  icon: typeof Home;
  title: string;
  description: string;
  accent: string;
  tagBg: string;
}[] = [
  {
    method: "PICKUP",
    icon: Home,
    title: "Retiro en domicilio",
    description:
      "Pasás a buscar tu pedido directamente en nuestro domicilio (San Miguel, Provincia de Buenos Aires).",
    accent: "#2A6A5C",
    tagBg: "#2A6A5C",
  },
  {
    method: "CORREO_SUCURSAL",
    icon: Building2,
    title: "Retiro por sucursal",
    description:
      "Retirás el paquete en la sucursal de Correo Argentino más cercana. Indicás tu ciudad y código postal al confirmar el pedido.",
    accent: "#84A308",
    tagBg: "#84A308",
  },
  {
    method: "CORREO_DOMICILIO",
    icon: MapPin,
    title: "Envío a domicilio",
    description:
      "Tu pedido llega hasta la puerta de tu casa. Ingresás tu dirección completa al confirmar el pedido.",
    accent: "#1C5394",
    tagBg: "#1C5394",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Armás tu diseño",
    description: "Elegís colores, letras y emojis desde el diseñador interactivo.",
  },
  {
    number: "2",
    title: "Confirmás la reserva",
    description:
      "Ingresás tus datos, elegís cómo recibir el pedido y ves el total con el costo de envío incluido.",
  },
  {
    number: "3",
    title: "Realizás la transferencia",
    description:
      "Pagás por transferencia a nuestra cuenta de Mercado Pago con los datos que te indicamos al confirmar.",
  },
  {
    number: "4",
    title: "Comenzamos tu pedido",
    description:
      "Una vez acreditado el pago, confeccionamos tu diseño y coordinamos el envío o retiro.",
  },
];

function formatShippingTag(amountArs: number): string {
  return amountArs === 0 ? "Sin costo" : formatArsPrice(amountArs);
}

export default function ShippingSection({
  shippingPrices = [],
}: {
  shippingPrices?: ShippingPriceDto[];
}) {
  return (
    <section id="envios" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C70F11] mb-3">
            Envíos y pagos
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            El sitio funciona como una{" "}
            <strong className="text-zinc-700">reserva de pedido</strong>. Los costos de envío son
            fijos y el pago se realiza por transferencia a Mercado Pago.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {STEPS.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-start">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(100%-12px)] w-6 z-10">
                  <ArrowRight className="w-5 h-5 text-zinc-300" />
                </div>
              )}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#C70F11] text-white font-bold text-sm mb-4 shrink-0">
                {step.number}
              </div>
              <h3 className="font-semibold text-zinc-800 mb-1">{step.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-xl font-bold text-zinc-800 mb-6 text-center">
            Opciones de entrega
          </h3>
          <div className="grid md:grid-cols-3 gap-5">
            {DELIVERY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const amountArs = resolveShippingAmount(shippingPrices, opt.method);
              const tag = formatShippingTag(amountArs);
              const description =
                opt.method === "PICKUP" && amountArs === 0
                  ? `${opt.description} Sin costo adicional de envío.`
                  : opt.description;

              return (
                <div
                  key={opt.method}
                  className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                      style={{ backgroundColor: `${opt.accent}1A` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: opt.accent }} />
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full text-white shrink-0"
                      style={{ backgroundColor: opt.tagBg }}
                    >
                      {tag}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-800 mb-1">{opt.title}</h4>
                    <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

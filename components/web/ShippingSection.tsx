import { Home, MapPin, Building2, ArrowRight, Smartphone } from "lucide-react";

const DELIVERY_OPTIONS = [
  {
    icon: Home,
    title: "Retiro en domicilio",
    description:
      "Pasás a buscar tu pedido directamente en nuestro domicilio (CABA). Sin costo adicional de envío.",
    accent: "#2A6A5C",
    tag: "Sin costo",
    tagBg: "#2A6A5C",
  },
  {
    icon: MapPin,
    title: "Correo Argentino a domicilio",
    description:
      "Tu pedido llega hasta la puerta de tu casa. Ingresás tu dirección completa al confirmar la reserva.",
    accent: "#1C5394",
    tag: "Todo el país",
    tagBg: "#1C5394",
  },
  {
    icon: Building2,
    title: "Correo Argentino a sucursal",
    description:
      "Retirás el paquete en la sucursal de Correo Argentino más cercana. Indicás tu ciudad y código postal.",
    accent: "#84A308",
    tag: "Todo el país",
    tagBg: "#84A308",
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
      "Ingresás tus datos y elegís cómo querés recibir el pedido. Se genera tu número de orden.",
  },
  {
    number: "3",
    title: "TikkiGuau te contacta",
    description:
      "Te escribimos por WhatsApp para confirmarte el total final con envío y los datos de transferencia.",
  },
  {
    number: "4",
    title: "Realizás la transferencia",
    description:
      "Pagás por transferencia bancaria. Aprobamos tu orden y comenzamos a confeccionarla.",
  },
];

export default function ShippingSection() {
  return (
    <section id="envios" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C70F11] mb-3">
            Envíos y pagos
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            El sitio funciona como una <strong className="text-zinc-700">reserva de pedido</strong>. El pago se coordina por WhatsApp una vez que confirmás tu diseño.
          </p>
        </div>

        {/* Process steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {STEPS.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-start">
              {/* Connector line (hidden on last item) */}
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

        {/* Delivery options */}
        <div className="mb-14">
          <h3 className="text-xl font-bold text-zinc-800 mb-6 text-center">
            Opciones de entrega
          </h3>
          <div className="grid md:grid-cols-3 gap-5">
            {DELIVERY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <div
                  key={opt.title}
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
                      {opt.tag}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-800 mb-1">{opt.title}</h4>
                    <p className="text-sm text-zinc-500 leading-relaxed">{opt.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment highlight */}
        <div className="bg-zinc-900 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl shrink-0"
            style={{ backgroundColor: "rgba(199,15,17,0.25)" }}
          >
            <Smartphone className="w-7 h-7 text-[#C70F11]" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-white mb-1">
              El pago se coordina por WhatsApp
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Una vez que confirmás tu reserva, te escribimos para darte el total final
              (incluyendo el envío si corresponde) y los datos bancarios para la transferencia.
              Solo aceptamos transferencia bancaria.
            </p>
          </div>
          <a
            href="https://wa.me/5491121816245"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C70F11] text-white text-sm font-semibold hover:bg-[#a50d0f] transition-colors"
          >
            Escribinos
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

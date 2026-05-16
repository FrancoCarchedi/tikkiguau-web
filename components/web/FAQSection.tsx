import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "¿Los collares se rayan o se desgastan con el uso?",
    answer:
      "Los apliques están fijados con remaches de metal de alta resistencia. Con uso cotidiano normal, los diseños duran años sin desgastarse ni desprenderse.",
  },
  {
    question: "¿Son resistentes al agua?",
    answer:
      "El material soporta humedad y mojado ocasional, como charcos o baños rápidos. No recomendamos mantenerlos sumergidos de forma prolongada.",
  },
  {
    question: "¿Cuántas letras y emojis puedo poner?",
    answer:
      "Podés combinar letras y emojis personalizados libremente dentro del límite de piezas de cada producto: 6 piezas para el collar y 10 piezas para la correa. Si llevás el combo, tenés 6 para el collar y 10 para la correa, en total 16 piezas.",
  },
  {
    question: "¿Cuánto tarda en llegar mi pedido?",
    answer:
      "Los pedidos se confeccionan en pocos días hábiles. Una vez listo, los envíos por Correo Argentino demoran entre 3 y 10 días hábiles según el destino. Te informamos el tiempo exacto al confirmar tu reserva por WhatsApp.",
  },
  {
    question: "¿Cómo se coordina el pago?",
    answer:
      "El pago es exclusivamente por transferencia bancaria. Una vez que confirmás tu reserva en el sitio, te contactamos por WhatsApp para informarte el total final (producto + envío si aplica) y los datos bancarios para realizar la transferencia.",
  },
  {
    question: "¿Hacen envíos a todo el país?",
    answer:
      "Sí, enviamos a todo el país a través de Correo Argentino, tanto a domicilio como a sucursal. Si estás en CABA también podés optar por retirar el pedido en nuestro domicilio sin costo de envío.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C70F11] mb-3">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-zinc-500">
            ¿Tenés dudas? Estas son las preguntas que más nos hacen.
          </p>
        </div>

        {/* Accordion */}
        <div className="divide-y divide-zinc-200 border-y border-zinc-200">
          {FAQS.map((faq, i) => (
            <details key={i} className="group">
              <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none select-none">
                <span className="text-base font-semibold text-zinc-800 group-open:text-[#C70F11] transition-colors">
                  {faq.question}
                </span>
                <ChevronDown className="w-5 h-5 shrink-0 text-zinc-400 group-open:rotate-180 group-open:text-[#C70F11] transition-transform duration-200" />
              </summary>
              <div className="pb-5 pr-9">
                <p className="text-sm text-zinc-600 leading-relaxed">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        {/* Contact CTA */}
        <p className="mt-10 text-center text-sm text-zinc-500">
          ¿Tu pregunta no está acá?{" "}
          <a
            href="https://wa.me/5491121816245"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C70F11] font-semibold hover:underline"
          >
            Escribinos por WhatsApp
          </a>
        </p>
      </div>
    </section>
  );
}

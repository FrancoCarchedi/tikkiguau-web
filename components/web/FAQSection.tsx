import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "¿Realizan ventas al por mayor?",
    answer:
      "Próximamente estaremos trabajando al por mayor. Si estás interesado en comprar bajo esta modalidad, escribinos por WhatsApp y te tendremos en cuenta cuando la habilitemos oficialmente.",
  },
  {
    question: "¿Cuántas letras y emojis puedo agregar?",
    answer:
      "Los collares incluyen 6 piezas para personalizar, que podés combinar como prefieras entre letras y emojis. Las correas incluyen 10 piezas para personalizar, y también podés elegir si querés usar solo letras, solo emojis o una combinación de ambos.",
  },
  {
    question: "¿Venden letras y emojis por separado?",
    answer:
      "Actualmente no realizamos la venta individual de piezas sin la compra previa de nuestros productos. Si querés agregar letras o emojis adicionales para complementar un accesorio que ya tenés, podés solicitarlo a través de WhatsApp.",
  },
  {
    question: "¿Cuánto tarda en llegar mi pedido?",
    answer:
      "Los envíos mediante Correo Argentino tienen un tiempo estimado de entrega de 3 a 5 días hábiles una vez despachados. Los despachos se realizan los días lunes, por lo que la fecha de compra puede influir en el tiempo total de entrega. De todas maneras, te mantendremos informado durante todo el proceso.",
  },
  {
    question: "¿Realizan envíos a todo el país?",
    answer:
      "Sí, realizamos envíos a todo el país.",
  },
  {
    question: "¿Los accesorios se rayan o desgastan con el uso?",
    answer:
      "Nuestros accesorios están elaborados con materiales seleccionados para ofrecer resistencia y durabilidad en el uso diario. Sin embargo, como cualquier producto, su vida útil dependerá del cuidado y el uso que reciba cada mascota.",
  },
  {
    question: "¿Realizan cambios o devoluciones?",
    answer:
      "Debido a que nuestros productos son personalizados, no realizamos cambios ni devoluciones por errores en la información proporcionada por el cliente o por cambios de opinión. Si recibiste un producto con un defecto de fabricación o hubo un error de nuestra parte, escribinos por WhatsApp para ayudarte a resolverlo.",
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

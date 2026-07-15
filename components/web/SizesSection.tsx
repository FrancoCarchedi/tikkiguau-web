import { Ruler } from "lucide-react";

const COLLAR_SIZES = [
  {
    label: "Talla 1",
    badge: "XS",
    width: "1,5 cm de ancho",
    length: "25 a 40 cm de largo",
    breeds: ["Shih Tzu", "Chihuahua", "Yorkshire Terrier", "Pomerania", "Caniche Toy", "Cachorros", "Gatitos"],
    accent: "#C70F11",
  },
  {
    label: "Talla 2",
    badge: "M",
    width: "2,5 cm de ancho",
    length: "55 a 70 cm de largo",
    breeds: ["Pit Bull", "American Bully", "Golden Retriever", "Cocker Spaniel"],
    accent: "#C70F11",
  },
];

const LEASH_SIZES = [
  {
    label: "Talla 1",
    badge: "XS",
    width: "1,5 cm de ancho",
    length: "1,20 mts de largo",
    breeds: ["Shih Tzu", "Chihuahua", "Yorkshire Terrier", "Pomerania", "Caniche Toy", "Cachorros"],
    // accent: "#2590B4",
    accent: "#C70F11",
  },
  {
    label: "Talla 2",
    badge: "M",
    width: "2,5 cm de ancho",
    length: "1,20 mts de largo",
    breeds: ["Pit Bull", "American Bully", "Golden Retriever", "Cocker Spaniel"],
    accent: "#C70F11",
  },
];

function SizeCard({
  label,
  badge,
  width,
  length,
  breeds,
  accent,
}: {
  label: string;
  badge: string;
  width: string;
  length: string;
  breeds: string[];
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Accent top bar */}
      <div className="h-1" style={{ backgroundColor: accent }} />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
            style={{ backgroundColor: accent }}
          >
            {badge}
          </span>
          <span className="text-lg font-semibold text-zinc-800">{label}</span>
        </div>

        {/* Measurements */}
        <div className="flex flex-col gap-1.5 mb-5">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Ruler className="w-4 h-4 shrink-0 rotate-135" style={{ color: accent }} />
            <span>{width}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Ruler className="w-4 h-4 shrink-0 rotate-135" style={{ color: accent }} />
            <span>{length}</span>
          </div>
        </div>

        {/* Breeds */}
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Razas sugeridas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {breeds.map((breed) => (
              <span
                key={breed}
                className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600"
              >
                {breed}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SizesSection() {
  return (
    <section id="medidas" className="py-20 bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-left md:text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C70F11] mb-3">
            Guía de tallas
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-4">
            Tabla de medidas
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Antes de diseñar, elegí la talla correcta para tu mascota. Si tu
            perro está en el límite entre tallas, te recomendamos la más grande.
          </p>
        </div>

        {/* Two columns: Collar | Correa */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* Collar column */}
          <div>
            <h3 className="text-base font-bold text-zinc-700 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-[#1C5394]" />
              Collar
            </h3>
            <div className="flex flex-col gap-4">
              {COLLAR_SIZES.map((s) => (
                <SizeCard key={s.label} {...s} />
              ))}
            </div>
          </div>

          {/* Correa column */}
          <div>
            <h3 className="text-base font-bold text-zinc-700 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-[#2A6A5C]" />
              Correa
            </h3>
            <div className="flex flex-col gap-4">
              {LEASH_SIZES.map((s) => (
                <SizeCard key={s.label} {...s} />
              ))}
            </div>
          </div>
        </div>

        {/* Tip */}
        <p className="mt-10 text-center text-sm text-zinc-400">
          ¿Tenés dudas con la talla?{" "}
          <a
            href="https://wa.me/5491121816245"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C70F11] font-semibold hover:underline"
          >
            Consultanos por WhatsApp
          </a>{" "}
          y te ayudamos.
        </p>
      </div>
    </section>
  );
}

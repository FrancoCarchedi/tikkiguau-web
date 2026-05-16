import { Star, Camera } from "lucide-react";

const TESTIMONIALS = [
  {
    ownerName: "Valentina G.",
    petName: "Luna",
    petEmoji: "🐶",
    product: "Combo Collar + Correa",
    rating: 5,
    text: "¡Quedó espectacular! El collar de Luna tiene su nombre con letras rosas y unos corazoncitos. La calidad es increíble, se nota que está hecho con amor. Ya lo lavé varias veces y sigue igual.",
    colorIndex: 5, // Rosado
  },
  {
    ownerName: "Mateo R.",
    petName: "Thor",
    petEmoji: "🐕",
    product: "Collar personalizado",
    rating: 5,
    text: "Pedí el collar en azul con el nombre de Thor y unas patitas. Llegó súper rápido y la atención fue excelente. Thor lo usa todos los días y no se ha deteriorado para nada.",
    colorIndex: 7, // Azul
  },
  {
    ownerName: "Camila F.",
    petName: "Coco",
    petEmoji: "🐾",
    product: "Correa personalizada",
    rating: 5,
    text: "La correa es hermosa, en verde oscuro con estrellitas. La gente en el parque siempre nos para a preguntar dónde la compré. Sin dudas voy a volver a pedir.",
    colorIndex: 8, // Verde oscuro
  },
  {
    ownerName: "Sofía M.",
    petName: "Mia",
    petEmoji: "🐱",
    product: "Collar personalizado",
    rating: 5,
    text: "Mi gata tiene el collar violeta con su nombre y una lunita. Es súper liviano y ella lo tolera perfectamente. El proceso de diseño fue muy fácil y divertido.",
    colorIndex: 6, // Violeta
  },
  {
    ownerName: "Lucas P.",
    petName: "Rocky",
    petEmoji: "🐶",
    product: "Combo Collar + Correa",
    rating: 5,
    text: "Pedí el combo completo en rojo para Rocky. Los apliques de metal son muy resistentes, ya pasaron meses y están como el primer día. Totalmente recomendable.",
    colorIndex: 0, // Rojo
  },
  {
    ownerName: "Julieta H.",
    petName: "Nala",
    petEmoji: "🐕",
    product: "Collar personalizado",
    rating: 5,
    text: "Increíble la atención y el resultado. Elegí el color naranja con el nombre de Nala y unos emojis de flores. La comunicación por WhatsApp fue muy rápida y clara.",
    colorIndex: 3, // Naranja
  },
];

const COLLAR_COLORS_HEX = [
  "#C70F11", // Rojo
  "#2590B4", // Celeste
  "#84A308", // Verde manzana
  "#D93C1B", // Naranja
  "#111111", // Negro
  "#C7295C", // Rosado
  "#4B2A61", // Violeta
  "#1C5394", // Azul
  "#2A6A5C", // Verde oscuro
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-4 h-4"
          fill={i < rating ? "#F59E0B" : "none"}
          stroke={i < rating ? "#F59E0B" : "#D1D5DB"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function PlaceholderAvatar({
  colorIndex,
  petEmoji,
}: {
  colorIndex: number;
  petEmoji: string;
}) {
  const hex = COLLAR_COLORS_HEX[colorIndex];
  return (
    <div
      className="relative w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: `${hex}22` }}
    >
      {/* dot pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${hex}33 1px, transparent 1px)`,
          backgroundSize: "12px 12px",
        }}
      />
      {/* camera icon hint */}
      <div className="relative flex flex-col items-center gap-0.5">
        <Camera className="w-5 h-5" style={{ color: hex, opacity: 0.6 }} />
        <span className="text-lg leading-none">{petEmoji}</span>
      </div>
      {/* top-right "photo" badge */}
      <div
        className="absolute top-1 right-1 w-2 h-2 rounded-full opacity-60"
        style={{ backgroundColor: hex }}
      />
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonios" className="py-20 bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C70F11] mb-3">
            Lo que dicen nuestros clientes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-4">
            Testimonios
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Más de cien mascotas ya tienen su collar único. Esto es lo que nos
            cuentan sus dueños.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.ownerName}
              className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              {/* Top: avatar + name + product */}
              <div className="flex items-start gap-4">
                <PlaceholderAvatar
                  colorIndex={t.colorIndex}
                  petEmoji={t.petEmoji}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-800 truncate">
                    {t.ownerName}
                  </p>
                  <p className="text-sm text-zinc-400 truncate">
                    Dueño/a de{" "}
                    <span className="font-medium text-zinc-600">{t.petName}</span>
                  </p>
                  <span
                    className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${COLLAR_COLORS_HEX[t.colorIndex]}18`,
                      color: COLLAR_COLORS_HEX[t.colorIndex],
                    }}
                  >
                    {t.product}
                  </span>
                </div>
              </div>

              {/* Stars */}
              <StarRating rating={t.rating} />

              {/* Review text */}
              <p className="text-sm text-zinc-600 leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>
            </article>
          ))}
        </div>

        {/* Photo placeholder notice */}
        <p className="mt-10 text-center text-xs text-zinc-400 flex items-center justify-center gap-1.5">
          <Camera className="w-3.5 h-3.5" />
          Los avatares serán reemplazados por fotos reales de las mascotas.
        </p>
      </div>
    </section>
  );
}

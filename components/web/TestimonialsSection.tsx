import { Camera, Star } from "lucide-react";

type Testimonial = {
  avatar?: string;
  title: string;
  product: string;
  rating: number;
  text: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    avatar: "/images/testimonials/churrita.jpeg",
    title: "Dueña de Churrita",
    product: "Collar personalizado",
    rating: 5,
    text: "Amamos el collar, le queda precioso y es super original.",
  },
  {
    avatar: "/images/testimonials/preta.jpeg",
    title: "Dueña de Preta",
    product: "Collar personalizado",
    rating: 5,
    text: "¡Ella disfruta mucho su nuevo collar! ¡Muy hermoso, gracias!",
  },
  {
    avatar: "/images/testimonials/ossa.jpeg",
    title: "Dueña de Ossa",
    product: "Collar personalizado",
    rating: 5,
    text: "Me llegaron super rápido los collares. ¡Están hermosos!",
  },
  {
    avatar: "/images/testimonials/mora.jpeg",
    title: "Dueña de Mora",
    product: "Collar personalizado",
    rating: 5,
    text: "Después de mucho tiempo pude encontrar el video donde aparece mi hija Mora. ¡Quiero agradecerles por el collar hermoso!",
  },
  {
    avatar: "/images/testimonials/dona.jpeg",
    title: "Dueña de Dona",
    product: "Collar personalizado",
    rating: 5,
    text: "Ya retiramos los collares para Dona y Juani. ¡Están hermosos!",
  },
  {
    avatar: "/images/testimonials/azula.jpeg",
    title: "Dueña de Azula",
    product: "Collar personalizado",
    rating: 5,
    text: "Me encantó la historia del nombre de tu marca. Después de ver tu video tuve que escribirte para pedirte un collar para mi bebita, me encantó lo que creaste.",
  },
];

function Avatar({ src, title }: { src?: string; title: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={title}
        className="w-20 h-20 rounded-2xl shrink-0 object-cover"
      />
    );
  }

  return (
    <div className="relative w-20 h-20 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden bg-zinc-100">
      <Camera className="w-7 h-7 text-zinc-300" strokeWidth={1.5} />
    </div>
  );
}

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

export default function TestimonialsSection() {
  return (
    <section id="testimonios" className="py-20 bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left md:text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C70F11] mb-3">
            Lo que dicen nuestros clientes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 mb-4">
            Testimonios
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Más de cien mascotas ya tienen su collar único.
            <br />
            Esto es lo que nos cuentan sus dueños.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.title}
              className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <Avatar src={t.avatar} title={t.title} />
                <div className="min-w-0 flex flex-col gap-1.5">
                  <p className="font-semibold text-zinc-800 truncate">{t.title}</p>
                  <span className="inline-block w-fit text-xs px-2 py-0.5 rounded-full font-medium bg-[#C70F11]/10 text-[#C70F11]">
                    {t.product}
                  </span>
                  <StarRating rating={t.rating} />
                </div>
              </div>

              <p className="text-sm text-zinc-600 leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

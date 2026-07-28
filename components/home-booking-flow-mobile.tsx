import Image from "next/image";

const STEPS = [
  {
    image: "/images/booking-flow-mobile/01-propiedad-movil.png",
    alt: "Ficha de propiedad en móvil: Villa Palmera con galería, detalles y botón Reservar",
    step: "1",
    title: "Elige tu alojamiento",
    description:
      "Explora fotos, capacidad y amenidades. Toca Reservar para elegir fechas y huéspedes.",
  },
  {
    image: "/images/booking-flow-mobile/02-reservar-movil.png",
    alt: "Asistente de reserva en móvil: revisión de fechas, huéspedes y método de pago",
    step: "2",
    title: "Completa tu reserva",
    description:
      "Revisa fechas y huéspedes, elige método de pago y confirma en un flujo paso a paso.",
  },
  {
    image: "/images/booking-flow-mobile/03-confirmacion-movil.png",
    alt: "Pantalla de confirmación en móvil tras completar la reserva",
    step: "3",
    title: "Recibe confirmación",
    description:
      "Al finalizar el pago o la transferencia, recibes confirmación y referencia de reserva.",
  },
] as const;

export function HomeBookingFlowMobile() {
  return (
    <section className="border-y border-sand-dark/60 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-ocean">Reserva en móvil</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Reserva en 3 pasos desde tu celular
          </h2>
          <p className="mt-3 leading-relaxed text-muted">
            Todo el proceso está optimizado para móvil: explora propiedades, completa tu reserva y
            recibe confirmación sin salir del navegador.
          </p>
        </div>

        <ol className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
          {STEPS.map(({ image, alt, step, title, description }) => (
            <li key={step} className="flex flex-col">
              <div className="mx-auto w-full max-w-[260px] overflow-hidden rounded-[2rem] border border-sand-dark bg-sand/30 p-2 shadow-lg ring-1 ring-black/5">
                <div className="overflow-hidden rounded-[1.6rem] bg-surface">
                  <Image
                    src={image}
                    alt={alt}
                    width={780}
                    height={1688}
                    className="h-auto w-full"
                    sizes="(max-width: 1024px) 260px, 33vw"
                  />
                </div>
              </div>
              <div className="mt-6 text-center lg:text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-ocean">
                  Paso {step}
                </p>
                <h3 className="mt-1 font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

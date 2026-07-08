import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { DestinationPicker } from "@/components/destinations/DestinationPicker";
import { PropertySection } from "@/components/properties/PropertySection";
import { DirectBookingBadge } from "@/components/trust/DirectBookingBadge";
import { TrustStrip } from "@/components/trust/TrustStrip";
import { destinations, WHATSAPP_URL } from "@/lib/properties";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 pb-6 pt-12 md:px-10 md:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <DirectBookingBadge />
            <h1 className="font-display mt-5 text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
              Alojamientos vacacionales en playa y ciudad
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
              Propiedades seleccionadas en{" "}
              <strong className="font-medium text-foreground">San Clemente</strong> y{" "}
              <strong className="font-medium text-foreground">Portoviejo</strong>.
              Consulta disponibilidad y reserva en línea, sin comisiones de plataforma.
            </p>
          </div>

          <div className="mt-12">
            <DestinationPicker destinations={destinations} />
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-20 px-6 py-16 md:px-10 md:py-20">
          <PropertySection
            id="san-clemente"
            eyebrow="San Clemente"
            title="Casas con piscina en la costa"
            description="Viviendas vacacionales preparadas para familias y grupos grandes. Tarifas en USD con reserva directa."
          />
          <PropertySection
            id="portoviejo"
            eyebrow="Portoviejo"
            title="Apartamentos en la ciudad"
            description="Opciones urbanas para viajes de trabajo, familia o estadías cortas en Manabí."
          />
        </section>

        <div id="ventajas">
          <TrustStrip />
        </div>

        <section className="mx-auto max-w-7xl px-6 pb-20 md:px-10">
          <div className="rounded-2xl bg-primary px-8 py-10 text-center text-white md:px-12 md:py-14">
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              ¿No sabes cuál elegir?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              Cuéntanos cuántas personas viajan y qué fechas tienes en mente.
              Te ayudamos a encontrar la propiedad ideal en San Clemente o Portoviejo.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { BalanceSummary } from "@/components/vacations/BalanceSummary";
import { VacationGrid } from "@/components/vacations/VacationGrid";
import { VacationSearchBar } from "@/components/vacations/VacationSearchBar";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 pb-4 pt-10 md:px-10 md:pt-14">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-tight">
              Planifica tus vacaciones
            </h1>
            <p className="mt-4 text-base text-muted md:text-lg">
              Descubre, solicita y gestiona tus días libres con la misma claridad
              que planear tu próximo viaje.
            </p>
          </div>

          <div className="mt-10">
            <VacationSearchBar />
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-16 px-6 py-12 md:px-10 md:py-16">
          <BalanceSummary />
          <VacationGrid />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10">
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-primary to-rose-500 px-8 py-10 text-center text-white sm:flex-row sm:text-left">
            <div>
              <h2 className="text-2xl font-semibold">¿Listo para desconectar?</h2>
              <p className="mt-2 text-white/90">
                Crea una nueva solicitud en segundos. Tu manager la revisará pronto.
              </p>
            </div>
            <Button
              variant="secondary"
              className="shrink-0 border-0 bg-white text-primary hover:bg-white/90"
            >
              Nueva solicitud
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

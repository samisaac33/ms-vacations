"use client";

import Image from "next/image";
import {
  BOOKING_FLOW_STEPS,
  bookingFlowExportPath,
  bookingFlowScreenshotPath,
  type BookingFlowStep,
} from "@/lib/booking-flow-steps";

type Props = {
  variant: "home" | "admin";
  showDownload?: boolean;
};

function BookingFlowStepCard({
  step,
  variant,
  showDownload,
}: {
  step: BookingFlowStep;
  variant: "home" | "admin";
  showDownload?: boolean;
}) {
  const screenshot = bookingFlowScreenshotPath(step.imageBase);
  const exportHref = bookingFlowExportPath(step.exportFilename);
  const isAdmin = variant === "admin";

  return (
    <li className={isAdmin ? "flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm" : "flex flex-col"}>
      <div
        className={
          isAdmin
            ? "bg-zinc-50 p-4"
            : "mx-auto w-full max-w-[260px] overflow-hidden rounded-[2rem] border border-sand-dark bg-sand/30 p-2 shadow-lg ring-1 ring-black/5"
        }
      >
        <div className={isAdmin ? "mx-auto max-w-[220px] overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white p-1.5 shadow-md" : "overflow-hidden rounded-[1.6rem] bg-surface"}>
          <Image
            src={screenshot}
            alt={step.alt}
            width={780}
            height={1688}
            className="h-auto w-full"
            sizes={isAdmin ? "220px" : "(max-width: 1024px) 260px, 33vw"}
          />
        </div>
      </div>

      <div className={isAdmin ? "space-y-3 p-4" : "mt-6 text-center lg:text-left"}>
        <div>
          <p className={isAdmin ? "text-xs font-semibold uppercase tracking-wide text-teal-700" : "text-xs font-semibold uppercase tracking-wide text-ocean"}>
            Paso {step.step}
          </p>
          <h3 className={isAdmin ? "mt-1 font-semibold text-zinc-900" : "mt-1 font-semibold text-ink"}>
            {step.title}
          </h3>
          <p className={isAdmin ? "mt-1 text-sm leading-relaxed text-zinc-600" : "mt-2 text-sm leading-relaxed text-muted"}>
            {step.description}
          </p>
        </div>

        {showDownload && (
          <a
            href={exportHref}
            download={step.downloadName}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-zinc-300 bg-zinc-50 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-100"
          >
            Descargar PNG
          </a>
        )}
      </div>
    </li>
  );
}

export function BookingFlowSteps({ variant, showDownload = false }: Props) {
  const grid = (
    <ol className={variant === "admin" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8"}>
      {BOOKING_FLOW_STEPS.map((step) => (
        <BookingFlowStepCard
          key={step.step}
          step={step}
          variant={variant}
          showDownload={showDownload}
        />
      ))}
    </ol>
  );

  if (variant === "admin") {
    return grid;
  }

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
        {grid}
      </div>
    </section>
  );
}

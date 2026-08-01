import { AdminSectionCard } from "@/app/admin/admin-section-card";
import { BookingFlowSteps } from "@/components/booking-flow-steps";

export function AdminContenidoPanel() {
  return (
    <AdminSectionCard
      id="contenido"
      title="Contenido — Proceso de reserva"
      description="Capturas reales del sitio en móvil, listas para compartir en redes, WhatsApp o presentaciones."
      className="mt-3 md:mt-6"
    >
      <BookingFlowSteps variant="admin" showDownload theme="light" />
      <p className="mt-4 text-xs text-zinc-500">
        Para regenerar capturas:{" "}
        <code className="rounded bg-zinc-100 px-1">npm run dev</code> +{" "}
        <code className="rounded bg-zinc-100 px-1">npm run screenshots:booking</code> +{" "}
        <code className="rounded bg-zinc-100 px-1">npm run content:export-booking</code>
      </p>
    </AdminSectionCard>
  );
}

import Image from "next/image";
import { AdminSectionCard } from "@/app/admin/admin-section-card";
import { getAdminContentAssets } from "@/lib/admin-content-assets";

export function AdminContenidoPanel() {
  const assets = getAdminContentAssets();

  return (
    <AdminSectionCard
      id="contenido"
      title="Contenido — Proceso de reserva"
      description="Capturas reales del sitio en móvil con flechas y etiquetas explicativas. Descarga para redes, presentaciones o documentación."
      className="mt-3 md:mt-6"
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <li
            key={asset.id}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
          >
            <div className="relative aspect-[27/35] bg-zinc-100">
              <Image
                src={asset.href}
                alt={asset.title}
                fill
                className="object-contain p-2"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
            <div className="space-y-3 p-4">
              <div>
                <h3 className="font-semibold text-zinc-900">{asset.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">{asset.description}</p>
              </div>
              <a
                href={asset.href}
                download={asset.downloadName}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-zinc-300 bg-zinc-50 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-100"
              >
                Descargar PNG
              </a>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-zinc-500">
        Para regenerar:{" "}
        <code className="rounded bg-zinc-100 px-1">npm run dev</code> +{" "}
        <code className="rounded bg-zinc-100 px-1">npm run content:booking-illustrations</code>
      </p>
    </AdminSectionCard>
  );
}

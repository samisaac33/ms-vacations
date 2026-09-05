import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";
import { AdminLoginForm } from "@/app/admin/admin-login-form";

export async function AdminLoginScreen() {
  const isConfigured = Boolean(process.env.ADMIN_SECRET);

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-sand-dark bg-surface p-8 shadow-sm">
          <div className="flex justify-center">
            <SiteLogo height={48} showTagline={false} />
          </div>

          <h1 className="mt-6 text-center font-display text-2xl font-semibold text-ink">
            Panel de administración
          </h1>
          <p className="mt-2 text-balance text-center text-sm leading-relaxed text-muted">
            Gestiona reservas, calendarios y precios de tus alojamientos en San Clemente y
            Portoviejo.
          </p>

          {isConfigured ? (
            <>
              <AdminLoginForm />
              <p className="mt-5 text-center text-xs leading-relaxed text-muted">
                Si no recuerdas la contraseña, contacta al soporte técnico para restablecerla.
              </p>
            </>
          ) : (
            <div
              className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950"
              role="status"
            >
              El acceso al panel aún no está disponible. Contacta al soporte técnico para
              activarlo.
            </div>
          )}
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-sm font-medium text-ocean hover:text-ocean-dark hover:underline">
            ← Volver al sitio público
          </Link>
        </p>
      </div>
    </div>
  );
}

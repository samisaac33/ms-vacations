import { AdminLoginForm } from "@/app/admin/admin-login-form";

type Props = {
  description?: string;
};

export function AdminLoginScreen({
  description = "Defina ADMIN_SECRET en el entorno del servidor.",
}: Props) {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-xl font-semibold">Acceso equipo</h1>
      <p className="mt-2 text-sm text-zinc-600">
        {description.includes("ADMIN_SECRET") ? (
          <>
            Defina <code className="rounded bg-zinc-200 px-1">ADMIN_SECRET</code> en el entorno.
          </>
        ) : (
          description
        )}
      </p>
      <AdminLoginForm />
    </div>
  );
}

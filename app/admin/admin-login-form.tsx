"use client";

import { useActionState } from "react";
import { adminLogin, type AdminLoginState } from "./actions";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLogin, {} as AdminLoginState);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          Contraseña de acceso
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          autoFocus
          disabled={pending}
          placeholder="Introduce tu contraseña"
          className="mt-1.5 w-full rounded-xl border border-sand-dark bg-sand/40 px-3.5 py-2.5 text-ink placeholder:text-muted/70 focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20 disabled:opacity-60"
        />
      </div>

      {state?.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-ocean py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {pending ? "Verificando…" : "Entrar al panel"}
      </button>
    </form>
  );
}

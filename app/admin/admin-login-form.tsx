"use client";

import { useActionState } from "react";
import { adminLogin, type AdminLoginState } from "./actions";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLogin, {} as AdminLoginState);

  return (
    <form action={formAction} className="mt-6 space-y-3">
      <label htmlFor="password" className="block text-sm font-medium">
        Contraseña
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        disabled={pending}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 disabled:opacity-60"
      />
      {state?.error && (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "…" : "Entrar"}
      </button>
    </form>
  );
}

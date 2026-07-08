import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "admin_session";

const ADMIN_SESSION_VALUE = "1";
const LEGACY_ADMIN_COOKIE_PATH = "/admin";

function adminSessionCookieOptions(path: string) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path,
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_SESSION_COOKIE)?.value === ADMIN_SESSION_VALUE;
}

/** Establece sesión admin. Path `/` para que `/api/admin/*` reciba la cookie. */
export async function setAdminSessionCookie() {
  const store = await cookies();
  // Limpiar cookie antigua con path /admin (no se enviaba a rutas /api/admin/*).
  store.set(ADMIN_SESSION_COOKIE, "", {
    ...adminSessionCookieOptions(LEGACY_ADMIN_COOKIE_PATH),
    maxAge: 0,
  });
  store.set(ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE, adminSessionCookieOptions("/"));
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete({ name: ADMIN_SESSION_COOKIE, path: "/" });
  store.delete({ name: ADMIN_SESSION_COOKIE, path: LEGACY_ADMIN_COOKIE_PATH });
}

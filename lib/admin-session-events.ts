export const ADMIN_SESSION_CHANGED_EVENT = "ms-admin-session-changed";

export function notifyAdminSessionChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT));
  }
}

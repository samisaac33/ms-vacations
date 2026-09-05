export const ADMIN_MENU_TOGGLE_EVENT = "admin-menu-toggle";
export const ADMIN_MENU_OPEN_MODAL_EVENT = "admin-menu-open-modal";

export type AdminMenuModalId =
  | "pagos"
  | "historial"
  | "facturacion"
  | "temporadas"
  | "iva"
  | "contenido"
  | "fotos";

export function toggleAdminMenu() {
  window.dispatchEvent(new CustomEvent(ADMIN_MENU_TOGGLE_EVENT));
}

export function openAdminMenuModal(id: AdminMenuModalId) {
  window.dispatchEvent(new CustomEvent(ADMIN_MENU_OPEN_MODAL_EVENT, { detail: id }));
}

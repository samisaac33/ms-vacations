import { revalidatePath } from "next/cache";

export function revalidatePropertyImagePaths(slug: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  revalidatePath(`/admin/propiedades/${slug}/fotos`);
  revalidatePath("/");
  revalidatePath("/propiedades");
  revalidatePath(`/propiedades/${slug}`);
  revalidatePath("/reservar", "layout");
  revalidatePath(`/reservar/${slug}`);
}

import { notFound } from "next/navigation";
import { AdminCalendarShell } from "@/app/admin/admin-calendar-shell";
import { AdminPropertyImagesView } from "@/app/admin/admin-property-images-view";
import { getPropertyBySlug } from "@/lib/properties";

type Props = { params: Promise<{ slug: string }> };

export async function AdminPropertyImagesDashboard({ params }: Props) {
  const { slug } = await params;
  const catalog = getPropertyBySlug(slug);
  if (!catalog) notFound();

  return (
    <AdminCalendarShell title={`Fotos · ${catalog.name}`}>
      <AdminPropertyImagesView slug={slug} />
    </AdminCalendarShell>
  );
}

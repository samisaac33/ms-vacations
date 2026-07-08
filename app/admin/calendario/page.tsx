import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ month?: string }> };

/** Ruta legacy: el calendario vive en /admin */
export default async function AdminCalendarioRedirect(props: Props) {
  const params = await props.searchParams;
  const q = params.month ? `?month=${encodeURIComponent(params.month)}` : "";
  redirect(`/admin${q}`);
}

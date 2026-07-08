import { NextResponse } from "next/server";
import { getPropertyBySlug } from "@/lib/catalog";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ property });
}

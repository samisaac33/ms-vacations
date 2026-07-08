import { NextResponse } from "next/server";
import { properties } from "@/lib/catalog";

export async function GET() {
  return NextResponse.json({
    properties: properties.map((property) => ({
      slug: property.slug,
      name: property.name,
      destination: property.destination,
      guests: property.guests,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      pricePerNight: property.pricePerNight,
      coverImage: property.images[0],
      shortDescription: property.shortDescription,
    })),
  });
}

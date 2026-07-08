import { expect, test } from "vitest";
import { getPropertyBySlug } from "@/lib/catalog";
import { calculateQuote } from "@/lib/pricing";

test("calcula cotización para una propiedad", () => {
  const property = getPropertyBySlug("alojamiento-arrecife");

  expect(property).toBeDefined();

  const quote = calculateQuote(property!, "2026-08-10", "2026-08-15");

  expect(quote).toMatchObject({
    nights: 5,
    pricePerNight: 250,
    subtotal: 1250,
    cleaningFee: 80,
    total: 1330,
  });
});

test("rechaza estadías menores al mínimo", () => {
  const property = getPropertyBySlug("home-luxury-la-punta");
  const quote = calculateQuote(property!, "2026-08-10", "2026-08-11");

  expect(quote).toBeNull();
});

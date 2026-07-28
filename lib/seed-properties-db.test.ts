import { describe, expect, it } from "vitest";
import { hasDatabase } from "@/db/index";
import { upsertCatalogPropertyBySlug } from "@/lib/seed-properties-db";

describe("upsertCatalogPropertyBySlug", () => {
  it("returns false for slugs not in catalog", async () => {
    expect(await upsertCatalogPropertyBySlug("slug-inexistente")).toBe(false);
  });

  it("returns false when DATABASE_URL is not configured", async () => {
    if (hasDatabase()) return;
    expect(await upsertCatalogPropertyBySlug("container-stay-1-san-clemente")).toBe(false);
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { verifyAdminPassword } from "@/lib/admin-login";

describe("verifyAdminPassword", () => {
  afterEach(() => {
    delete process.env.ADMIN_SECRET;
  });

  it("rechaza cuando ADMIN_SECRET no está configurado", () => {
    const result = verifyAdminPassword("secret");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(503);
  });

  it("rechaza contraseña incorrecta", () => {
    process.env.ADMIN_SECRET = "secret";
    const result = verifyAdminPassword("wrong");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(401);
      expect(result.error).toContain("incorrecta");
    }
  });

  it("acepta contraseña correcta", () => {
    process.env.ADMIN_SECRET = "secret";
    expect(verifyAdminPassword("secret")).toEqual({ ok: true });
  });
});

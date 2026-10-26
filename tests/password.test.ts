import { pbkdf2Sync } from "node:crypto";
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
describe("password compatibility", () => {
  it("authenticates existing Passport hashes and rejects incorrect passwords", async () => {
    const salt = "legacy-account-salt";
    const hash = pbkdf2Sync(
      "legacy-password",
      salt,
      25000,
      512,
      "sha256",
    ).toString("hex");
    expect(await verifyPassword("legacy-password", { salt, hash })).toBe(true);
    expect(await verifyPassword("incorrect", { salt, hash })).toBe(false);
  });
  it("uses independently salted scrypt hashes for new passwords", async () => {
    const password = "a long and memorable password 🔑";
    const first = await hashPassword(password);
    const second = await hashPassword(password);
    expect(first).not.toBe(second);
    expect(await verifyPassword(password, { passwordHash: first })).toBe(true);
    expect(await verifyPassword("incorrect", { passwordHash: first })).toBe(
      false,
    );
  });
  it("fails safely for incomplete or malformed hashes", async () => {
    expect(await verifyPassword("password", {})).toBe(false);
    expect(
      await verifyPassword("password", {
        passwordHash: "scrypt$salt$malformed",
      }),
    ).toBe(false);
  });
});

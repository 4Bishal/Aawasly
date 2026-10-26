import { afterEach, describe, expect, it, vi } from "vitest";
import { MAX_IMAGE_BYTES } from "@/lib/constants";
const mocks = vi.hoisted(() => ({ resource: vi.fn(), config: vi.fn() }));
vi.mock("@/lib/env", () => ({
  getServerEnv: () => ({
    CLOUDINARY_CLOUD_NAME: "test",
    CLOUDINARY_API_KEY: "test",
    CLOUDINARY_API_SECRET: "test",
    MAPTILER_API_KEY: "test",
  }),
}));
vi.mock("cloudinary", () => ({
  v2: { config: mocks.config, api: { resource: mocks.resource } },
}));
import { verifyImages } from "@/lib/services/cloudinary";
import { geocode } from "@/lib/services/geocoding";
afterEach(() => {
  vi.restoreAllMocks();
  mocks.resource.mockReset();
});
const image = {
  url: "https://res.cloudinary.com/test/image/upload/stay.jpg",
  filename: "aawasly/listings/owner/stay",
};
describe("Cloudinary resource verification", () => {
  it("checks provider metadata for a user-scoped upload", async () => {
    mocks.resource.mockResolvedValue({
      secure_url: image.url,
      bytes: 1000,
      format: "jpg",
    });
    await verifyImages([image], "owner");
    expect(mocks.resource).toHaveBeenCalledWith(image.filename, {
      resource_type: "image",
    });
  });
  it("rejects resources owned by a different user before provider access", async () => {
    await expect(verifyImages([image], "someone-else")).rejects.toMatchObject({
      status: 400,
    });
    expect(mocks.resource).not.toHaveBeenCalled();
  });
  it("rejects oversized uploads even when the browser check is bypassed", async () => {
    mocks.resource.mockResolvedValue({
      secure_url: image.url,
      bytes: MAX_IMAGE_BYTES + 1,
      format: "jpg",
    });
    await expect(verifyImages([image], "owner")).rejects.toMatchObject({
      status: 400,
    });
  });
  it("keeps existing legacy images editable without reuploading", async () => {
    await verifyImages([{ url: image.url, filename: "legacy" }], "owner", [
      { url: image.url, filename: "" },
    ]);
    expect(mocks.resource).not.toHaveBeenCalled();
  });
});
describe("MapTiler geocoding responses", () => {
  it("accepts validated coordinates", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        features: [{ geometry: { type: "Point", coordinates: [83.98, 28.2] } }],
      }),
    );
    expect(await geocode("Pokhara", "Nepal")).toEqual({
      type: "Point",
      coordinates: [83.98, 28.2],
    });
  });
  it("handles an unknown location", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ features: [] }),
    );
    await expect(geocode("Unknown", "Nepal")).rejects.toMatchObject({
      status: 422,
    });
  });
  it("returns a clean error on a provider outage", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 503 }),
    );
    await expect(geocode("Pokhara", "Nepal")).rejects.toMatchObject({
      status: 502,
    });
  });
});

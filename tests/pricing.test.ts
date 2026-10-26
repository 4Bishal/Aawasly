import { describe, it, expect } from "vitest";
import { calculatePrice, formatNPR } from "@/lib/utils/pricing";
describe("NPR and VAT", () => {
  it("preserves the base nightly rate when tax is disabled", () => {
    expect(calculatePrice(1500)).toEqual({
      subtotal: 1500,
      tax: 195,
      total: 1695,
      display: 1500,
      currency: "NPR",
    });
  });
  it("applies the requested 13% VAT with rounding in paisa", () => {
    expect(calculatePrice(100.05, true).display).toBe(113.06);
    expect(calculatePrice(1500, true).display).toBe(1695);
  });
  it.each([-1, NaN, Infinity])("rejects invalid money %s", (price) =>
    expect(() => calculatePrice(price)).toThrow(RangeError),
  );
  it("labels prices in Nepalese rupees", () =>
    expect(formatNPR(1695)).toBe("रू 1,695"));
});

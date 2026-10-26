export const CURRENCY = "NPR" as const;
export const VAT_RATE = 0.13;
/** Existing MongoDB prices remain pre-tax NPR amounts. Round in paisa. */
export function calculatePrice(basePrice: number, includeTax = false) {
  if (!Number.isFinite(basePrice) || basePrice < 0)
    throw new RangeError("Price must be a finite non-negative amount");
  const subtotalPaisa = Math.round(basePrice * 100);
  const taxPaisa = Math.round(subtotalPaisa * VAT_RATE);
  return {
    subtotal: subtotalPaisa / 100,
    tax: taxPaisa / 100,
    total: (subtotalPaisa + taxPaisa) / 100,
    display: (subtotalPaisa + (includeTax ? taxPaisa : 0)) / 100,
    currency: CURRENCY,
  };
}
export function formatNPR(amount: number) {
  return `रू ${new Intl.NumberFormat("en-NP", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)}`;
}

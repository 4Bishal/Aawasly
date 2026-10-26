"use client";
import { useTax } from "@/providers/pricing-provider";
import { calculatePrice, formatNPR } from "@/lib/utils/pricing";
export function Price({
  price,
  large = false,
}: {
  price: number;
  large?: boolean;
}) {
  const { includeTax } = useTax();
  return (
    <div>
      <span
        className={
          large
            ? "text-3xl font-semibold tracking-tight"
            : "text-base font-semibold"
        }
      >
        {formatNPR(calculatePrice(price, includeTax).display)}
      </span>
      <span className="ml-1 text-sm text-muted-foreground">/ night</span>
      <p className="mt-1 text-xs text-muted-foreground">
        {includeTax ? "Includes 13% VAT" : "Before taxes"}
      </p>
    </div>
  );
}
export function TaxToggle() {
  const { includeTax, setIncludeTax } = useTax();
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
      <span>Display total after taxes</span>
      <button
        type="button"
        role="switch"
        aria-checked={includeTax}
        aria-label="Display prices including 13% VAT"
        onClick={() => setIncludeTax(!includeTax)}
        className={`relative h-6 w-10 rounded-full transition-colors ${includeTax ? "bg-primary" : "bg-muted-foreground"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-card shadow-sm transition-transform ${includeTax ? "translate-x-[18px]" : "translate-x-0.5"} left-0`}
        />
      </button>
    </label>
  );
}
export function PricePanel({ price }: { price: number }) {
  const { includeTax } = useTax();
  const result = calculatePrice(price, includeTax);
  return (
    <aside className="self-start rounded-3xl border border-border bg-card p-7 shadow-[0_8px_40px_-20px_#25372c40] lg:sticky lg:top-28">
      <p className="eyebrow mb-5">A place to call yours</p>
      <Price price={price} large />
      <div className="my-6 border-t border-border pt-6">
        <TaxToggle />
      </div>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt>Nightly rate</dt>
          <dd>{formatNPR(result.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <dt>VAT (13%)</dt>
          <dd>{formatNPR(result.tax)}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-4 font-semibold">
          <dt>Total per night</dt>
          <dd>{formatNPR(result.total)}</dd>
        </div>
      </dl>
      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        Explore the space, get to know your host, and read what other guests
        loved.
      </p>
    </aside>
  );
}

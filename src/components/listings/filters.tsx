"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BedDouble,
  Building2,
  Mountain,
  Castle,
  Waves,
  Tent,
  Sprout,
  Snowflake,
  Circle,
  Ship,
  Search,
  MapPin,
  X,
  LoaderCircle,
  SlidersHorizontal,
  Grid2X2,
} from "lucide-react";
import { CATEGORIES, AMENITIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaxToggle } from "@/components/listings/price";
const icons = [
  BedDouble,
  Building2,
  Mountain,
  Castle,
  Waves,
  Tent,
  Sprout,
  Snowflake,
  Circle,
  Ship,
];
export function Filters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [searchKeyboardFocus, setSearchKeyboardFocus] = useState(false);
  const searchRef = useRef(params.toString());
  searchRef.current = params.toString();
  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);
  function navigate(updates: Record<string, string>) {
    const next = new URLSearchParams(searchRef.current);
    next.delete("page");
    Object.entries(updates).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    startTransition(() =>
      router.replace(`${pathname}?${next}`, { scroll: false }),
    );
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = new URLSearchParams(searchRef.current);
      if (q.trim() !== (current.get("q") ?? "")) {
        current.delete("page");
        q.trim() ? current.set("q", q.trim()) : current.delete("q");
        startTransition(() =>
          router.replace(`${pathname}?${current}`, { scroll: false }),
        );
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [q, pathname, router]);
  return (
    <div aria-busy={pending}>
      <form
        role="search"
        aria-label="Search stays"
        data-keyboard-focus={searchKeyboardFocus}
        onPointerDown={() => setSearchKeyboardFocus(false)}
        onKeyUp={(event) => {
          if (event.key === "Tab") setSearchKeyboardFocus(true);
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setSearchKeyboardFocus(false);
        }}
        onSubmit={(event) => {
          event.preventDefault();
          navigate({ q: q.trim() });
        }}
        className="stay-search relative z-10 mx-auto -mt-9 mb-12 flex max-w-3xl items-center gap-2 rounded-full bg-card p-2 pl-4 shadow-[0_8px_35px_-12px_#142b2630] ring-1 ring-border/50 sm:gap-4 sm:p-2.5 sm:pl-5 dark:shadow-[0_8px_35px_-12px_#00000080]"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/65 text-primary sm:size-11">
          <MapPin aria-hidden="true" className="size-4 sm:size-5" />
        </span>
        <label className="min-w-0 flex-1 py-1.5">
          <span className="block truncate text-[11px] font-semibold tracking-wide text-muted-foreground">
            Find your next stay
          </span>
          <input
            type="search"
            name="q"
            enterKeyHint="search"
            autoComplete="off"
            aria-label="Search destinations or stays"
            className="stay-search-input mt-0.5 block w-full min-w-0 p-0 text-base text-foreground placeholder:text-muted-foreground/80"
            placeholder="Search destinations or stays"
            value={q}
            maxLength={120}
            onChange={(event) => setQ(event.target.value)}
          />
        </label>
        {q && (
          <button
            type="button"
            aria-label="Clear search"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => setQ("")}
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
        <Button
          type="submit"
          className="size-12 gap-2.5 p-0 sm:w-auto sm:px-6"
          aria-label="Search stays"
        >
          {pending ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Search aria-hidden="true" className="size-4" />
          )}
          <span className="hidden sm:inline">Search</span>
        </Button>
      </form>
      <div className="mb-7 flex items-center justify-between gap-5 border-b border-border">
        <div className="flex flex-1 gap-6 overflow-x-auto [scrollbar-width:none]">
          <button
            onClick={() => navigate({ category: "" })}
            className={`category-tab ${!params.get("category") ? "active" : ""}`}
          >
            <Grid2X2 className="size-5" />
            <span>All stays</span>
          </button>
          {CATEGORIES.map((category, i) => {
            const Icon = icons[i];
            return (
              <button
                key={category}
                onClick={() => navigate({ category })}
                className={`category-tab ${params.get("category") === category ? "active" : ""}`}
              >
                <Icon className="size-5" />
                <span>{category}</span>
              </button>
            );
          })}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="mb-3 hidden rounded-xl px-4 sm:flex"
            >
              <SlidersHorizontal className="size-4" /> Filters
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="text-2xl font-semibold">
              Find your kind of stay
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-muted-foreground">
              Price filters use the nightly rate before VAT, in NPR.
            </DialogDescription>
            <form
              key={params.toString()}
              className="mt-7 space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                navigate({
                  minPrice: String(data.get("minPrice") ?? ""),
                  maxPrice: String(data.get("maxPrice") ?? ""),
                  minRating: String(data.get("minRating") ?? "0"),
                  amenities: data.getAll("amenities").join(","),
                });
                setOpen(false);
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <label className="field-label">
                  Minimum (रू)
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    name="minPrice"
                    defaultValue={params.get("minPrice") ?? ""}
                    placeholder="Any"
                  />
                </label>
                <label className="field-label">
                  Maximum (रू)
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    name="maxPrice"
                    defaultValue={params.get("maxPrice") ?? ""}
                    placeholder="Any"
                  />
                </label>
              </div>
              <label className="field-label">
                Guest rating
                <select
                  className="input"
                  name="minRating"
                  defaultValue={params.get("minRating") ?? "0"}
                >
                  <option value="0">Any rating</option>
                  <option value="3">3+ stars</option>
                  <option value="4">4+ stars</option>
                  <option value="4.5">4.5+ stars</option>
                </select>
              </label>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold">
                  The little comforts
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {AMENITIES.map((a) => (
                    <label key={a} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="amenities"
                        value={a}
                        defaultChecked={params
                          .get("amenities")
                          ?.split(",")
                          .includes(a)}
                        className="accent-primary"
                      />
                      {a}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    navigate({
                      minPrice: "",
                      maxPrice: "",
                      minRating: "",
                      amenities: "",
                    });
                    setOpen(false);
                  }}
                >
                  Reset
                </Button>
                <Button type="submit">Show stays</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">A stay for every story</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {params.get("q")
              ? `Stays for “${params.get("q")}”`
              : params.get("category") || "Somewhere you’ll love"}
            <span className="ml-3 align-middle text-xs font-normal text-muted-foreground">
              {total} {total === 1 ? "stay" : "stays"}
              {pending ? " · Updating…" : ""}
            </span>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <TaxToggle />
          <label className="sr-only" htmlFor="sort">
            Sort stays
          </label>
          <select
            id="sort"
            className="h-12 rounded-2xl border border-border bg-card px-3 text-sm"
            value={params.get("sort") ?? "newest"}
            onChange={(event) => navigate({ sort: event.target.value })}
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden"
            aria-label="Open filters"
            onClick={() => setOpen(true)}
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

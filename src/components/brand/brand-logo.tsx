import Image from "next/image";
import { BRAND } from "@/lib/branding";
import { cn } from "@/lib/utils";

/** CSS selects the asset before hydration using the root next-themes class. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block h-9 w-36 shrink-0 overflow-hidden sm:h-11 sm:w-44",
        className,
      )}
    >
      {/* The supplied PNGs have transparent vertical margins; cover clips only
          those margins while reserving a stable horizontal logo footprint. */}
      <Image
        src={BRAND.logo.light}
        alt=""
        fill
        sizes="(max-width: 639px) 144px, 176px"
        className="object-cover dark:hidden"
      />
      <Image
        src={BRAND.logo.dark}
        alt=""
        fill
        sizes="(max-width: 639px) 144px, 176px"
        className="hidden object-cover dark:block"
      />
    </span>
  );
}

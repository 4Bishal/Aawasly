import Link from "next/link";
import {
  ArrowUpRight,
  Github,
  HousePlus,
  Linkedin,
  MapPin,
  Globe,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";

const creator = {
  name: "Bishal Bhandari",
  portfolio: "https://bhandari-bishal.com.np/",
  linkedin: "https://www.linkedin.com/in/bishal-bhandari-a63b8926a",
  github: "https://github.com/4Bishal",
} as const;

const explore = [
  { label: "All stays", href: "/listing" },
  { label: "Mountain escapes", href: "/listing?category=Mountains" },
  { label: "City hideaways", href: "/listing?category=Iconic%20Cities" },
  { label: "Countryside stays", href: "/listing?category=Farms" },
];
const hosting = [
  { label: "List your home", href: "/listing/new" },
  { label: "Join Aawasly", href: "/signup" },
  { label: "Log in", href: "/login" },
];
const profiles = [
  { label: "Portfolio", href: creator.portfolio, Icon: Globe },
  { label: "LinkedIn", href: creator.linkedin, Icon: Linkedin },
  { label: "GitHub", href: creator.github, Icon: Github },
];
const footerLink =
  "inline-flex w-fit items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary";

/** Doorway linework echoes the supplied logo and inherits the active theme. */
function DoorwayPattern() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 640 320"
      fill="none"
      className="pointer-events-none absolute inset-y-0 right-0 h-full w-2/3 max-w-2xl text-primary opacity-[0.07] dark:opacity-[0.12]"
      preserveAspectRatio="xMaxYMid slice"
    >
      <g stroke="currentColor" strokeWidth="1.5">
        <path d="M60 340V164a38 38 0 0 1 14-30L260-18a38 38 0 0 1 48 0l186 152a38 38 0 0 1 14 30v176" />
        <path d="M113 340V184a27 27 0 0 1 10-21L267 45a27 27 0 0 1 34 0l144 118a27 27 0 0 1 10 21v156" />
        <path d="M168 340V204a19 19 0 0 1 7-15l97-79a19 19 0 0 1 24 0l97 79a19 19 0 0 1 7 15v136" />
        <path d="M231 340V221a53 53 0 0 1 106 0v119" />
        <path d="M354 340c-110-75-173-43-134-87 26-29 68-19 64-47" />
        <path d="M498 292h116M532 257h82M559 222h55" strokeDasharray="3 8" />
      </g>
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative isolate mt-20 overflow-hidden border-t border-border bg-muted/35">
      <section
        aria-labelledby="footer-host-heading"
        className="relative overflow-hidden border-b border-border bg-gradient-to-br from-accent/80 via-background to-muted/60"
      >
        <DoorwayPattern />
        <div className="page-shell relative flex flex-col items-start justify-between gap-7 py-10 sm:py-12 lg:flex-row lg:items-center lg:gap-12">
          <div className="max-w-xl">
            <p className="eyebrow mb-3 flex items-center gap-2 text-primary">
              <HousePlus aria-hidden="true" className="size-4" />
              Open your doors
            </p>
            <h2
              id="footer-host-heading"
              className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
            >
              Your home. A new beginning.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              A quiet corner, a city hideaway, a place with a story. Make it
              someone’s next favourite stay.
            </p>
          </div>
          <Button asChild variant="dark" size="lg" className="shrink-0">
            <Link href="/listing/new">
              <HousePlus aria-hidden="true" className="size-4" />
              List your home
            </Link>
          </Button>
        </div>
      </section>

      <div className="page-shell grid grid-cols-2 gap-x-6 gap-y-10 py-10 sm:py-12 lg:grid-cols-[1.7fr_1fr_1fr_1fr] lg:gap-10">
        <div className="col-span-2 lg:col-span-1">
          <Link
            href="/listing"
            className="inline-block rounded-sm"
            aria-label="Aawasly home"
          >
            <BrandLogo />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            Thoughtful spaces. Memorable stays.
            <br />
            Find a place that feels like you.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin aria-hidden="true" className="size-3.5 text-primary" />
            Rooted in Nepal. Open to discovery.
          </span>
        </div>

        <nav aria-label="Explore stays">
          <h3 className="mb-5 text-sm font-semibold">Find your place</h3>
          <ul className="space-y-3.5">
            {explore.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={footerLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Hosting and account">
          <h3 className="mb-5 text-sm font-semibold">Make yourself at home</h3>
          <ul className="space-y-3.5">
            {hosting.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={footerLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav
          aria-label="Connect with the developer"
          className="col-span-2 lg:col-span-1"
        >
          <h3 className="mb-5 text-sm font-semibold">Behind Aawasly</h3>
          <ul className="flex flex-wrap gap-x-6 gap-y-3.5 lg:flex-col">
            {profiles.map(({ label, href, Icon }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLink}
                  aria-label={`${label} — ${creator.name} (opens in a new tab)`}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                  <ArrowUpRight aria-hidden="true" className="size-3" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="page-shell flex flex-col gap-5 border-t border-border pb-20 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="space-y-2 text-xs leading-5 text-muted-foreground">
          <p>© {new Date().getFullYear()} Aawasly · Where Stays Begin</p>
          <p>
            Designed &amp; built by{" "}
            <a
              href={creator.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
            >
              {creator.name}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <span className="text-xs font-medium text-muted-foreground">
            NPR <span className="ml-1 text-foreground">रू</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

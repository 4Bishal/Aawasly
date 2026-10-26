import type { Metadata, Viewport } from "next";
import { getSession } from "@/lib/auth";
import { AppProviders } from "@/providers/app-providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { BRAND } from "@/lib/branding";
import "@maptiler/sdk/style.css";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
  ),
  applicationName: BRAND.name,
  title: { default: BRAND.title, template: "%s | Aawasly" },
  description: BRAND.description,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: BRAND.icon.small, type: "image/png", sizes: "192x192" }],
    shortcut: BRAND.icon.small,
    apple: [{ url: BRAND.icon.apple, type: "image/png", sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: BRAND.name, statusBarStyle: "default" },
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    locale: "en_NP",
    title: BRAND.title,
    description: BRAND.description,
    images: [
      {
        url: BRAND.social.src,
        width: BRAND.social.width,
        height: BRAND.social.height,
        alt: BRAND.social.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.title,
    description: BRAND.description,
    images: [{ url: BRAND.social.src, alt: BRAND.social.alt }],
  },
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND.colors.light },
    { media: "(prefers-color-scheme: dark)", color: BRAND.colors.dark },
  ],
};
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <AppProviders session={session}>
          <a
            href="#main"
            className="sr-only fixed left-4 top-4 z-50 rounded-full bg-card px-5 py-3 focus:not-sr-only"
          >
            Skip to content
          </a>
          <Navbar />
          <div className="min-h-[65vh]">{children}</div>
          <Footer />
          <ThemeSwitcher />
        </AppProviders>
      </body>
    </html>
  );
}

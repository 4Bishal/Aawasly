import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: BRAND.title,
    short_name: BRAND.name,
    description: BRAND.description,
    lang: "en",
    start_url: "/listing",
    scope: "/",
    display: "standalone",
    background_color: BRAND.colors.light,
    theme_color: BRAND.colors.icon,
    icons: [
      {
        src: BRAND.icon.small,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: BRAND.icon.large,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

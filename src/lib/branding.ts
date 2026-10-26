/** Paths and dimensions of the supplied branding assets in public/branding. */
export const BRAND = {
  name: "Aawasly",
  title: "Aawasly | Where Stays Begin",
  description:
    "Discover thoughtful spaces, mountain escapes, and city hideaways. Find your next stay with Aawasly.",
  logo: { light: "/branding/logo-light.png", dark: "/branding/logo-dark.png" },
  icon: {
    small: "/branding/icon-192.png",
    large: "/branding/icon-512.png",
    apple: "/branding/apple-touch-icon.png",
  },
  social: {
    src: "/branding/social-preview.png",
    width: 1731,
    height: 908,
    alt: "Aawasly — Where Stays Begin. Thoughtful spaces. Memorable stays.",
  },
  colors: { light: "#FDFCF9", dark: "#141B18", icon: "#243C32" },
} as const;

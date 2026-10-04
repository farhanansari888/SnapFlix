import localFont from "next/font/local";

// Vendored so production builds do not fetch Google Fonts.
// Figtree (OFL-1.1) for interface text, Bebas Neue (OFL-1.1) for the wordmark and ranks.

export const Poppins = localFont({
  src: [
    { path: "../fonts/figtree-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/figtree-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/figtree-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/figtree-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
  fallback: ["Segoe UI", "Helvetica Neue", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const BebasNeue = localFont({
  src: "../fonts/bebas-neue-latin-400-normal.woff2",
  variable: "--font-bebas-neue",
  display: "swap",
  weight: "400",
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
  adjustFontFallback: false,
});

/** Kept for existing imports. Interface text uses Figtree. */
export const Saira = Poppins;

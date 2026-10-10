import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NODAL — Marine Observatory",
  description:
    "Environmental decision-support prototype for proposed underwater computing infrastructure in Miami. Observed data, explicit simulation, conceptual architecture. Not a deployment certification.",
  // Neutral blank icon: avoids a 404 on /favicon.ico; the final mark is human-owned.
  icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Crect width='8' height='8' fill='%23061b24'/%3E%3C/svg%3E" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/AspektaVF.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}

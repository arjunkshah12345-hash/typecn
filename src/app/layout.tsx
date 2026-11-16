import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { themeScript } from "@/components/theme-toggle";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `typecn — ${site.tagline}`, template: "%s · typecn" },
  description: site.description,
  applicationName: "typecn",
  keywords: ["typography", "text animation", "react", "kinetic typography", "variable fonts", "open source", "motion", "next.js"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "typecn", title: `typecn — ${site.tagline}`, description: site.description, url: "/" },
  twitter: { card: "summary_large_image", title: `typecn — ${site.tagline}`, description: site.description },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f0e0c" },
    { media: "(prefers-color-scheme: light)", color: "#f1ece3" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="grain">
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

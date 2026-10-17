import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Fullstack developer in Barcelona building generative AI products. Next.js, Postgres, iOS, and interfaces that feel considered.";

export const metadata: Metadata = {
  metadataBase: new URL("https://joan-sole.com"),
  title: "Joan Solé · Fullstack developer",
  description,
  openGraph: {
    title: "Joan Solé · Fullstack developer",
    description,
    url: "https://joan-sole.com",
    siteName: "Joan Solé",
    locale: "en",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0f0d0b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${geist.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}

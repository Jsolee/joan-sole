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
  "Fullstack developer in Barcelona. I build generative AI products at TheEtailers with Next.js and Postgres.";

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
  themeColor: "#f3f0e8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${geist.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("motion")==="off")document.documentElement.dataset.motion="off"}catch(e){}`,
          }}
        />
      </head>
      <body>
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}

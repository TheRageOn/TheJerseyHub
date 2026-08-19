import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "TheJerseyHub — Authentic Football Culture & Collector Kits",
  description:
    "Editorial platform for authentic match-issue jerseys, heritage kits, and football culture archive.",
  metadataBase: new URL("https://thejerseyhub.com"),
  openGraph: {
    title: "TheJerseyHub",
    description: "Authentic Football Culture & Collector Kits",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#060606",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="font-body bg-[#060606] text-[#faf6f0] antialiased">
        {children}
      </body>
    </html>
  );
}

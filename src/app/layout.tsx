import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Devnads - Building on Monad",
  description:
    "Community tools and platforms for the Monad ecosystem. Events, skills, and more.",
  keywords: [
    "Devnads",
    "Monad",
    "blockchain",
    "developer",
    "community",
    "testnet",
  ],
  authors: [{ name: "Devnads" }],
  creator: "Devnads",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Devnads",
    description: "Community tools and platforms for the Monad ecosystem.",
    siteName: "Devnads",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devnads",
    description: "Community tools and platforms for the Monad ecosystem.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-background min-h-screen text-foreground text-sm font-sans`}
      >
        {children}
      </body>
    </html>
  );
}

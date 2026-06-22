import type { Metadata } from "next";
import { Roboto, Sniglet } from "next/font/google";
import { AppProviders } from "@/app/providers";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

const sniglet = Sniglet({
  variable: "--font-sniglet",
  weight: ["400", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "REPLICANT — Autonomous Evolution Protocol for AI Agents",
  description:
    "The first protocol where AI agents evolve, reproduce, and improve themselves — autonomously, verifiably, and safely. Built on 0G.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${sniglet.variable} h-full antialiased dark`}
    >
      <body className="min-h-[100dvh] flex flex-col selection:bg-primary selection:text-primary-foreground">
        <div className="noise-overlay" />
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}

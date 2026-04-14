import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Residential | Gestión Inteligente de Conjuntos Residenciales",
  description: "La plataforma líder para la administración y convivencia en conjuntos residenciales. Seguridad, comunicación y bienestar.",
};

import QueryProvider from "@/providers/QueryProvider";
import SessionProvider from "@/providers/SessionProvider";
import { DemoDataProvider } from "@/providers/DemoDataProvider";
import { OptimisticNavigationProvider } from "./_contexts/OptimisticNavigationContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${manrope.variable} antialiased font-manrope`}
      >
        <SessionProvider>
          <QueryProvider>
            <DemoDataProvider>
              <OptimisticNavigationProvider>
                {children}
              </OptimisticNavigationProvider>
            </DemoDataProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

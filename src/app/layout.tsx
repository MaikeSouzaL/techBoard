import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechBoard — Guia de Reparos",
  description: "Sistema avançado de diagnóstico e gestão de reparos técnicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="antialiased bg-bg-deep text-text font-sans h-screen w-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}

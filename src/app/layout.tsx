import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CxAssistantWidget } from "@/components/shared/CxAssistantWidget";
import { VersionFooter } from "@/components/shared/VersionFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoutePulse AI Tester",
  description: "MVP tester local para validar el flujo operativo de RoutePulse AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
        <CxAssistantWidget />
        <VersionFooter />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CxAssistantWidget } from "@/components/shared/CxAssistantWidget";
import { VersionFooter } from "@/components/shared/VersionFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "RouteTrust — Operational intelligence for logistics teams",
  description:
    "RouteTrust helps logistics companies coordinate routes, approve AI-suggested decisions, track drivers, and keep customers informed in real time.",
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

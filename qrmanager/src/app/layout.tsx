import type { Metadata } from "next";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "QR-Manager · GAMS — Portal de Verificación Municipal",
  description: "Portal de verificación de servicios municipales del Gobierno Autónomo Municipal de Sucre.",
  keywords: ["GAMS", "Sucre", "Bolivia", "QR", "verificación", "municipal"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
// src/app/resultado/[uuid]/page.tsx
"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { Resultado, ScanResponse } from "./types";
import { QRCard } from "./components/QRCard";
import { LoadingCard } from "./components/LoadingCard";

/* ─────────────────────────────────────────
   MOCK DATA (reemplazar con fetch real)
───────────────────────────────────────── */
const MOCK: Record<Resultado, ScanResponse> = {
  VALIDO: {
    uuid: "a3f8-9d21-bc47-e156-0023",
    resultado: "VALIDO",
    estado: { nombre: "Activo", color_hex: "#16A34A", bloquea_qr: false },
    sistema: {
      nombre: "Taxi Seguro — GAMS",
      descripcion: "Dirección Municipal de Tránsito",
      color_hex: "#EAB308",
    },
    registro: {
      datos_display: {
        Titular: "Carlos Alberto Mamani",
        Licencia: "TX-4821-SC",
        CI: "5 421 890 SC",
        "Placa vehículo": "2847 SCZ",
        Asociación: "ASTAXIS",
        "Zona autorizada": "Zona Central y Norte",
      },
      fecha_inicio: "2025-06-15",
      fecha_vencimiento: "2026-06-15",
    },
    scan: { numero: 47, ip: "190.129.x.x", dispositivo: "Android Chrome" },
  },
  VENCIDO: {
    uuid: "b7c2-4f18-da93-0047-e821",
    resultado: "VENCIDO",
    estado: { nombre: "Vencido", color_hex: "#DC2626", bloquea_qr: true },
    sistema: {
      nombre: "Taxi Seguro — GAMS",
      descripcion: "Dirección Municipal de Tránsito",
      color_hex: "#EAB308",
    },
    registro: {
      datos_display: {
        Titular: "Juan Flores Quispe",
        Licencia: "TX-3310-SC",
        Placa: "1234 SCZ",
      },
      fecha_inicio: "2024-01-01",
      fecha_vencimiento: "2025-01-01",
    },
    scan: { numero: 22, ip: "190.129.x.x", dispositivo: "iPhone Safari" },
  },
  SUSPENDIDO: {
    uuid: "c9e4-7b31-ff28-aa01-5564",
    resultado: "SUSPENDIDO",
    estado: { nombre: "Suspendido", color_hex: "#D97706", bloquea_qr: true },
    sistema: {
      nombre: "DMA — Permisos de Viaje",
      descripcion: "Dirección de Movilidad y Administración",
      color_hex: "#3B82F6",
    },
    registro: {
      datos_display: {
        Conductor: "Rosa Quispe M.",
        Placa: "ABC-123",
        Ruta: "Sucre → Potosí",
      },
      fecha_inicio: "2026-03-01",
      fecha_vencimiento: "2026-03-26",
      suspendido_por: "Of. M. Torres — GAMS",
      motivo_suspension: "Suspendido manualmente por infracción de ruta el 10/02/2026.",
    },
    scan: { numero: 8, ip: "190.129.x.x", dispositivo: "Android Chrome" },
  },
  NO_ENCONTRADO: {
    uuid: "xxxx-xxxx-xxxx-xxxx",
    resultado: "NO_ENCONTRADO",
    estado: { nombre: "No encontrado", color_hex: "#6B7280", bloquea_qr: true },
    sistema: {
      nombre: "QR-Manager — GAMS",
      descripcion: "Sistema Municipal de Verificación",
      color_hex: "#C0392B",
    },
    registro: { datos_display: {}, fecha_inicio: "", fecha_vencimiento: "" },
    scan: { numero: 0, ip: "190.129.x.x", dispositivo: "Desconocido" },
  },
};

export default function ResultadoPage({ params }: { params: { uuid: string } }) {
  const [data, setData] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoState, setDemoState] = useState<Resultado>("VALIDO");

  // Simulación — reemplazar con fetch real
  useEffect(() => {
    const t = setTimeout(() => {
      setData(MOCK[demoState]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [demoState]);

  return (
    <div className={styles.root}>
      {/* Demo switcher (quitar en producción) */}
      <div className={styles.demoBar}>
        <span className={styles.demoLabel}>Modo demo · simular resultado:</span>
        {(["VALIDO", "VENCIDO", "SUSPENDIDO", "NO_ENCONTRADO"] as Resultado[]).map(
          (r) => (
            <button
              key={r}
              onClick={() => {
                setLoading(true);
                setDemoState(r);
              }}
              className={`${styles.demoBtn} ${
                demoState === r ? styles.demoBtnActive : ""
              }`}
            >
              {r === "VALIDO"
                ? "✓ Válido"
                : r === "VENCIDO"
                ? "✗ Vencido"
                : r === "SUSPENDIDO"
                ? "⊘ Suspendido"
                : "⚠ Falso"}
            </button>
          )
        )}
      </div>

      {/* Background glow */}
      <div
        className={styles.bgGlow}
        style={{
          background: data
            ? `radial-gradient(ellipse 500px 400px at 50% 20%, ${
                data.sistema.color_hex
              }18 0%, transparent 70%)`
            : "none",
        }}
      />

      {/* GAMS Header */}
      <div className={styles.gamsBar}>
        <div className={styles.gamsLogo}>🏛</div>
        <div>
          <div className={styles.gamsName}>
            Gobierno Autónomo Municipal de Sucre
          </div>
          <div className={styles.gamsSub}>
            Sistema de Verificación QR · GAMS
          </div>
        </div>
      </div>

      {/* Main Card */}
      <main className={styles.main}>
        {loading ? (
          <LoadingCard />
        ) : data ? (
          <QRCard data={data} />
        ) : null}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerText}>
          © {new Date().getFullYear()} Gobierno Autónomo Municipal de Sucre
        </div>
        <div className={styles.footerSub}>
          Este documento digital tiene validez oficial. Verificado vía QR-Manager
          GAMS.
        </div>
      </footer>
    </div>
  );
}
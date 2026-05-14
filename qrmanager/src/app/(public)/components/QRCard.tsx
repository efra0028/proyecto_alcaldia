"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import "../styles/qrcard.css";

// ── Props ──────────────────────────────────────────────────────────────────
interface QRCardProps {
  uuid: string;
  titular: string;
  servicio: string;
  fechaVencimiento: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-BO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Componente ─────────────────────────────────────────────────────────────
export default function QRCard({
  uuid,
  titular,
  servicio,
  fechaVencimiento,
}: QRCardProps) {
  const svgRef = useRef<HTMLDivElement>(null);
  const url = `${BASE_URL}/resultado/${uuid}`;

  // Descarga el QR como PNG usando canvas
  function handleDescargar() {
    const svgEl = svgRef.current?.querySelector("svg");
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const SIZE = 400;
    canvas.width = SIZE;
    canvas.height = SIZE;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fondo blanco (necesario para que el PNG no quede transparente)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);

    const img = new Image();
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const blobURL = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      URL.revokeObjectURL(blobURL);

      const link = document.createElement("a");
      link.download = `QR-${servicio.replace(/\s+/g, "-")}-${uuid.slice(0, 8)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = blobURL;
  }

  return (
    <div className="qrcard">
      {/* Encabezado */}
      <div className="qrcard-header">
        <span className="qrcard-eyebrow">GAMS · QR Oficial</span>
        <h2 className="qrcard-servicio">{servicio}</h2>
        <p className="qrcard-titular">{titular}</p>
      </div>

      {/* QR */}
      <div className="qrcard-qr" ref={svgRef}>
        <QRCodeSVG
          value={url}
          size={200}
          level="H"
          marginSize={2}
          // Logo GAMS en el centro del QR
          imageSettings={{
            src: "/logo-gams.png", // pon tu logo aquí, o quita este bloque
            height: 36,
            width: 36,
            excavate: true,
          }}
        />
      </div>

      {/* Info bajo el QR */}
      <div className="qrcard-meta">
        <div className="qrcard-meta-fila">
          <span>Vence</span>
          <strong>{formatFecha(fechaVencimiento)}</strong>
        </div>
        <div className="qrcard-meta-fila">
          <span>ID</span>
          <code>{uuid.slice(0, 13)}…</code>
        </div>
      </div>

      {/* Acciones */}
      <div className="qrcard-actions">
        <button className="qrcard-btn qrcard-btn--secondary" onClick={() => navigator.clipboard.writeText(url)}>
          Copiar enlace
        </button>
        <button className="qrcard-btn qrcard-btn--primary" onClick={handleDescargar}>
          Descargar QR
        </button>
      </div>

      {/* URL visible */}
      <p className="qrcard-url">{url}</p>
    </div>
  );
}
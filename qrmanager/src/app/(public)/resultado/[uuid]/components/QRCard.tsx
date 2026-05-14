// src/app/resultado/[uuid]/components/QRCard.tsx
"use client";

import styles from "./QRCard.module.css";
import { ScanResponse, Resultado, ResultConfig } from "../types";

/* ─────────────────────────────────────────
   CONFIG POR RESULTADO
───────────────────────────────────────── */
const RESULT_CONFIG: Record<Resultado, ResultConfig> = {
  VALIDO: {
    icon: "✅",
    label: "QR Válido",
    headerBg: "linear-gradient(135deg,#14532D 0%,#16A34A 100%)",
    bodyBg: "rgba(22,163,74,.08)",
    borderColor: "#86EFAC",
    badgeText: "Escaneo registrado ✓",
    scanBg: "rgba(22,163,74,.12)",
  },
  VENCIDO: {
    icon: "⏰",
    label: "QR Inválido — Vencido",
    headerBg: "linear-gradient(135deg,#7F1D1D 0%,#DC2626 100%)",
    bodyBg: "rgba(220,38,38,.06)",
    borderColor: "#FCA5A5",
    badgeText: "Acceso denegado ✗",
    scanBg: "rgba(220,38,38,.1)",
  },
  SUSPENDIDO: {
    icon: "🚫",
    label: "QR Suspendido",
    headerBg: "linear-gradient(135deg,#78350F 0%,#D97706 100%)",
    bodyBg: "rgba(217,119,6,.06)",
    borderColor: "#FCD34D",
    badgeText: "Acceso denegado ✗",
    scanBg: "rgba(217,119,6,.1)",
  },
  NO_ENCONTRADO: {
    icon: "⚠️",
    label: "QR No Registrado",
    headerBg: "linear-gradient(135deg,#1e293b 0%,#475569 100%)",
    bodyBg: "rgba(71,85,105,.06)",
    borderColor: "#94A3B8",
    badgeText: "No encontrado ✗",
    scanBg: "rgba(71,85,105,.1)",
  },
};

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function diasRestantes(fechaStr: string): number {
  const hoy = new Date();
  const vence = new Date(fechaStr);
  return Math.ceil((vence.getTime() - hoy.getTime()) / 86_400_000);
}

function formatFecha(fechaStr: string): string {
  if (!fechaStr) return "—";
  return new Date(fechaStr).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function nowStr(): string {
  const d = new Date();
  return (
    d.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" }) +
    " · " +
    d.toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" })
  );
}

/* ─────────────────────────────────────────
   SUBCOMPONENTES
───────────────────────────────────────── */

function VigenciaBar({
  dias,
  vencimiento,
  resultado,
}: {
  dias: number;
  vencimiento: string;
  resultado: Resultado;
}) {
  const isExpired = resultado === "VENCIDO" || dias < 0;
  const isWarn = !isExpired && dias <= 30;

  const color = isExpired ? "#DC2626" : isWarn ? "#D97706" : "#16A34A";
  const bg = isExpired ? "#FEE2E2" : isWarn ? "#FEF3C7" : "#DCFCE7";
  const border = isExpired ? "#FCA5A5" : isWarn ? "#FCD34D" : "#86EFAC";

  return (
    <div className={styles.vigRow} style={{ background: bg, border: `1px solid ${border}` }}>
      <span style={{ fontSize: 18 }}>{isExpired ? "❌" : isWarn ? "⚠️" : "📅"}</span>
      <div style={{ flex: 1 }}>
        <div className={styles.vigTitle} style={{ color }}>
          {isExpired
            ? `Venció el ${formatFecha(vencimiento)}`
            : `Vence: ${formatFecha(vencimiento)}`}
        </div>
        <div className={styles.vigSub}>
          {isExpired
            ? `Expirado hace ${Math.abs(dias)} días`
            : isWarn
            ? `⚠ Solo quedan ${dias} días`
            : `${dias} días restantes`}
        </div>
      </div>
    </div>
  );
}

function BlockedBody({ data }: { data: ScanResponse }) {
  const messages: Record<Resultado, { icon: string; title: string; desc: string }> = {
    VALIDO: { icon: "", title: "", desc: "" },
    VENCIDO: {
      icon: "⏰",
      title: "Permiso Vencido",
      desc: "La habilitación de este registro ha vencido. El titular debe renovar su permiso ante la oficina correspondiente.",
    },
    SUSPENDIDO: {
      icon: "🚫",
      title: "Permiso Suspendido",
      desc: data.registro.motivo_suspension ??
        "Este permiso fue suspendido manualmente por un funcionario del GAMS. Contacte con la oficina emisora.",
    },
    NO_ENCONTRADO: {
      icon: "🔴",
      title: "Código QR Falsificado o Inválido",
      desc: "Este código QR no existe en la base de datos del QR-Manager del GAMS. Podría tratarse de un documento falsificado. Retenga el documento y reporte a la autoridad.",
    },
  };
  const m = messages[data.resultado];

  return (
    <div className={styles.blockedBody}>
      <div className={styles.blockedIcon}>{m.icon}</div>
      <div className={styles.blockedTitle} style={{ color: data.estado.color_hex }}>
        {m.title}
      </div>
      <div className={styles.blockedDesc}>{m.desc}</div>
      {data.registro.suspendido_por && (
        <div className={styles.blockedExtra}>
          Suspendido por: <strong>{data.registro.suspendido_por}</strong>
        </div>
      )}
      <div
        className={styles.errorCode}
        style={{
          color: data.estado.color_hex,
          borderColor: data.estado.color_hex + "55",
          background: data.estado.color_hex + "11",
        }}
      >
        CÓDIGO: QR_{data.resultado}
      </div>
      <div className={styles.auditNote}>
        Este intento de acceso ha sido registrado con fecha, hora e IP del dispositivo.
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────── */
export function QRCard({ data }: { data: ScanResponse }) {
  const cfg = RESULT_CONFIG[data.resultado];
  const isValid = data.resultado === "VALIDO";
  const isBlocked = data.estado.bloquea_qr;
  const entries = Object.entries(data.registro.datos_display);
  const dias = diasRestantes(data.registro.fecha_vencimiento);

  // Encontrar el nombre del titular
  const titularEntry = entries.find(
    ([k]) =>
      k.toLowerCase().includes("titular") ||
      k.toLowerCase().includes("nombre") ||
      k.toLowerCase().includes("conductor")
  );
  const titularName = titularEntry?.[1] ?? "—";
  const titularInitial = titularName !== "—" ? titularName[0].toUpperCase() : "?";

  // Filtrar entradas que no son del titular
  const otherEntries = entries.filter(
    ([k]) =>
      !k.toLowerCase().includes("titular") &&
      !k.toLowerCase().includes("nombre") &&
      !k.toLowerCase().includes("conductor")
  );

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader} style={{ background: cfg.headerBg }}>
        <div className={styles.headerIcon}>{cfg.icon}</div>
        <div className={styles.headerText}>
          <div className={styles.headerTitle}>{cfg.label}</div>
          <div className={styles.headerSub}>
            {isValid
              ? `Habilitación vigente · ${data.sistema.nombre}`
              : isBlocked
              ? `Acceso bloqueado · ${data.sistema.nombre}`
              : data.sistema.nombre}
          </div>
        </div>
        <div className={styles.headerTimestamp}>
          <div>{nowStr()}</div>
          {data.scan.numero > 0 && (
            <div style={{ marginTop: 2 }}>Escaneo #{data.scan.numero}</div>
          )}
        </div>
      </div>

      {/* System banner */}
      <div className={styles.systemBanner} style={{ background: cfg.scanBg }}>
        <div
          className={styles.systemIconBox}
          style={{ background: data.sistema.color_hex + "33" }}
        >
          {data.sistema.logo_url ? (
            <img src={data.sistema.logo_url} alt="" style={{ width: 18, height: 18 }} />
          ) : (
            <span style={{ fontSize: 15 }}>🏛</span>
          )}
        </div>
        <div>
          <div className={styles.systemName}>{data.sistema.nombre}</div>
          <div className={styles.systemSub}>{data.sistema.descripcion}</div>
        </div>
        <div className={styles.systemBadge}>{cfg.badgeText}</div>
      </div>

      {/* Body - Valid or Expired */}
      {isValid || data.resultado === "VENCIDO" ? (
        <div className={styles.cardBody}>
          {/* Titular section */}
          {entries.length > 0 && (
            <div className={styles.titularRow}>
              <div
                className={styles.titularAvatar}
                style={{ borderColor: cfg.borderColor }}
              >
                {titularInitial}
              </div>
              <div>
                <div className={styles.titularName}>{titularName}</div>
                <div className={styles.titularRole}>{data.sistema.nombre}</div>
              </div>
            </div>
          )}

          {/* Data grid */}
          {otherEntries.length > 0 && (
            <div className={styles.dataGrid}>
              {otherEntries.map(([label, value]) => (
                <div key={label} className={styles.dataCell}>
                  <div className={styles.dataCellLabel}>{label.toUpperCase()}</div>
                  <div className={styles.dataCellValue}>{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Vigencia bar */}
          <VigenciaBar
            dias={dias}
            vencimiento={data.registro.fecha_vencimiento}
            resultado={data.resultado}
          />

          {/* UUID */}
          <div className={styles.uuidBox}>
            <div className={styles.uuidLabel}>UUID DE VERIFICACIÓN</div>
            <div className={styles.uuidValue}>{data.uuid}</div>
          </div>
        </div>
      ) : (
        <BlockedBody data={data} />
      )}
    </div>
  );
}
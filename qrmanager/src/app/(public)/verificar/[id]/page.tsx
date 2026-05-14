"use client";

/**
 * src/app/verificar/[id]/page.tsx
 *
 * Página de verificación QR para FUNCIONARIOS del GAMS.
 * Se accede al escanear un QR desde un dispositivo en campo.
 *
 * Consume: GET /api/verify/[id]
 * Respuesta esperada:
 * {
 *   resultado: "VALIDO" | "VENCIDO" | "SUSPENDIDO" | "NO_ENCONTRADO"
 *   sistema: {
 *     id: string, nombre: string, dependencia: string,
 *     color_hex: string,   // desde tabla `sistemas`
 *     logo_url?: string,   // desde tabla `sistemas`
 *     icon: string
 *   }
 *   registro: {
 *     titular: string
 *     rol: string
 *     datos_display: Record<string, string>  // JSONB — campos dinámicos
 *     campo_acento?: string                  // qué campo destacar en color
 *     fecha_inicio: string
 *     fecha_vencimiento: string
 *     suspendido_por?: string
 *     motivo_suspension?: string
 *   }
 *   scan: { numero: number; uuid: string }
 * }
 */

import { useState, useEffect, useCallback, use } from "react"; // ← agregado `use`

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type Resultado = "VALIDO" | "VENCIDO" | "SUSPENDIDO" | "NO_ENCONTRADO";

interface SistemaInfo {
  id: string;
  nombre: string;
  dependencia: string;
  color_hex: string;
  logo_url?: string;
  icon: string;
}

interface RegistroInfo {
  titular: string;
  rol: string;
  datos_display: Record<string, string>;
  campo_acento?: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  suspendido_por?: string;
  motivo_suspension?: string;
}

interface VerifyResponse {
  resultado: Resultado;
  sistema: SistemaInfo;
  registro: RegistroInfo;
  scan: { numero: number; uuid: string };
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function diasRestantes(fechaStr: string): number {
  return Math.ceil((new Date(fechaStr).getTime() - Date.now()) / 86_400_000);
}

function formatFecha(fechaStr: string): string {
  if (!fechaStr) return "—";
  return new Date(fechaStr).toLocaleDateString("es-BO", {
    day: "2-digit", month: "long", year: "numeric",
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

/** Genera gradiente oscuro→color para el header del sistema */
function sysGradient(color: string, dark: string) {
  return `linear-gradient(135deg, ${dark}ee, ${color}dd)`;
}

/** Versión oscura de un color hex (simplificada — en prod usar tinycolor2) */
function darken(hex: string): string {
  const map: Record<string, string> = {
    "#EAB308": "#854D0E",
    "#3B82F6": "#1E3A8A",
    "#8B5CF6": "#4C1D95",
    "#10B981": "#064E3B",
    "#EC4899": "#831843",
    "#C0392B": "#7F1D1D",
    "#D97706": "#78350F",
    "#16A34A": "#14532D",
  };
  return map[hex] ?? "#1e293b";
}

/* ─────────────────────────────────────────
   VIGENCIA BAR - VERSIÓN CORREGIDA
───────────────────────────────────────── */
function VigenciaBar({ reg }: { reg: RegistroInfo }) {
  // Estado para almacenar los valores calculados que dependen de la fecha actual
  const [dias, setDias] = useState<number>(0);
  const [pct, setPct] = useState<number>(0);
  const [cls, setCls] = useState<"ok" | "warn" | "expired">("ok");

  // useEffect para calcular valores que dependen de Date.now()
  useEffect(() => {
    const calcularVigencia = () => {
      const ahora = Date.now();
      const fechaFin = new Date(reg.fecha_vencimiento).getTime();
      const fechaInicio = new Date(reg.fecha_inicio).getTime();
      
      const diasRestantesCalc = Math.ceil((fechaFin - ahora) / 86_400_000);
      const nuevaCls = diasRestantesCalc < 0 ? "expired" : diasRestantesCalc <= 30 ? "warn" : "ok";
      
      const total = fechaFin - fechaInicio;
      const transcurrido = ahora - fechaInicio;
      const porcentaje = Math.min(100, Math.max(0, (transcurrido / total) * 100));
      
      setDias(diasRestantesCalc);
      setCls(nuevaCls);
      setPct(porcentaje);
    };
    
    calcularVigencia();
    
    // Opcional: actualizar cada minuto si la página queda abierta
    const interval = setInterval(calcularVigencia, 60000);
    return () => clearInterval(interval);
  }, [reg.fecha_vencimiento, reg.fecha_inicio]);

  const barColor = cls === "ok" ? "#4ade80" : cls === "warn" ? "#fbbf24" : "#f87171";

  const containerStyle: Record<string, Record<string, string>> = {
    ok:      { background: "#f0fdf4", border: "1.5px solid #86efac" },
    warn:    { background: "#fffbeb", border: "1.5px solid #fcd34d" },
    expired: { background: "#fef2f2", border: "1.5px solid #fca5a5" },
  };
  const textColor = { ok: "#15803d", warn: "#b45309", expired: "#dc2626" };

  return (
    <div style={{ padding: "0 22px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, ...containerStyle[cls] }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>
          {dias < 0 ? "❌" : dias <= 14 ? "⚠️" : "📅"}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: textColor[cls] }}>
            {dias < 0 ? `Venció el ${formatFecha(reg.fecha_vencimiento)}` : `Vence: ${formatFecha(reg.fecha_vencimiento)}`}
          </div>
          <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 2 }}>
            {dias < 0
              ? `Expirado hace ${Math.abs(dias)} días`
              : dias === 0 ? "Vence hoy"
              : dias <= 30 ? `⚠ Quedan ${dias} días`
              : `${dias} días restantes`}
          </div>
          <div style={{ height: 4, background: "#e2e8f0", borderRadius: 4, overflow: "hidden", marginTop: 6 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 4, transition: "width .6s ease" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   VALID CARD
───────────────────────────────────────── */
function ValidCard({ data }: { data: VerifyResponse }) {
  const { sistema: sys, registro: reg, scan } = data;
  const dark = darken(sys.color_hex);
  const entries = Object.entries(reg.datos_display);

  return (
    <>
      {/* Color stripe */}
      <div style={{ height: 5, background: sys.color_hex, transition: "background .4s" }} />

      {/* System header */}
      <div style={{ padding: "18px 22px 16px", display: "flex", alignItems: "center", gap: 13, background: sysGradient(sys.color_hex, dark), borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, position: "relative" }}>
          {sys.logo_url ? <img src={sys.logo_url} alt="" style={{ position: "absolute", inset: 6, objectFit: "contain", borderRadius: 4 }} /> : sys.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{sys.nombre}</div>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.55)", marginTop: 2 }}>{sys.dependencia}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,.9)", lineHeight: 1 }}>#{scan.numero}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 1 }}>Escaneo</div>
        </div>
      </div>

      {/* Status banner */}
      <div style={{ padding: "16px 22px", display: "flex", alignItems: "center", gap: 14, background: sysGradient(sys.color_hex, dark) }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>✅</div>
        <div style={{ flex: 1, color: "#fff" }}>
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, letterSpacing: "-.02em" }}>QR Válido</div>
          <div style={{ fontSize: 11, opacity: .7, marginTop: 5 }}>Habilitación vigente y activa</div>
        </div>
        <div style={{ textAlign: "right", color: "rgba(255,255,255,.5)", fontSize: 10, lineHeight: 1.5 }}>
          {nowStr()}<br />Verificado ✓
        </div>
      </div>

      {/* Body */}
      <div style={{ background: "#fff" }}>
        {/* Titular */}
        <div style={{ padding: "20px 22px 18px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid #f1f5f9", marginBottom: 16 }}>
          <div style={{ width: 62, height: 62, borderRadius: "50%", background: `linear-gradient(135deg,${dark},${sys.color_hex})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "#fff", flexShrink: 0, boxShadow: "0 4px 14px rgba(0,0,0,.18)" }}>
            {reg.titular[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", lineHeight: 1.15, letterSpacing: "-.02em" }}>{reg.titular}</div>
            <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 4 }}>{reg.rol}</div>
          </div>
        </div>

        {/* Data grid */}
        <div style={{ padding: "0 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            {entries.map(([label, value]) => {
              const isAccent = label === reg.campo_acento;
              return (
                <div key={label} style={{ background: isAccent ? `${sys.color_hex}18` : "#f8fafc", border: `1px solid ${isAccent ? sys.color_hex : "#e2e8f0"}`, borderRadius: 14, padding: "10px 12px" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isAccent ? darken(sys.color_hex) : "#0f172a" }}>{value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vigencia */}
        <VigenciaBar reg={reg} />

        {/* UUID */}
        <div style={{ margin: "0 22px 20px", background: "#0f172a", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, opacity: .4 }}>🔐</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 2 }}>UUID de verificación</div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,.5)", letterSpacing: ".04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{scan.uuid}</div>
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(scan.uuid)}
            style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.5)", borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
          >Copiar</button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: "14px 22px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "#fff", borderTop: "1px solid #f1f5f9" }}>
        <button style={{ padding: "11px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", background: sys.color_hex, color: "#fff", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          📋 Ver historial
        </button>
        <button style={{ padding: "11px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "1.5px solid #e2e8f0", background: "transparent", color: "#475569", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          🖨 Imprimir
        </button>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   BLOCKED CARD
───────────────────────────────────────── */
function BlockedCard({ data }: { data: VerifyResponse }) {
  const { sistema: sys, registro: reg, scan, resultado } = data;

  const cfg = {
    VENCIDO:       { stripe: "#dc2626", hbg: "linear-gradient(135deg,#7F1D1D,#DC2626)", icon: "⏰", label: "QR Inválido",   sub: "Permiso vencido — acceso bloqueado", bodyIcon: "⏰", bodyTitle: "Permiso Vencido",            bodyColor: "#dc2626", desc: `La habilitación de este registro venció el <strong>${formatFecha(reg.fecha_vencimiento)}</strong>.` },
    SUSPENDIDO:    { stripe: "#d97706", hbg: "linear-gradient(135deg,#78350F,#D97706)", icon: "⊘", label: "QR Suspendido", sub: "Suspendido por autoridad",           bodyIcon: "🚫", bodyTitle: "Permiso Suspendido",          bodyColor: "#d97706", desc: reg.motivo_suspension ?? "Este permiso fue suspendido manualmente por un funcionario del GAMS." },
    NO_ENCONTRADO: { stripe: "#6b7280", hbg: "linear-gradient(135deg,#1e293b,#475569)", icon: "⚠️", label: "No Registrado", sub: "Código no encontrado",               bodyIcon: "🔴", bodyTitle: "Posible Falsificación",       bodyColor: "#dc2626", desc: "Este código QR <strong>no existe</strong> en la base de datos del QR-Manager GAMS." },
    VALIDO: { stripe: "#16a34a", hbg: "", icon: "", label: "", sub: "", bodyIcon: "", bodyTitle: "", bodyColor: "", desc: "" },
  }[resultado];

  return (
    <>
      <div style={{ height: 5, background: cfg.stripe }} />
      <div style={{ padding: "18px 22px 16px", display: "flex", alignItems: "center", gap: 13, background: cfg.hbg, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
          {sys.logo_url ? <img src={sys.logo_url} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} /> : sys.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{sys.nombre}</div>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.55)", marginTop: 2 }}>{sys.dependencia}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,.9)", lineHeight: 1 }}>#{scan.numero}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 1 }}>Escaneo</div>
        </div>
      </div>
      <div style={{ padding: "16px 22px", display: "flex", alignItems: "center", gap: 14, background: cfg.hbg }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{cfg.icon}</div>
        <div style={{ flex: 1, color: "#fff" }}>
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, letterSpacing: "-.02em" }}>{cfg.label}</div>
          <div style={{ fontSize: 11, opacity: .7, marginTop: 5 }}>{cfg.sub}</div>
        </div>
        <div style={{ textAlign: "right", color: "rgba(255,255,255,.5)", fontSize: 10, lineHeight: 1.5 }}>{nowStr()}<br />Denegado ✗</div>
      </div>

      {/* Body */}
      <div style={{ background: "#fff", padding: "36px 24px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 60, marginBottom: 14, lineHeight: 1 }}>{cfg.bodyIcon}</div>
        <div style={{ fontSize: 21, fontWeight: 900, marginBottom: 10, letterSpacing: "-.02em", color: cfg.bodyColor }}>{cfg.bodyTitle}</div>
        <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: cfg.desc }} />

        {reg.suspendido_por && (
          <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "12px 16px", fontSize: 11.5, color: "#92400e", textAlign: "left", marginBottom: 16 }}>
            <strong style={{ display: "block", marginBottom: 4, fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", opacity: .6 }}>Suspendido por</strong>
            {reg.suspendido_por}
            {reg.motivo_suspension && (<><br /><br /><strong style={{ display: "block", marginBottom: 4, fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", opacity: .6 }}>Motivo</strong>{reg.motivo_suspension}</>)}
          </div>
        )}

        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: `1px solid ${cfg.bodyColor}44`, background: `${cfg.bodyColor}0e`, fontSize: 11, fontWeight: 700, fontFamily: "monospace", marginBottom: 12, color: cfg.bodyColor }}>
          🔒 CÓDIGO: QR_{resultado}
        </div>
        <div style={{ fontSize: 10.5, color: "#94a3b8", lineHeight: 1.6 }}>
          Este intento de acceso ha sido registrado<br />con fecha, hora e IP del dispositivo escaneante.
        </div>
      </div>

      <div style={{ padding: "14px 22px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "#fff", borderTop: "1px solid #f1f5f9" }}>
        <button style={{ padding: "11px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", background: cfg.bodyColor, color: "#fff", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          📞 Reportar
        </button>
        <button style={{ padding: "11px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "1.5px solid #e2e8f0", background: "transparent", color: "#475569", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          ← Volver
        </button>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   SKELETON
───────────────────────────────────────── */
function Skeleton() {
  const bar = (h: number, w = "100%", r = 8) => (
    <div style={{ height: h, width: w, borderRadius: r, background: "linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.3s infinite" }} />
  );
  return (
    <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 32px 96px rgba(0,0,0,.55)" }}>
      {bar(5, "100%", 0)}
      {bar(74, "100%", 0)}
      {bar(88, "100%", 0)}
      <div style={{ background: "#fff", padding: "22px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 62, height: 62, borderRadius: "50%", flexShrink: 0, background: "#e2e8f0" }} />
          <div style={{ flex: 1 }}>
            {bar(18, "80%")}
            <div style={{ marginTop: 8 }}>{bar(12, "55%")}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 58, borderRadius: 12, background: "#e2e8f0" }} />)}
        </div>
        {bar(64, "100%", 12)}
        <div style={{ marginTop: 14 }}>{bar(40, "100%", 10)}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────── */
export default function VerificarPage({ params }: { params: Promise<{ id: string }> }) {
  // ↑ CAMBIO 1: params tipado como Promise<{ id: string }>

  const { id } = use(params);
  // ↑ CAMBIO 2: desenvolver la Promise con use() antes de cualquier hook

  const [data, setData] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/verify/${id}`);
      if (!res.ok) throw new Error();
      const json: VerifyResponse = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const sysColor = data?.sistema.color_hex ?? "#C0392B";
  const sysDark  = data ? darken(data.sistema.color_hex) : "#7F1D1D";

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: "#0f172a", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 16px 40px", position: "relative", WebkitFontSmoothing: "antialiased" }}>

      {/* BG glow — cambia de color según sistema */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(ellipse 700px 500px at 50% -100px, ${sysColor}20 0%, ${sysDark}08 50%, transparent 75%)`, transition: "background .5s ease" }} />

      {/* GAMS logo bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, position: "relative", zIndex: 1 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${sysDark},${sysColor})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 16px rgba(0,0,0,.3)", flexShrink: 0, transition: "background .4s" }}>
          {data?.sistema.icon ?? "🏛"}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#e2e8f0", letterSpacing: "-.01em" }}>
            {data ? data.sistema.nombre : "QR-Manager · GAMS"}
          </div>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>
            Gobierno Autónomo Municipal de Sucre
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 400, borderRadius: 20, overflow: "hidden", boxShadow: "0 32px 96px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.06)", position: "relative", zIndex: 1 }}>
        {loading ? (
          <Skeleton />
        ) : error ? (
          <div style={{ background: "#fff", padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#dc2626", marginBottom: 8 }}>Error de conexión</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>No se pudo conectar con el servidor del GAMS.</div>
            <button onClick={fetchData} style={{ padding: "10px 24px", background: "#C0392B", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Reintentar
            </button>
          </div>
        ) : data?.resultado === "VALIDO" ? (
          <ValidCard data={data} />
        ) : (
          <BlockedCard data={data!} />
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 20, textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 10, color: "#1e293b", fontWeight: 600 }}>
          © {new Date().getFullYear()} Gobierno Autónomo Municipal de Sucre
        </div>
        <div style={{ fontSize: 9, color: "#0f172a", marginTop: 3 }}>
          Verificado oficialmente · QR-Manager GAMS
        </div>
      </div>

      {/* Keyframes (pegar en globals.css) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </div>
  );
}
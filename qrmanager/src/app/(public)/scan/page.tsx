"use client";
import Link from "next/link";
import { useQrScanner } from "./hooks/useQrScanner";
import type { QrRegistro } from "./types/scanner.types";
import styles from "./scan.module.css";

/* ─── helpers ─────────────────────────────────────────────── */

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function estadoBadge(estadoId: number, nombre?: string) {
  const label = nombre ?? (estadoId === 1 ? "Activo" : estadoId === 2 ? "Inactivo" : "Pendiente");
  const cls =
    estadoId === 1 ? styles["badge active"] ?? `${styles.badge} ${styles.active}`
    : estadoId === 2 ? styles["badge inactive"] ?? `${styles.badge} ${styles.inactive}`
    : `${styles.badge} ${styles.pending}`;

  const dot =
    estadoId === 1 ? "●" : estadoId === 2 ? "●" : "●";

  return (
    <span
      className={styles.badge}
      style={{
        background: estadoId === 1 ? "#EDFAF3" : estadoId === 2 ? "#FBEAE9" : "#FFF8E6",
        color: estadoId === 1 ? "#1A8A4A" : estadoId === 2 ? "#BE2D26" : "#B07A00",
      }}
    >
      {dot} {label}
    </span>
  );
}

/* ─── sub-components ──────────────────────────────────────── */

function IdleView({ onStart }: { onStart: () => void }) {
  return (
    <div className={styles.idleBody}>
      <div className={styles.iconRing}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#BE2D26" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <path d="M14 14h2v2h-2zM18 14h3M18 18v3M14 18h1M17 21h4"/>
        </svg>
      </div>
      <div>
        <p className={styles.idleTitle}>Verificar código QR</p>
        <p className={styles.idleText} style={{ marginTop: 6 }}>
          Apunta la cámara al código QR del documento o credencial que deseas verificar.
        </p>
      </div>
      <button className={styles.btnPrimary} onClick={onStart}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        Abrir cámara
      </button>
    </div>
  );
}

function ScanningView({
  videoRef,
  canvasRef,
  onStop,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onStop: () => void;
}) {
  return (
    <>
      <div className={styles.viewfinder}>
        <video
          ref={videoRef}
          className={styles.video}
          playsInline
          muted
          autoPlay
        />
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.corners}>
          <span className={`${styles.corner} ${styles.tl}`} />
          <span className={`${styles.corner} ${styles.tr}`} />
          <span className={`${styles.corner} ${styles.bl}`} />
          <span className={`${styles.corner} ${styles.br}`} />
          <div className={styles.laser} />
        </div>
      </div>
      <div className={styles.viewfinderBar}>
        <span className={styles.scanningLabel}>
          <span className={styles.dot} />
          Buscando código QR…
        </span>
        <button className={styles.btnSecondary} onClick={onStop}>
          Cancelar
        </button>
      </div>
    </>
  );
}

function LoadingView() {
  return (
    <div className={styles.loadingBody}>
      <div className={styles.spinner} />
      <p className={styles.loadingText}>Verificando en el sistema…</p>
    </div>
  );
}

function SuccessView({
  registro,
  onReiniciar,
}: {
  registro: QrRegistro;
  onReiniciar: () => void;
}) {
  return (
    <div className={styles.resultBody}>
      <div className={styles.resultHeader}>
        <div className={`${styles.resultIcon} ${styles.success}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A8A4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <div>
          <p className={styles.resultTitle}>Registro encontrado</p>
          <p className={styles.resultSub}>Verificación completada correctamente</p>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Referencia</span>
          <span className={styles.infoVal}>{registro.referencia_externa}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Sistema</span>
          <span className={styles.infoVal}>{registro.sistema_id}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Desde</span>
          <span className={styles.infoVal}>{formatFecha(registro.fecha_inicio)}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Vence</span>
          <span className={styles.infoVal}>{formatFecha(registro.fecha_vencimiento)}</span>
        </div>
        {/* Extra fields from datos_display */}
        {Object.entries(registro.datos_display ?? {}).map(([k, v]) => (
          <div key={k} className={styles.infoRow}>
            <span className={styles.infoLabel}>{k}</span>
            <span className={styles.infoVal}>{v}</span>
          </div>
        ))}
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Estado</span>
          {estadoBadge(registro.estado_id, registro.estado_nombre)}
        </div>
      </div>

      <div className={styles.actionsRow}>
        <button className={styles.btnPrimary} onClick={onReiniciar}>
          Escanear otro
        </button>
        <Link href="/" className={styles.btnSecondary} style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
          Inicio
        </Link>
      </div>
    </div>
  );
}

function NotFoundView({ msg, onReiniciar }: { msg: string; onReiniciar: () => void }) {
  return (
    <div className={styles.notFoundBody}>
      <div className={styles.notFoundIcon} style={{ background: "#FFF8E6" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B07A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <p className={styles.resultTitle}>QR no registrado</p>
      <p className={styles.notFoundMsg}>{msg}</p>
      <button className={styles.btnPrimary} onClick={onReiniciar}>
        Intentar nuevamente
      </button>
    </div>
  );
}

function ErrorView({ msg, onReiniciar }: { msg: string; onReiniciar: () => void }) {
  return (
    <div className={styles.notFoundBody}>
      <div className={styles.notFoundIcon} style={{ background: "#FBEAE9" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#BE2D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <p className={styles.resultTitle}>Error al verificar</p>
      <p className={styles.notFoundMsg}>{msg}</p>
      <button className={styles.btnPrimary} onClick={onReiniciar}>
        Reintentar
      </button>
    </div>
  );
}

/* ─── page ────────────────────────────────────────────────── */

export default function ScanPage() {
  const {
    estado,
    resultado,
    errorMsg,
    iniciarEscaneo,
    detener,
    reiniciar,
    videoRef,
    canvasRef,
  } = useQrScanner();

  return (
    <main className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <p className={styles.eyebrow}>Verificación municipal</p>
        <h1 className={styles.title}>Escanear código QR</h1>
        <p className={styles.subtitle}>
          Verifica la autenticidad de documentos y credenciales emitidos por el GAMS.
        </p>
      </div>

      {/* Card */}
      <div className={styles.card}>
        {estado === "idle" && <IdleView onStart={iniciarEscaneo} />}
        {estado === "scanning" && (
          <ScanningView videoRef={videoRef} canvasRef={canvasRef} onStop={detener} />
        )}
        {estado === "loading" && <LoadingView />}
        {estado === "success" && resultado?.registro && (
          <SuccessView registro={resultado.registro} onReiniciar={reiniciar} />
        )}
        {estado === "not_found" && (
          <NotFoundView msg={resultado?.mensaje ?? "QR no encontrado."} onReiniciar={reiniciar} />
        )}
        {estado === "error" && (
          <ErrorView msg={errorMsg ?? "Error desconocido."} onReiniciar={reiniciar} />
        )}
      </div>

      <p className={styles.tip}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Asegúrate de dar permiso de cámara al navegador cuando se solicite.
      </p>
    </main>
  );
}

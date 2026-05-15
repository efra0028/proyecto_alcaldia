'use client'

import { useEscaneos } from './hooks/useEscaneos'
import type { EscaneoEntry } from './types'
import { RESULTADOS } from './types'
import styles from './page.module.css'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatFecha(iso: string) {
  try {
    return new Date(iso).toLocaleString('es-BO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

const RESULTADO_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  VALIDO:    { label: 'Válido',    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '✓' },
  BLOQUEADO: { label: 'Bloqueado', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', icon: '✕' },
  VENCIDO:   { label: 'Vencido',   color: '#b45309', bg: '#fffbeb', border: '#fde68a', icon: '⏱' },
  EXPIRADO:  { label: 'Expirado',  color: '#6b21a8', bg: '#faf5ff', border: '#e9d5ff', icon: '⌛' },
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function StatCard({
  label, value, accent, icon,
}: { label: string; value: number; accent?: string; icon: string }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statValue} style={accent ? { color: accent } : {}}>
        {value.toLocaleString('es-BO')}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

function ResultadoBadge({ resultado }: { resultado: EscaneoEntry['resultado'] }) {
  const cfg = RESULTADO_CONFIG[resultado] ?? RESULTADO_CONFIG['VALIDO']
  return (
    <span
      className={styles.resultadoBadge}
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      <span className={styles.badgeIcon}>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function EscaneosPage() {
  const {
    entradas,
    totalSinFiltro,
    cargando,
    error,
    estadisticas,
    filtros,
    setFiltro,
    seleccionado,
    setSeleccionado,
    recargar,
  } = useEscaneos()

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>Administración › Escaneos</div>
          <h1 className={styles.title}>Registro de escaneos</h1>
          <p className={styles.subtitle}>
            Historial automático de todos los escaneos QR del sistema. Solo lectura.
          </p>
        </div>
        <button className={styles.btnRecargar} onClick={recargar} disabled={cargando}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M8 16H3v5"/>
          </svg>
          Recargar
        </button>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsRow}>
        <StatCard label="Total escaneos" value={estadisticas.total}      icon="📊" />
        <StatCard label="Válidos"         value={estadisticas.validos}    icon="✅" accent="#16a34a" />
        <StatCard label="Bloqueados"      value={estadisticas.bloqueados} icon="🚫" accent="#b91c1c" />
        <StatCard label="Vencidos"        value={estadisticas.vencidos}   icon="⏱️" accent="#b45309" />
      </div>

      {/* ── Filtros ── */}
      <div className={styles.filtersBar}>
        <div className={styles.filtersLeft}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Buscar por IP, dispositivo, QR…"
              value={filtros.busqueda}
              onChange={e => setFiltro('busqueda', e.target.value)}
            />
          </div>

          <select
            className={styles.select}
            value={filtros.resultado}
            onChange={e => setFiltro('resultado', e.target.value)}
          >
            {RESULTADOS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <span className={styles.contador}>
          {entradas.length !== totalSinFiltro
            ? <><strong>{entradas.length}</strong> de {totalSinFiltro}</>
            : <><strong>{entradas.length}</strong> escaneos</>}
        </span>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠ {error}</span>
          <button onClick={recargar}>Reintentar</button>
        </div>
      )}

      {/* ── Tabla ── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>#</th>
              <th className={styles.th}>Resultado</th>
              <th className={styles.th}>QR</th>
              <th className={styles.th}>IP</th>
              <th className={styles.th}>Dispositivo</th>
              <th className={styles.th}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className={styles.td}>
                      <div className={styles.skeleton} style={{ width: j === 0 ? 32 : 80 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : entradas.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  <div className={styles.emptyIcon}>📭</div>
                  <p>Sin escaneos{filtros.resultado || filtros.busqueda ? ' con estos filtros' : ''}.</p>
                </td>
              </tr>
            ) : (
              entradas.map(e => (
                <tr
                  key={e.id}
                  className={`${styles.row} ${seleccionado?.id === e.id ? styles.rowSelected : ''}`}
                  onClick={() => setSeleccionado(seleccionado?.id === e.id ? null : e)}
                >
                  <td className={`${styles.td} ${styles.tdMuted}`}>{e.id}</td>
                  <td className={styles.td}>
                    <ResultadoBadge resultado={e.resultado} />
                  </td>
                  <td className={styles.td}>
                    {e.qr_codigo ? (
                      <div className={styles.qrCell}>
                        <span className={styles.qrTitulo}>
                          {e.qr_codigo.titulo ?? `QR #${e.qr_codigo_id}`}
                        </span>
                        <code className={styles.qrCodigo}>
                          {e.qr_codigo.codigo.length > 16
                            ? `${e.qr_codigo.codigo.slice(0, 8)}…`
                            : e.qr_codigo.codigo}
                        </code>
                      </div>
                    ) : (
                      <code className={styles.codeChip}>#{e.qr_codigo_id}</code>
                    )}
                  </td>
                  <td className={`${styles.td} ${styles.tdMono}`}>{e.ip_address}</td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {e.dispositivo
                      ? (e.dispositivo.length > 40
                          ? `${e.dispositivo.slice(0, 40)}…`
                          : e.dispositivo)
                      : '—'}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {formatFecha(e.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Panel de detalle inline (al hacer clic en la fila) ── */}
      {seleccionado && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <span className={styles.detailTitle}>Detalle del escaneo #{seleccionado.id}</span>
            <button className={styles.closeBtn} onClick={() => setSeleccionado(null)}>✕</button>
          </div>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailKey}>Resultado</span>
              <ResultadoBadge resultado={seleccionado.resultado} />
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailKey}>QR ID</span>
              <span className={styles.detailVal}>#{seleccionado.qr_codigo_id}</span>
            </div>
            {seleccionado.qr_codigo?.titulo && (
              <div className={styles.detailItem}>
                <span className={styles.detailKey}>Título QR</span>
                <span className={styles.detailVal}>{seleccionado.qr_codigo.titulo}</span>
              </div>
            )}
            {seleccionado.qr_codigo?.codigo && (
              <div className={styles.detailItem}>
                <span className={styles.detailKey}>Código QR</span>
                <code className={styles.detailCode}>{seleccionado.qr_codigo.codigo}</code>
              </div>
            )}
            <div className={styles.detailItem}>
              <span className={styles.detailKey}>IP</span>
              <span className={styles.detailVal}>{seleccionado.ip_address}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailKey}>Dispositivo</span>
              <span className={styles.detailVal}>{seleccionado.dispositivo ?? '—'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailKey}>Fecha</span>
              <span className={styles.detailVal}>{formatFecha(seleccionado.created_at)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
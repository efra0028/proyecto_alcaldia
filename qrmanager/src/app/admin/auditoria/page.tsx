'use client'


import { useAuditoria } from './hooks/useAuditoria'
import AuditoriaDrawer from './components/AuditoriaDrawer'
import type { AuditoriaEntry } from './types'
import { TABLAS_CONOCIDAS, ACCIONES } from './types'
import styles from './page.module.css'

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatFecha(iso: string) {
  try {
    return new Date(iso).toLocaleString('es-BO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

const ACCION_CONFIG = {
  INSERT: { label: 'Creación',     color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  UPDATE: { label: 'Modificación', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  DELETE: { label: 'Eliminación',  color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent,
}: { label: string; value: number; sub?: string; accent?: string }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statValue} style={accent ? { color: accent } : {}}>
        {value.toLocaleString('es-BO')}
      </span>
      <span className={styles.statLabel}>{label}</span>
      {sub && <span className={styles.statSub}>{sub}</span>}
    </div>
  )
}

function AccionBadge({ accion }: { accion: AuditoriaEntry['accion'] }) {
  const cfg = ACCION_CONFIG[accion]
  return (
    <span
      className={styles.accionBadge}
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function AuditoriaPage() {
  const {
    entradas,
    totalSinFiltro,
    cargando,
    error,
    stats,
    filtros,
    setFiltro,
    seleccionada,
    setSeleccionada,
    recargar,
  } = useAuditoria()

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>Administración › Auditoría</div>
          <h1 className={styles.title}>Log de auditoría</h1>
          <p className={styles.subtitle}>
            Registro automático de todas las operaciones sobre la plataforma. Solo lectura.
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
        <StatCard label="Total registros" value={stats.total} />
        <StatCard label="Creaciones"  value={stats.inserts} accent="#16a34a" sub="INSERT" />
        <StatCard label="Modificaciones" value={stats.updates} accent="#b45309" sub="UPDATE" />
        <StatCard label="Eliminaciones"  value={stats.deletes} accent="#b91c1c" sub="DELETE" />
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
              placeholder="Buscar por ID, usuario, IP…"
              value={filtros.busqueda}
              onChange={e => setFiltro('busqueda', e.target.value)}
            />
          </div>

          <select
            className={styles.select}
            value={filtros.tabla}
            onChange={e => setFiltro('tabla', e.target.value)}
          >
            {TABLAS_CONOCIDAS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <select
            className={styles.select}
            value={filtros.accion}
            onChange={e => setFiltro('accion', e.target.value)}
          >
            {ACCIONES.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.filtersRight}>
          <span className={styles.contador}>
            {entradas.length !== totalSinFiltro
              ? <><strong>{entradas.length}</strong> de {totalSinFiltro}</>
              : <><strong>{entradas.length}</strong> registros</>}
          </span>
        </div>
      </div>

      {/* ── Estado de carga / error ── */}
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
              <th className={styles.th}>Acción</th>
              <th className={styles.th}>Tabla</th>
              <th className={styles.th}>Registro ID</th>
              <th className={styles.th}>Usuario</th>
              <th className={styles.th}>IP</th>
              <th className={styles.th}>Fecha</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className={styles.td}>
                      <div className={styles.skeleton} style={{ width: j === 0 ? 32 : j === 3 ? 90 : 80 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : entradas.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.empty}>
                  <div className={styles.emptyIcon}>🔍</div>
                  <p>Sin registros de auditoría{filtros.tabla || filtros.accion || filtros.busqueda ? ' con estos filtros' : ''}.</p>
                </td>
              </tr>
            ) : (
              entradas.map(e => (
                <tr
                  key={e.id}
                  className={`${styles.row} ${seleccionada?.id === e.id ? styles.rowSelected : ''}`}
                  onClick={() => setSeleccionada(e)}
                >
                  <td className={`${styles.td} ${styles.tdMuted}`}>{e.id}</td>
                  <td className={styles.td}>
                    <AccionBadge accion={e.accion} />
                  </td>
                  <td className={styles.td}>
                    <code className={styles.codeChip}>{e.tabla_nombre}</code>
                  </td>
                  <td className={`${styles.td} ${styles.tdMono}`}>
                    {e.registro_id.length > 18
                      ? `${e.registro_id.slice(0, 8)}…${e.registro_id.slice(-6)}`
                      : e.registro_id}
                  </td>
                  <td className={styles.td}>
                    {e.usuario
                      ? (
                        <div className={styles.usuarioCell}>
                          <span className={styles.usuarioNombre}>{e.usuario.nombre}</span>
                          <span className={styles.usuarioEmail}>{e.usuario.email}</span>
                        </div>
                      )
                      : <span className={styles.tdMuted}>—</span>}
                  </td>
                  <td className={`${styles.td} ${styles.tdMono} ${styles.tdMuted}`}>
                    {e.ip_address ?? '—'}
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {formatFecha(e.created_at)}
                  </td>
                  <td className={styles.td}>
                    <button
                      className={styles.verBtn}
                      onClick={ev => { ev.stopPropagation(); setSeleccionada(e) }}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Drawer de detalle ── */}
      {seleccionada && (
        <AuditoriaDrawer
          entrada={seleccionada}
          onClose={() => setSeleccionada(null)}
        />
      )}
    </div>
  )
}
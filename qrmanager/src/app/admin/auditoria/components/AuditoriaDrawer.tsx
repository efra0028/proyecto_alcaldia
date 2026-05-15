'use client'

import type { AuditoriaEntry } from '../types'
import styles from './AuditoriaDrawer.module.css'

interface Props {
  entrada: AuditoriaEntry
  onClose: () => void
}

const ACCION_CONFIG = {
  INSERT: { label: 'Creación',      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  UPDATE: { label: 'Modificación',  color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  DELETE: { label: 'Eliminación',   color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
}

function formatFecha(iso: string) {
  try {
    return new Date(iso).toLocaleString('es-BO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  } catch { return iso }
}

function JsonBlock({ data, label }: { data: Record<string, unknown> | null; label: string }) {
  if (!data) return (
    <div className={styles.jsonEmpty}>
      <span>{label}</span>
      <p>— sin datos —</p>
    </div>
  )

  const entries = Object.entries(data)

  return (
    <div className={styles.jsonBlock}>
      <div className={styles.jsonLabel}>{label}</div>
      <div className={styles.jsonTable}>
        {entries.map(([key, val]) => (
          <div key={key} className={styles.jsonRow}>
            <span className={styles.jsonKey}>{key}</span>
            <span className={styles.jsonVal}>
              {val === null
                ? <em className={styles.jsonNull}>null</em>
                : typeof val === 'object'
                  ? <code>{JSON.stringify(val)}</code>
                  : String(val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DiffBlock({ antes, despues }: {
  antes: Record<string, unknown> | null
  despues: Record<string, unknown> | null
}) {
  if (!antes || !despues) return null

  // Campos que cambiaron
  const allKeys = Array.from(new Set([
    ...Object.keys(antes),
    ...Object.keys(despues),
  ]))

  const changed = allKeys.filter(k =>
    JSON.stringify(antes[k]) !== JSON.stringify(despues[k])
  )

  if (changed.length === 0) return (
    <div className={styles.diffEmpty}>Sin diferencias detectadas</div>
  )

  return (
    <div className={styles.diffBlock}>
      <div className={styles.jsonLabel}>
        Campos modificados
        <span className={styles.diffCount}>{changed.length}</span>
      </div>
      {changed.map(key => (
        <div key={key} className={styles.diffRow}>
          <div className={styles.diffKey}>{key}</div>
          <div className={styles.diffValues}>
            <div className={styles.diffBefore}>
              <span className={styles.diffTag}>antes</span>
              <code>{antes[key] === null ? 'null' : String(antes[key])}</code>
            </div>
            <div className={styles.diffArrow}>→</div>
            <div className={styles.diffAfter}>
              <span className={styles.diffTag}>después</span>
              <code>{despues[key] === null ? 'null' : String(despues[key])}</code>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AuditoriaDrawer({ entrada, onClose }: Props) {
  const cfg = ACCION_CONFIG[entrada.accion]

  return (
    <>
      {/* Backdrop semitransparente */}
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.headerTop}>
              <span
                className={styles.accionBadge}
                style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
              >
                {cfg.label}
              </span>
              <span className={styles.tabla}>{entrada.tabla_nombre}</span>
            </div>
            <div className={styles.registroId}>
              ID: <code>{entrada.registro_id}</code>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Meta */}
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaKey}>Fecha</span>
            <span className={styles.metaVal}>{formatFecha(entrada.created_at)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaKey}>Usuario</span>
            <span className={styles.metaVal}>
              {entrada.usuario
                ? `${entrada.usuario.nombre} (${entrada.usuario.email})`
                : entrada.usuario_id
                  ? `ID ${entrada.usuario_id}`
                  : <em>Sistema / público</em>}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaKey}>IP</span>
            <span className={styles.metaVal}>
              {entrada.ip_address ?? <em>—</em>}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaKey}>Registro #</span>
            <span className={styles.metaVal}>{entrada.id}</span>
          </div>
        </div>

        {/* Diff para UPDATEs */}
        {entrada.accion === 'UPDATE' && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Cambios realizados</div>
            <DiffBlock antes={entrada.datos_antes} despues={entrada.datos_despues} />
          </div>
        )}

        {/* Datos completos */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Datos completos</div>
          <div className={styles.jsonPair}>
            <JsonBlock data={entrada.datos_antes}   label="Estado anterior" />
            <JsonBlock data={entrada.datos_despues} label="Estado posterior" />
          </div>
        </div>
      </div>
    </>
  )
}
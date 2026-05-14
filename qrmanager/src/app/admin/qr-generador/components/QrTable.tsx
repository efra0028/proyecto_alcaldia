'use client'

import type { QrCodigo, SortKey, SortDir } from '../types'
import { formatDate, truncate, isVencido } from '../utils/format'
import SistemaBadge from './SistemaBadge'
import EstadoBadge from './EstadoBadge'
import styles from './QrTable.module.css'

interface Props {
  qrCodigos: QrCodigo[]
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
  onVerQr: (qr: QrCodigo) => void
  onToggleEstado: (qr: QrCodigo) => void
  onEliminar: (qr: QrCodigo) => void
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <span className={styles.sortInactive}>↕</span>
  return <span className={styles.sortActive}>{sortDir === 'asc' ? '↑' : '↓'}</span>
}

export default function QrTable({
  qrCodigos, sortKey, sortDir, onSort, onVerQr, onToggleEstado, onEliminar,
}: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.scrollX}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.thead}>
              <th className={styles.th} onClick={() => onSort('referencia_externa')}>
                Referencia <SortIcon col="referencia_externa" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={styles.th} onClick={() => onSort('sistema_id')}>
                Sistema <SortIcon col="sistema_id" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={styles.th}>Datos del registro</th>
              <th className={styles.th} onClick={() => onSort('fecha_vencimiento')}>
                Vencimiento <SortIcon col="fecha_vencimiento" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={styles.th} onClick={() => onSort('estado')}>
                Estado <SortIcon col="estado" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={styles.th} onClick={() => onSort('created_at')}>
                Generado <SortIcon col="created_at" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {qrCodigos.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  <div className={styles.emptyIcon}>🔲</div>
                  No hay códigos QR que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              qrCodigos.map((qr, i) => {
                const reg     = qr.registro
                const vencido = isVencido(reg?.fecha_vencimiento)
                const datos   = reg?.datos_display ?? {}
                const datosKeys = Object.keys(datos).slice(0, 3)

                return (
                  <tr
                    key={qr.id}
                    className={`${styles.tr} ${vencido ? styles.trVencido : ''} ${i % 2 !== 0 ? styles.trAlt : ''}`}
                  >
                    {/* Referencia */}
                    <td className={styles.td}>
                      <div className={styles.refCell}>
                        <div className={styles.refCode}>{reg?.referencia_externa ?? '—'}</div>
                        <div className={styles.refUuid} title={qr.codigo_unico}>
                          {qr.codigo_unico.slice(0, 8)}…
                        </div>
                      </div>
                    </td>

                    {/* Sistema */}
                    <td className={styles.td}>
                      <SistemaBadge sistema={reg?.sistema} />
                    </td>

                    {/* Datos display — preview de los primeros 3 campos */}
                    <td className={styles.td}>
                      <div className={styles.datosWrap}>
                        {datosKeys.map((k) => (
                          <div key={k} className={styles.datoItem}>
                            <span className={styles.datoKey}>{k.replace(/_/g, ' ')}:</span>
                            <span className={styles.datoVal}>
                              {truncate(String(datos[k]), 28)}
                            </span>
                          </div>
                        ))}
                        {Object.keys(datos).length > 3 && (
                          <div className={styles.datosMore}>
                            +{Object.keys(datos).length - 3} campos más
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Vencimiento */}
                    <td className={`${styles.td} ${styles.tdMono}`}>
                      {reg?.fecha_vencimiento ? (
                        <span className={vencido ? styles.vencidoText : ''}>
                          {formatDate(reg.fecha_vencimiento)}
                          {vencido && <div className={styles.vencidaTag}>vencida</div>}
                        </span>
                      ) : (
                        <span className={styles.sinVenc}>Sin límite</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className={styles.td}>
                      <EstadoBadge
                        estado={reg?.estado}
                        fecha_vencimiento={reg?.fecha_vencimiento}
                      />
                    </td>

                    {/* Generado */}
                    <td className={`${styles.td} ${styles.tdMono}`}>
                      {formatDate(qr.created_at)}
                    </td>

                    {/* Acciones */}
                    <td className={`${styles.td} ${styles.tdActions}`}>
                      <button
                        className={`${styles.actionBtn} ${styles.actionQr}`}
                        title="Ver / descargar QR"
                        onClick={() => onVerQr(qr)}
                      >
                        🔲
                      </button>
                      <button
                        className={`${styles.actionBtn} ${reg?.estado === 'activo' && !vencido ? styles.actionSuspend : styles.actionActivate}`}
                        title={reg?.estado === 'activo' ? 'Suspender' : 'Reactivar'}
                        onClick={() => onToggleEstado(qr)}
                        disabled={vencido}
                      >
                        {reg?.estado === 'activo' && !vencido ? '🚫' : '✅'}
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionDelete}`}
                        title="Eliminar QR"
                        onClick={() => onEliminar(qr)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {qrCodigos.length > 0 && (
        <div className={styles.tableFooter}>
          Mostrando {qrCodigos.length} código{qrCodigos.length !== 1 ? 's' : ''} QR
        </div>
      )}
    </div>
  )
}
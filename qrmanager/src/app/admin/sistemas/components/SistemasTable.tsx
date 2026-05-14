'use client'
import type { Sistema, SortKey, SortDir } from '../types'
import { formatDate } from '../utils/format'
import EstadoBadge from './EstadoBadge'
import styles from './SistemasTable.module.css'

interface Props {
  sistemas: Sistema[]
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
  onEditar: (s: Sistema) => void
  onToggleEstado: (s: Sistema) => void
  onRegenerarKey: (s: Sistema) => void
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <span className={styles.sortIconInactive}>↕</span>
  return <span className={styles.sortIconActive}>{sortDir === 'asc' ? '↑' : '↓'}</span>
}

export default function SistemasTable({
  sistemas, sortKey, sortDir, onSort, onEditar, onToggleEstado, onRegenerarKey,
}: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.scrollX}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.thead}>
              <th className={styles.th} onClick={() => onSort('nombre')}>
                Sistema <SortIcon col="nombre" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={styles.th}>API Key</th>
              <th className={styles.th} onClick={() => onSort('usuariosCount')}>
                Usuarios <SortIcon col="usuariosCount" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={styles.th} onClick={() => onSort('estado')}>
                Estado <SortIcon col="estado" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={styles.th} onClick={() => onSort('created_at')}>
                Creado <SortIcon col="created_at" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {sistemas.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  <div className={styles.emptyIcon}>🔍</div>
                  No hay sistemas que coincidan con los filtros.
                </td>
              </tr>
            ) : (
                sistemas.map((s, i) => (
                  <tr
                    key={s.id}   // <-- debe estar aquí, en el elemento raíz del map
                    className={`${styles.tr} ${s.estado === 'inactivo' ? styles.trInactivo : ''} ${i % 2 !== 0 ? styles.trAlt : ''}`}
                  >
                  {/* Sistema */}
                  <td className={styles.td}>
                    <div className={styles.sistemaCell}>
                      <div
                        className={styles.colorDot}
                        style={{ background: s.color_hex || '#9e9890' }}
                      />
                      <div>
                        <div className={styles.sistemaNombre}>{s.nombre}</div>
                        <div className={styles.sistemaDesc}>
                          {s.descripcion
                            ? s.descripcion.length > 55
                              ? s.descripcion.slice(0, 55) + '…'
                              : s.descripcion
                            : '—'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* API Key */}
                  <td className={`${styles.td} ${styles.tdMono}`}>
                    <span className={styles.apiKey}>
                      {s.api_key.length > 18 ? s.api_key.slice(0, 18) + '…' : s.api_key}
                    </span>
                  </td>

                  {/* Usuarios */}
                  <td className={styles.td}>
                    <span className={styles.countBadge}>{s.usuariosCount}</span>
                  </td>

                  {/* Estado */}
                  <td className={styles.td}>
                    <EstadoBadge estado={s.estado} />
                  </td>

                  {/* Creado */}
                  <td className={`${styles.td} ${styles.tdMono}`}>
                    {formatDate(s.created_at)}
                  </td>

                  {/* Acciones */}
                  <td className={`${styles.td} ${styles.tdActions}`}>
                    <button
                      className={styles.actionBtn}
                      title="Editar sistema"
                      onClick={() => onEditar(s)}
                    >
                      ✏️
                    </button>
                    {/* ← AGREGA ESTE BOTÓN */}
                    <button
                      className={styles.actionBtn}
                      title="Regenerar API Key"
                      onClick={() => onRegenerarKey(s)}
                    >
                      🔑
                    </button>
                    <button
                      className={`${styles.actionBtn} ${s.estado === 'activo' ? styles.actionSuspend : styles.actionActivate}`}
                      title={s.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      onClick={() => onToggleEstado(s)}
                    >
                      {s.estado === 'activo' ? '🚫' : '✅'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sistemas.length > 0 && (
        <div className={styles.tableFooter}>
          Mostrando {sistemas.length} sistema{sistemas.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
'use client'

import type { Usuario, SortKey, SortDir } from '../types'
import { getInitiales, getAvatarColor, formatDate } from '../utils/format'
import RolBadge from './RolBadge'
import EstadoBadge from '../components/EstadoBadge'
import styles from './UsuariosTable.module.css'

interface Props {
  usuarios: Usuario[]
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
  onEditar: (u: Usuario) => void
  onToggleEstado: (u: Usuario) => void
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <span className={styles.sortIconInactive}>↕</span>
  return <span className={styles.sortIconActive}>{sortDir === 'asc' ? '↑' : '↓'}</span>
}

export default function UsuariosTable({
  usuarios, sortKey, sortDir, onSort, onEditar, onToggleEstado,
}: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.scrollX}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.thead}>
              <th className={styles.th} onClick={() => onSort('nombre')}>
                Usuario <SortIcon col="nombre" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={styles.th} onClick={() => onSort('rol')}>
                Rol <SortIcon col="rol" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={styles.th}>Sistemas</th>
              <th className={styles.th} onClick={() => onSort('estado')}>
                Estado <SortIcon col="estado" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={styles.th} onClick={() => onSort('ultimoAcceso')}>
                Último acceso <SortIcon col="ultimoAcceso" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  <div className={styles.emptyIcon}>🔍</div>
                  No hay usuarios que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              usuarios.map((u, i) => (
                <tr
                  key={u.id}
                  className={`${styles.tr} ${u.estado === 'suspendido' ? styles.trSuspendido : ''} ${i % 2 !== 0 ? styles.trAlt : ''}`}
                >
                  {/* Usuario */}
                  <td className={styles.td}>
                    <div className={styles.userCell}>
                      <div
                        className={styles.avatar}
                        style={{ background: getAvatarColor(u.id) }}
                      >
                        {getInitiales(u.nombre)}
                      </div>
                      <div>
                        <div className={styles.userName}>{u.nombre}</div>
                        <div className={styles.userEmail}>{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Rol */}
                  <td className={styles.td}>
                    <RolBadge rol={u.rol} />
                  </td>

                  {/* Sistemas */}
                  <td className={styles.td}>
                    <div className={styles.sistemas}>
                      {u.sistemas.slice(0, 2).map((s) => (
                        <span key={s} className={styles.sistemaTag}>{s}</span>
                      ))}
                      {u.sistemas.length > 2 && (
                        <span className={styles.sistemaTagMore}>
                          +{u.sistemas.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className={styles.td}>
                    <EstadoBadge estado={u.estado} />
                  </td>

                  {/* Último acceso */}
                  <td className={`${styles.td} ${styles.tdMono}`}>
                    {formatDate(u.ultimoAcceso)}
                  </td>

                  {/* Acciones */}
                  <td className={`${styles.td} ${styles.tdActions}`}>
                    <button
                      className={styles.actionBtn}
                      title="Editar usuario"
                      onClick={() => onEditar(u)}
                    >
                      ✏️
                    </button>
                    <button
                      className={`${styles.actionBtn} ${u.estado === 'activo' ? styles.actionSuspend : styles.actionActivate}`}
                      title={u.estado === 'activo' ? 'Suspender' : 'Reactivar'}
                      onClick={() => onToggleEstado(u)}
                    >
                      {u.estado === 'activo' ? '🚫' : '✅'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pie */}
      {usuarios.length > 0 && (
        <div className={styles.tableFooter}>
          Mostrando {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

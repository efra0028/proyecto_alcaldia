'use client'

import type { Publicacion, SortKey, SortDir } from '../types'
import { formatDate, truncate, isVencida } from '../utils/format'
import TipoBadge from './TipoBadge'
import EstadoBadge from './EstadoBadge'
import styles from './PublicacionesTable.module.css'

interface Props {
  publicaciones: Publicacion[]
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
  onEditar: (p: Publicacion) => void
  onToggleEstado: (p: Publicacion) => void
  onEliminar: (p: Publicacion) => void
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <span className={styles.sortIconInactive}>↕</span>
  return <span className={styles.sortIconActive}>{sortDir === 'asc' ? '↑' : '↓'}</span>
}

export default function PublicacionesTable({
  publicaciones, sortKey, sortDir, onSort, onEditar, onToggleEstado, onEliminar,
}: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.scrollX}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.thead}>
              <th className={styles.th} onClick={() => onSort('titulo')}>
                Publicación <SortIcon col="titulo" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={styles.th}>Tipo</th>
              <th className={styles.th} onClick={() => onSort('fecha_publicacion')}>
                Fecha pub. <SortIcon col="fecha_publicacion" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={styles.th}>Vencimiento</th>
              <th className={styles.th} onClick={() => onSort('estado')}>
                Estado <SortIcon col="estado" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={styles.th} onClick={() => onSort('destacada')}>
                Carrusel <SortIcon col="destacada" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {publicaciones.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  <div className={styles.emptyIcon}>🔍</div>
                  No hay publicaciones que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              publicaciones.map((p, i) => {
                const vencida = isVencida(p.fecha_vencimiento)
                return (
                  <tr
                    key={p.id}
                    className={`${styles.tr} ${p.estado === 'archivado' ? styles.trArchivado : ''} ${i % 2 !== 0 ? styles.trAlt : ''}`}
                  >
                    {/* Publicación */}
                    <td className={styles.td}>
                      <div className={styles.pubCell}>
                        {p.destacada && p.orden_carrusel > 0 && (
                          <span className={styles.carruselBadge} title={`Carrusel #${p.orden_carrusel}`}>
                            ⭐
                          </span>
                        )}
                        <div>
                          <div className={styles.pubTitle}>{truncate(p.titulo, 60)}</div>
                          <div className={styles.pubResumen}>
                            {truncate(p.contenido.resumen, 80)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className={styles.td}>
                      <TipoBadge tipo={p.tipo} />
                    </td>

                    {/* Fecha pub. */}
                    <td className={`${styles.td} ${styles.tdMono}`}>
                      {formatDate(p.fecha_publicacion)}
                    </td>

                    {/* Vencimiento */}
                    <td className={`${styles.td} ${styles.tdMono}`}>
                      {p.fecha_vencimiento ? (
                        <span className={vencida ? styles.vencida : ''}>
                          {formatDate(p.fecha_vencimiento)}
                          {vencida && <span className={styles.vencidaTag}> · vencida</span>}
                        </span>
                      ) : (
                        <span className={styles.sinVenc}>—</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className={styles.td}>
                      <EstadoBadge estado={p.estado} />
                    </td>

                    {/* Carrusel */}
                    <td className={styles.td}>
                      {p.destacada && p.orden_carrusel > 0 ? (
                        <span className={styles.carruselPos}>#{p.orden_carrusel}</span>
                      ) : (
                        <span className={styles.sinCarrusel}>—</span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className={`${styles.td} ${styles.tdActions}`}>
                      <button
                        className={styles.actionBtn}
                        title="Editar publicación"
                        onClick={() => onEditar(p)}
                      >
                        ✏️
                      </button>
                      <button
                        className={`${styles.actionBtn} ${p.estado === 'publicado' ? styles.actionArchive : styles.actionPublish}`}
                        title={p.estado === 'publicado' ? 'Archivar' : 'Publicar'}
                        onClick={() => onToggleEstado(p)}
                      >
                        {p.estado === 'publicado' ? '📦' : '🚀'}
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionDelete}`}
                        title="Eliminar publicación"
                        onClick={() => onEliminar(p)}
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

      {publicaciones.length > 0 && (
        <div className={styles.tableFooter}>
          Mostrando {publicaciones.length} publicación{publicaciones.length !== 1 ? 'es' : ''}
        </div>
      )}
    </div>
  )
}

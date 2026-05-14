'use client'

import { TIPOS } from '../data/constants'
import styles from './FiltersBar.module.css'

interface Props {
  search: string
  onSearch: (v: string) => void
  filtroTipo: string
  onFiltroTipo: (v: string) => void
  filtroEst: string
  onFiltroEst: (v: string) => void
  total: number
  visible: number
}

export default function FiltersBar({
  search, onSearch,
  filtroTipo, onFiltroTipo,
  filtroEst, onFiltroEst,
  total, visible,
}: Props) {
  return (
    <div className={styles.bar}>
      {/* Search */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar por título o resumen…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearBtn} onClick={() => onSearch('')}>
            ✕
          </button>
        )}
      </div>

      <div className={styles.selects}>
        {/* Tipo */}
        <select
          className={styles.select}
          value={filtroTipo}
          onChange={(e) => onFiltroTipo(e.target.value)}
        >
          <option value="todos">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.nombre}
            </option>
          ))}
        </select>

        {/* Estado */}
        <select
          className={styles.select}
          value={filtroEst}
          onChange={(e) => onFiltroEst(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="publicado">Publicado</option>
          <option value="borrador">Borrador</option>
          <option value="archivado">Archivado</option>
        </select>
      </div>

      <span className={styles.counter}>
        {visible} de {total} publicaciones
      </span>
    </div>
  )
}

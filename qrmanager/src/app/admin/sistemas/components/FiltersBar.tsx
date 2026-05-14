'use client'
import styles from './FiltersBar.module.css'

interface Props {
  search: string
  onSearch: (v: string) => void
  filtroEst: string
  onFiltroEst: (v: string) => void
  total: number
  visible: number
}

export default function FiltersBar({
  search, onSearch, filtroEst, onFiltroEst, total, visible,
}: Props) {
  return (
    <div className={styles.bar}>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar por nombre o descripción…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearBtn} onClick={() => onSearch('')}>✕</button>
        )}
      </div>

      <div className={styles.selects}>
        <select
          className={styles.select}
          value={filtroEst}
          onChange={(e) => onFiltroEst(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <span className={styles.counter}>
        {visible} de {total} sistemas
      </span>
    </div>
  )
}
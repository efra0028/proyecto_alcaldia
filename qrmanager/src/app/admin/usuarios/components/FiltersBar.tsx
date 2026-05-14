'use client'

import { ROLES, ROL_META } from '../data/constants'
import styles from './FiltersBar.module.css'

interface Props {
  search: string
  onSearch: (v: string) => void
  filtroRol: string
  onFiltroRol: (v: string) => void
  filtroEst: string
  onFiltroEst: (v: string) => void
  total: number
  visible: number
}

export default function FiltersBar({
  search, onSearch,
  filtroRol, onFiltroRol,
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
          placeholder="Buscar por nombre o email…"
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
        {/* Rol */}
        <select
          className={styles.select}
          value={filtroRol}
          onChange={(e) => onFiltroRol(e.target.value)}
        >
          <option value="todos">Todos los roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROL_META[r].label}
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
          <option value="activo">Activos</option>
          <option value="suspendido">Suspendidos</option>
        </select>
      </div>

      <span className={styles.counter}>
        {visible} de {total} usuarios
      </span>
    </div>
  )
}

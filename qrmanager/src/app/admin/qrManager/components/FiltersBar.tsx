'use client'

import { SISTEMAS } from '../data/constants'
import styles from './FiltersBar.module.css'

interface Props {
  search: string
  onSearch: (v: string) => void
  filtroSistema: string
  onFiltroSistema: (v: string) => void
  filtroEst: string
  onFiltroEst: (v: string) => void
  total: number
  visible: number
}

export default function FiltersBar({
  search, onSearch,
  filtroSistema, onFiltroSistema,
  filtroEst, onFiltroEst,
  total, visible,
}: Props) {
  return (
    <div className={styles.bar}>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar por referencia, sistema o datos del registro…"
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
          value={filtroSistema}
          onChange={(e) => onFiltroSistema(e.target.value)}
        >
          <option value="todos">Todos los sistemas</option>
          {SISTEMAS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icono} {s.nombre}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filtroEst}
          onChange={(e) => onFiltroEst(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="suspendido">Suspendido</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>

      <span className={styles.counter}>{visible} de {total} QRs</span>
    </div>
  )
}
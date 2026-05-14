'use client'

import type { EstadoPublicacion } from '../types'
import { getEstadoMeta } from '../utils/format'
import styles from './EstadoBadge.module.css'

interface Props {
  estado?: EstadoPublicacion
}

export default function EstadoBadge({ estado }: Props) {
  const meta = getEstadoMeta(estado)
  return (
    <span
      className={styles.badge}
      style={{ color: meta.color, backgroundColor: meta.bg }}
    >
      <span className={styles.dot} style={{ background: meta.color }} />
      {meta.label}
    </span>
  )
}

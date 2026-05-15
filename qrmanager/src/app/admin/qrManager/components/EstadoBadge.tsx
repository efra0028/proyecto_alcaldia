'use client'

import type { EstadoRegistro } from '../types'
import { getEstadoMeta, isVencido } from '../utils/format'
import styles from './EstadoBadge.module.css'

interface Props {
  estado?: EstadoRegistro
  fecha_vencimiento?: string
}

export default function EstadoBadge({ estado, fecha_vencimiento }: Props) {
  // Calcular estado efectivo en tiempo real
  const efectivo: EstadoRegistro =
    isVencido(fecha_vencimiento) ? 'vencido' : (estado ?? 'activo')
  const meta = getEstadoMeta(efectivo)

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
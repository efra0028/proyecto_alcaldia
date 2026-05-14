'use client'

import type { Sistema } from '../types'
import styles from './SistemaBadge.module.css'

interface Props {
  sistema?: Sistema
}

export default function SistemaBadge({ sistema }: Props) {
  if (!sistema) return <span className={styles.unknown}>—</span>
  return (
    <span
      className={styles.badge}
      style={{
        backgroundColor: sistema.color_hex + '18',
        color: sistema.color_hex,
        borderColor: sistema.color_hex + '35',
      }}
    >
      <span className={styles.icon}>{sistema.icono}</span>
      {sistema.nombre}
    </span>
  )
}
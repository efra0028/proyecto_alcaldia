'use client'

import type { TipoPublicacion } from '../types'
import styles from './TipoBadge.module.css'

interface Props {
  tipo?: TipoPublicacion
}

export default function TipoBadge({ tipo }: Props) {
  if (!tipo) return null
  return (
    <span
      className={styles.badge}
      style={{
        backgroundColor: tipo.color_hex + '1a',
        color: tipo.color_hex,
        borderColor: tipo.color_hex + '40',
      }}
    >
      {tipo.nombre}
    </span>
  )
}

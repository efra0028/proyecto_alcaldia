'use client'

import type { StatCard as StatCardType } from '../types'
import styles from './StatCard.module.css'

interface Props {
  stat: StatCardType
  progress?: number   // 0-100
}

export default function StatCard({ stat, progress }: Props) {
  const signo = stat.cambio > 0 ? '+' : ''
  const clase = stat.cambio > 0 ? styles.positive : stat.cambio < 0 ? styles.negative : styles.neutral
  const arrow = stat.cambio > 0 ? '↑' : stat.cambio < 0 ? '↓' : '→'

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div
          className={styles.iconWrap}
          style={{ background: `${stat.color}18` }}
        >
          {stat.icono}
        </div>
        <span className={`${styles.changeBadge} ${clase}`}>
          {arrow} {signo}{stat.cambio}%
        </span>
      </div>

      <div>
        <div className={styles.value}>{stat.valor.toLocaleString('es-BO')}</div>
        <div className={styles.title}>{stat.titulo}</div>
      </div>

      <div className={styles.desc}>{stat.descripcion}</div>

      {progress !== undefined && (
        <div className={styles.progress}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%`, background: stat.color }}
          />
        </div>
      )}
    </div>
  )
}
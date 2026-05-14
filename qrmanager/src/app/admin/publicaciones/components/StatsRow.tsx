import styles from './StatsRow.module.css'

interface Props {
  total: number
  publicadas: number
  borradores: number
  destacadas: number
}

export default function StatsRow({ total, publicadas, borradores, destacadas }: Props) {
  const items = [
    { label: 'Total',       val: total,      icon: '📰', cls: 'neutral' },
    { label: 'Publicadas',  val: publicadas,  icon: '✅', cls: 'green'   },
    { label: 'Borradores',  val: borradores,  icon: '📝', cls: 'amber'   },
    { label: 'En carrusel', val: destacadas,  icon: '⭐', cls: 'blue'    },
  ]

  return (
    <div className={styles.row}>
      {items.map((s) => (
        <div key={s.label} className={styles.card}>
          <div className={`${styles.icon} ${styles[s.cls]}`}>{s.icon}</div>
          <div>
            <div className={`${styles.val} ${styles[`val_${s.cls}`]}`}>{s.val}</div>
            <div className={styles.label}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

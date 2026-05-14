import styles from './StatsRow.module.css'

interface Props {
  total: number
  activos: number
  vencidos: number
  sistemas: number
}

export default function StatsRow({ total, activos, vencidos, sistemas }: Props) {
  const items = [
    { label: 'Total QRs',   val: total,    icon: '🔲', cls: 'neutral' },
    { label: 'Activos',     val: activos,  icon: '✅', cls: 'green'   },
    { label: 'Vencidos',    val: vencidos, icon: '⏰', cls: 'red'     },
    { label: 'Sistemas',    val: sistemas, icon: '🗂️', cls: 'blue'    },
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
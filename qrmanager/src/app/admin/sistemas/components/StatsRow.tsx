import styles from './StatsRow.module.css'

interface Props {
  total: number
  activos: number
  inactivos: number
  usuarios: number
}

export default function StatsRow({ total, activos, inactivos, usuarios }: Props) {
  const stats = [
    { label: 'Total sistemas',  val: total,     icon: '🗂️',  colorClass: 'neutral' },
    { label: 'Activos',         val: activos,   icon: '✅',  colorClass: 'green'   },
    { label: 'Inactivos',       val: inactivos, icon: '🚫',  colorClass: 'red'     },
    { label: 'Usuarios totales',val: usuarios,  icon: '👥',  colorClass: 'blue'    },
  ]

  return (
    <div className={styles.row}>
      {stats.map((s) => (
        <div key={s.label} className={styles.card}>
          <div className={`${styles.iconWrap} ${styles[s.colorClass]}`}>
            {s.icon}
          </div>
          <div>
            <div className={`${styles.val} ${styles[`val_${s.colorClass}`]}`}>
              {s.val}
            </div>
            <div className={styles.label}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
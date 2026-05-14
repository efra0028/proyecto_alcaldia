import styles from './StatsRow.module.css'

interface Stat {
  label: string
  val: number
  icon: string
  colorClass: string
}

interface Props {
  total: number
  activos: number
  suspendidos: number
  admins: number
}

export default function StatsRow({ total, activos, suspendidos, admins }: Props) {
  const stats: Stat[] = [
    { label: 'Total usuarios',   val: total,       icon: '👥', colorClass: 'neutral'  },
    { label: 'Activos',          val: activos,      icon: '✅', colorClass: 'green'    },
    { label: 'Suspendidos',      val: suspendidos,  icon: '🚫', colorClass: 'red'      },
    { label: 'Administradores',  val: admins,       icon: '🔑', colorClass: 'blue'     },
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

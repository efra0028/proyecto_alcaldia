import type { Rol } from '../types'
import { ROL_META } from '../data/constants'
import styles from './RolBadge.module.css'

interface Props {
  rol: Rol
}

export default function RolBadge({ rol }: Props) {
  const meta = ROL_META[rol]
  return (
    <span
      className={styles.badge}
      style={{ color: meta.color, background: meta.bg }}
    >
      {meta.label}
    </span>
  )
}

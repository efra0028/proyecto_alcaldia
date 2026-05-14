import type { EstadoUsuario } from '../types'
import styles from './EstadoBadge.module.css'

interface Props {
  estado: EstadoUsuario
}

export default function EstadoBadge({ estado }: Props) {
  const activo = estado === 'activo'
  return (
    <span className={`${styles.badge} ${activo ? styles.activo : styles.suspendido}`}>
      <span className={styles.dot} />
      {activo ? 'Activo' : 'Suspendido'}
    </span>
  )
}

import styles from './EstadoBadge.module.css'
import type { EstadoSistema } from '../types'

export default function EstadoBadge({ estado }: { estado: EstadoSistema }) {
  return (
    <span className={`${styles.badge} ${estado === 'activo' ? styles.activo : styles.inactivo}`}>
      <span className={styles.dot} />
      {estado === 'activo' ? 'Activo' : 'Inactivo'}
    </span>
  )
}
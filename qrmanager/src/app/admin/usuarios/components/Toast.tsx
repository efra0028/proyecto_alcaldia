import type { ToastState } from '../types'
import styles from './Toast.module.css'

export default function Toast({ msg, type }: ToastState) {
  if (!msg) return null
  return (
    <div className={`${styles.toast} ${type === 'error' ? styles.error : styles.success}`}>
      <span className={styles.icon}>{type === 'success' ? '✓' : '!'}</span>
      {msg}
    </div>
  )
}

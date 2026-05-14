'use client'

import styles from './Toast.module.css'

interface Props {
  msg: string
  type: 'success' | 'error'
}

export default function Toast({ msg, type }: Props) {
  if (!msg) return null
  return (
    <div className={`${styles.toast} ${type === 'error' ? styles.error : styles.success}`}>
      <span className={styles.icon}>{type === 'success' ? '✅' : '❌'}</span>
      {msg}
    </div>
  )
}

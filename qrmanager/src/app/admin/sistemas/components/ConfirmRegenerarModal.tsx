'use client'
import type { Sistema } from '../types/index'
import styles from './ConfirmModal.module.css'

interface Props {
  sistema: Sistema
  onClose: () => void
  onConfirm: (s: Sistema) => void
}

export default function ConfirmRegenerarModal({ sistema, onClose, onConfirm }: Props) {
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>

        <div className={styles.header}>
          <div className={styles.title}>Regenerar API Key</div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={`${styles.iconWrap} ${styles.iconRed}`}>🔑</div>
          <p className={styles.msg}>
            ¿Estás seguro de que deseas regenerar la{' '}
            <strong className={styles.textRed}>API Key</strong> del sistema
            <br />
            <strong className={styles.textDark}>{sistema.nombre}</strong>?
          </p>
          <div className={styles.warning}>
            ⚠️ La key anterior quedará <strong>invalidada inmediatamente</strong>.
            Todos los servicios que la usen dejarán de funcionar hasta que
            actualicen la nueva key.
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={`${styles.btnPrimary} ${styles.btnRed}`}
            onClick={() => onConfirm(sistema)}
          >
            Sí, regenerar key
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'
import type { Sistema } from '../types/index'
import styles from './ConfirmModal.module.css'

interface Props {
  sistema: Sistema
  onClose: () => void
  onConfirm: (s: Sistema) => void
}

export default function ConfirmModal({ sistema, onClose, onConfirm }: Props) {
  const isDeactivate = sistema.estado === 'activo'

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>
            {isDeactivate ? 'Desactivar sistema' : 'Activar sistema'}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={`${styles.iconWrap} ${isDeactivate ? styles.iconRed : styles.iconGreen}`}>
            {isDeactivate ? '🚫' : '✅'}
          </div>
          <p className={styles.msg}>
            ¿Estás seguro de que deseas{' '}
            <strong className={isDeactivate ? styles.textRed : styles.textGreen}>
              {isDeactivate ? 'desactivar' : 'activar'}
            </strong>{' '}
            el sistema<br />
            <strong className={styles.textDark}>{sistema.nombre}</strong>?
          </p>
          {isDeactivate && (
            <div className={styles.warning}>
              ⚠️ Los usuarios asignados a este sistema no podrán acceder mientras esté inactivo.
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
          <button
            className={`${styles.btnPrimary} ${isDeactivate ? styles.btnRed : styles.btnGreen}`}
            onClick={() => onConfirm(sistema)}
          >
            {isDeactivate ? 'Sí, desactivar' : 'Sí, activar'}
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'

import type { Usuario } from '../types/index'
import styles from './ConfirmModal.module.css'

interface Props {
  usuario: Usuario
  onClose: () => void
  onConfirm: (u: Usuario) => void
}

export default function ConfirmModal({ usuario, onClose, onConfirm }: Props) {
  const isSuspend = usuario.estado === 'activo'

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>

        <div className={styles.header}>
          <div className={styles.title}>
            {isSuspend ? 'Suspender usuario' : 'Reactivar usuario'}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={`${styles.iconWrap} ${isSuspend ? styles.iconRed : styles.iconGreen}`}>
            {isSuspend ? '🚫' : '✅'}
          </div>

          <p className={styles.msg}>
            ¿Estás seguro de que deseas{' '}
            <strong className={isSuspend ? styles.textRed : styles.textGreen}>
              {isSuspend ? 'suspender' : 'reactivar'}
            </strong>{' '}
            al usuario<br />
            <strong className={styles.textDark}>{usuario.nombre}</strong>?
          </p>

          {isSuspend && (
            <div className={styles.warning}>
              ⚠️ El usuario no podrá acceder al panel de administración mientras esté suspendido.
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={`${styles.btnPrimary} ${isSuspend ? styles.btnRed : styles.btnGreen}`}
            onClick={() => onConfirm(usuario)}
          >
            {isSuspend ? 'Sí, suspender' : 'Sí, reactivar'}
          </button>
        </div>
      </div>
    </div>
  )
}

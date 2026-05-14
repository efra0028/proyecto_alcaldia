'use client'

import type { QrCodigo } from '../types'
import styles from './ConfirmarEliminarModal.module.css'

interface Props {
  qr: QrCodigo
  onClose: () => void
  onConfirmar: () => void
}

export default function ConfirmarEliminarModal({ qr, onClose, onConfirmar }: Props) {
  const reg = qr.registro

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleConfirmar() {
    onConfirmar()
    onClose()
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>

        {/* Icono de advertencia */}
        <div className={styles.iconWrap}>
          <div className={styles.iconCircle}>🗑️</div>
        </div>

        {/* Texto */}
        <div className={styles.content}>
          <h2 className={styles.title}>Eliminar código QR</h2>
          <p className={styles.desc}>
            Esta acción no se puede deshacer. El código QR y todos sus datos
            asociados serán eliminados permanentemente.
          </p>

          {/* Tarjeta del QR a eliminar */}
          <div className={styles.qrCard}>
            <div className={styles.qrCardRow}>
              <span className={styles.qrCardLabel}>Referencia</span>
              <span className={styles.qrCardVal}>
                {reg?.referencia_externa ?? '—'}
              </span>
            </div>
            <div className={styles.qrCardRow}>
              <span className={styles.qrCardLabel}>Sistema</span>
              <span className={styles.qrCardVal}>
                {reg?.sistema?.icono} {reg?.sistema?.nombre ?? '—'}
              </span>
            </div>
            <div className={styles.qrCardRow}>
              <span className={styles.qrCardLabel}>Código único</span>
              <code className={styles.qrCardCode}>
                {qr.codigo_unico.slice(0, 20)}…
              </code>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className={styles.footer}>
          <button className={styles.btnCancelar} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.btnEliminar} onClick={handleConfirmar}>
            Sí, eliminar QR
          </button>
        </div>
      </div>
    </div>
  )
}
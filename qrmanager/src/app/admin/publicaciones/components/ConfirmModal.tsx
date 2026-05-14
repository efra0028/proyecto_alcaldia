'use client'

import type { Publicacion } from '../types/index'
import { truncate } from '../utils/format'
import styles from './ConfirmModal.module.css'

interface Props {
  publicacion: Publicacion
  accion: 'eliminar' | 'archivar' | 'publicar'
  onClose: () => void
  onConfirm: (p: Publicacion) => void
}

const META = {
  eliminar: {
    titulo: 'Eliminar publicación',
    icon: '🗑️',
    iconCls: 'iconRed',
    msg: (nombre: string) => (
      <>
        ¿Estás seguro de que deseas{' '}
        <strong className={styles.textRed}>eliminar</strong> la publicación<br />
        <strong className={styles.textDark}>&ldquo;{nombre}&rdquo;</strong>? 
      </>
    ),
    warning: 'Esta acción no se puede deshacer. La publicación se eliminará permanentemente.',
    btnCls: 'btnRed',
    btnLabel: 'Sí, eliminar',
  },
  archivar: {
    titulo: 'Archivar publicación',
    icon: '📦',
    iconCls: 'iconAmber',
    msg: (nombre: string) => (
      <>
        ¿Deseas <strong className={styles.textAmber}>archivar</strong> la publicación<br />
        <strong className={styles.textDark}>&ldquo;{nombre}&rdquo;</strong>? 
      </>
    ),
    warning: 'La publicación dejará de ser visible para los ciudadanos.',
    btnCls: 'btnAmber',
    btnLabel: 'Sí, archivar',
  },
  publicar: {
    titulo: 'Publicar',
    icon: '🚀',
    iconCls: 'iconGreen',
    msg: (nombre: string) => (
      <>
        ¿Deseas <strong className={styles.textGreen}>publicar</strong><br />
        <strong className={styles.textDark}>&ldquo;{nombre}&rdquo;</strong>? 
      </>
    ),
    warning: null,
    btnCls: 'btnGreen',
    btnLabel: 'Sí, publicar',
  },
}

export default function ConfirmModal({ publicacion, accion, onClose, onConfirm }: Props) {
  const meta = META[accion]

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>

        <div className={styles.header}>
          <div className={styles.title}>{meta.titulo}</div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={`${styles.iconWrap} ${styles[meta.iconCls]}`}>
            {meta.icon}
          </div>

          <p className={styles.msg}>
            {meta.msg(truncate(publicacion.titulo, 50))}
          </p>

          {meta.warning && (
            <div className={styles.warning}>
              ⚠️ {meta.warning}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={`${styles.btnPrimary} ${styles[meta.btnCls]}`}
            onClick={() => onConfirm(publicacion)}
          >
            {meta.btnLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

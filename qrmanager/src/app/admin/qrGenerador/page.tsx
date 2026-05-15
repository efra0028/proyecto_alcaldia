// src/app/admin/qrGenerador/page.tsx
'use client'

import { useState } from 'react'
import QrGeneradorModal from './components/QrGeneradorModal'
import styles from './page.module.css'

export default function QrGeneradorPage() {
  const [modalAbierto, setModalAbierto] = useState(false)

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>Administración › Generador QR</div>
          <h1 className={styles.title}>Generador de códigos QR</h1>
          <p className={styles.subtitle}>
            Crea QRs personalizados a partir de una URL o subiendo cualquier tipo de archivo.
          </p>
        </div>
        <button
          className={styles.btnPrimary}
          onClick={() => setModalAbierto(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Crear QR
        </button>
      </div>

      {/* ── Info cards ── */}
      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <div className={styles.infoCardIcon}>🔗</div>
          <div>
            <div className={styles.infoCardTitle}>QR desde URL</div>
            <div className={styles.infoCardDesc}>
              Genera un código QR que redirige a cualquier enlace web. Ideal para
              páginas, formularios o recursos en línea.
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoCardIcon}>📁</div>
          <div>
            <div className={styles.infoCardTitle}>QR desde archivo</div>
            <div className={styles.infoCardDesc}>
              Sube un PDF, Word, Excel, imagen u otro archivo. Al escanear el QR
              el usuario podrá descargarlo directamente.
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoCardIcon}>🎨</div>
          <div>
            <div className={styles.infoCardTitle}>Personalización</div>
            <div className={styles.infoCardDesc}>
              Ajusta colores, agrega el logo de la alcaldía y exporta en alta
              resolución (hasta 2048 px) para impresión.
            </div>
          </div>
        </div>
      </div>

      {/* ── Instrucciones de uso ── */}
      <div className={styles.stepsCard}>
        <div className={styles.stepsHeader}>
          <span className={styles.stepsEyebrow}>¿Cómo funciona?</span>
          <h2 className={styles.stepsTitle}>Tres pasos para tu QR</h2>
        </div>
        <div className={styles.stepsGrid}>
          {[
            {
              n: '01', icon: '📋',
              title: 'Elige el origen',
              desc: 'Selecciona si quieres generar el QR desde una URL o subiendo un archivo.',
            },
            {
              n: '02', icon: '🎨',
              title: 'Personaliza',
              desc: 'Aplica los colores institucionales, agrega el logo y ajusta las opciones.',
            },
            {
              n: '03', icon: '⬇️',
              title: 'Descarga',
              desc: 'Exporta el QR en PNG o JPEG a la resolución que necesites.',
            },
          ].map(step => (
            <div key={step.n} className={styles.stepItem}>
              <div className={styles.stepNum}>{step.n}</div>
              <div className={styles.stepIcon}>{step.icon}</div>
              <div className={styles.stepTitle}>{step.title}</div>
              <div className={styles.stepDesc}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Nota importante ── */}
      <div className={styles.noteBanner}>
        <span>ℹ️</span>
        <div>
          <strong>Nota:</strong> Este generador es una herramienta de utilidad para el personal GAMS.
          Los QRs generados con archivos subidos quedan almacenados en los servidores de la plataforma
          y pueden ser accedidos por cualquier persona con el enlace.
          Para QRs vinculados a registros de servicios municipales, usa el módulo{' '}
          <strong>QR Manager</strong>.
        </div>
      </div>

      {/* ── Modal ── */}
      {modalAbierto && (
        <QrGeneradorModal onClose={() => setModalAbierto(false)} />
      )}
    </div>
  )
}
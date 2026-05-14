// src/app/mas-informacion/components/AvisosUrgentes.tsx
import styles from './AvisosUrgentes.module.css'
import { AvisoUrgente } from '../types'

export function AvisosUrgentes({ avisos }: { avisos: AvisoUrgente[] }) {
  return (
    <div className={styles.container}>
      {avisos.map((aviso, i) => (
        <div key={i} className={styles.avisoCard}>
          <span className={styles.avisoIcon}>{aviso.icon}</span>
          <div className={styles.avisoContent}>
            <div className={styles.avisoLabel}>
              {aviso.label.toUpperCase()}
            </div>
            <div className={styles.avisoTexto}>{aviso.texto}</div>
          </div>
          <div className={styles.avisoFecha}>{aviso.fecha}</div>
        </div>
      ))}
    </div>
  )
}
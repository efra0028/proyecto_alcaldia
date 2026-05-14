// src/app/ubicacion/components/OfficeCard.tsx
"use client";

import styles from './OfficeCard.module.css'
import { Office } from '../types'

export function OfficeCard({ office }: { office: Office }) {
  return (
    <div className={`${styles.card} ${office.isMain ? styles.mainCard : ''}`}>
      {office.isMain && (
        <div className={styles.badge}>
          ⭐ Sede principal
        </div>
      )}
      <div className={styles.name}>{office.name}</div>
      <div className={styles.dept}>{office.dept}</div>
      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.detailIcon}>📍</span>
          <span>
            <strong>{office.address}</strong>
            {office.reference && (
              <>
                <br />
                <span className={styles.reference}>{office.reference}</span>
              </>
            )}
          </span>
        </div>
        <div className={styles.detail}>
          <span className={styles.detailIcon}>🕐</span>
          <span>{office.hours}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.detailIcon}>📞</span>
          <span>
            <a href={`tel:${office.phone.replace(/\s/g, "")}`} className={styles.phoneLink}>
              {office.phone}
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}
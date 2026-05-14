// src/app/ubicacion/components/HoursTable.tsx
"use client";

import styles from './HoursTable.module.css'
import { OfficeHour } from '../types'

export function HoursTable({ hours }: { hours: OfficeHour[] }) {
  return (
    <div className={styles.table}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>🕐</span>
        <h3>Horario de atención al público</h3>
      </div>
      {hours.map((row) => (
        <div key={row.day} className={styles.row}>
          <span className={styles.day}>{row.day}</span>
          {row.time === "Cerrado" ? (
            <span className={styles.closed}>{row.time}</span>
          ) : (
            <span className={styles.time}>{row.time}</span>
          )}
        </div>
      ))}
    </div>
  )
}
// src/app/ubicacion/components/TransportCard.tsx
"use client";

import styles from './TransportCard.module.css'
import { Transport } from '../types'

export function TransportCard({ transport }: { transport: Transport }) {
  return (
    <div className={styles.card}>
      <div className={styles.icon}>{transport.icon}</div>
      <div className={styles.name}>{transport.name}</div>
      <div className={styles.desc}>{transport.desc}</div>
    </div>
  )
}
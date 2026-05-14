// src/app/mas-informacion/components/TarjetaPublicacion.tsx
"use client";

import Link from 'next/link'
import styles from './TarjetaPublicacion.module.css'
import { Publicacion } from '../types'

const EMOJI_POR_TIPO: Record<string, string> = {
  Eventos: '🎪',
  Vialidad: '🚶',
  Cultura: '🎭',
  Avisos: '📢',
  Transporte: '🚌',
  default: '📋',
}

const BG_POR_TIPO: Record<string, string> = {
  Eventos: '#EEEDFE',
  Vialidad: '#FAEEDA',
  Cultura: '#E1F5EE',
  Avisos: '#FCEBEB',
  Transporte: '#E6F1FB',
  default: '#F1EFE8',
}

function formatFecha(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })
}

export function TarjetaPublicacion({ pub }: { pub: Publicacion }) {
  const tipo = pub.tipo.nombre
  const emoji = EMOJI_POR_TIPO[tipo] || EMOJI_POR_TIPO.default
  const bg = BG_POR_TIPO[tipo] || BG_POR_TIPO.default

  return (
    <Link href={`/resultado/${pub.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        {/* Image / Emoji Header */}
        <div className={styles.cardHeader} style={{ background: bg }}>
          {pub.adjuntos_urls?.portada ? (
            <img
              src={pub.adjuntos_urls.portada}
              alt=""
              className={styles.cardImage}
            />
          ) : (
            <span className={styles.cardEmoji}>{emoji}</span>
          )}
        </div>

        {/* Content */}
        <div className={styles.cardBody}>
          <div className={styles.cardMeta}>
            <span
              className={styles.cardType}
              style={{
                background: `${pub.tipo.color_hex}18`,
                color: pub.tipo.color_hex,
              }}
            >
              {tipo.toUpperCase()}
            </span>
            <span className={styles.cardDate}>
              {formatFecha(pub.fecha_publicacion)}
            </span>
          </div>

          <div className={styles.cardTitle}>{pub.titulo}</div>

          {pub.contenido.resumen && (
            <div className={styles.cardResumen}>
              {pub.contenido.resumen.substring(0, 80)}
              {pub.contenido.resumen.length > 80 ? '…' : ''}
            </div>
          )}

          <div className={styles.cardLinkText}>
            Leer más →
          </div>
        </div>
      </div>
    </Link>
  )
}
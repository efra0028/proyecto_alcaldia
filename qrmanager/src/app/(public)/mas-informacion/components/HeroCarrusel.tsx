// src/app/(public)/mas-informacion/components/HeroCarrusel.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './HeroCarrusel.module.css'
import Image from 'next/image'
import { PublicacionDestacada } from '../types/types'

export function HeroCarrusel({ slides }: { slides: PublicacionDestacada[] }) {
  const [actual, setActual] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const ir = useCallback((n: number) => {
    setActual(((n % slides.length) + slides.length) % slides.length)
  }, [slides.length])

  const iniciarTimer = useCallback(() => {
    timerRef.current = setInterval(() => setActual(a => (a + 1) % slides.length), 5000)
  }, [slides.length])

  useEffect(() => {
    iniciarTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [iniciarTimer])

  const pausar = () => { if (timerRef.current) clearInterval(timerRef.current) }
  const reanudar = () => iniciarTimer()

  if (!slides.length) return null

  return (
    <div
      className={styles.carrusel}
      onMouseEnter={pausar}
      onMouseLeave={reanudar}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`${styles.slide} ${i === actual ? styles.slideActive : ''}`}
        >
        {slide.imagen_url ? (
          <div className={styles.slideBgImagen}>
            <Image
              src={slide.imagen_url}
              alt={slide.titulo}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              priority={i === 0}
            />
          </div>
        ) : (
            <div
              className={styles.slideBg}
              style={{ background: `linear-gradient(135deg, ${slide.tag_color}33, #000)` }}
            >
              <span className={styles.slideEmoji}>{slide.emoji_fallback}</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className={styles.slideOverlay} />

          {/* Content */}
          <div className={styles.slideContent}>
            <div>
              <span
                className={styles.slideTag}
                style={{ background: slide.tag_color }}
              >
                {slide.tag.toUpperCase()} · {slide.fecha}
              </span>
            </div>
            <div className={styles.slideTitle}>{slide.titulo}</div>
            {slide.subtitulo && (
              <div className={styles.slideSubtitle}>{slide.subtitulo}</div>
            )}
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button onClick={() => ir(actual - 1)} className={`${styles.navBtn} ${styles.navPrev}`} aria-label="Anterior">‹</button>
      <button onClick={() => ir(actual + 1)} className={`${styles.navBtn} ${styles.navNext}`} aria-label="Siguiente">›</button>

      {/* Indicators */}
      <div className={styles.indicators}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => ir(i)}
            className={`${styles.indicator} ${i === actual ? styles.indicatorActive : ''}`}
            aria-label={`Ir a diapositiva ${i + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className={styles.counter}>
        {actual + 1} / {slides.length}
      </div>
    </div>
  )
}
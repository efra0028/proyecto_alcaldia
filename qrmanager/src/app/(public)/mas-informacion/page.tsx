// src/app/(public)/mas-informacion/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import SiteFooter from '../components/SiteFooter'
import styles from './page.module.css'
import { Publicacion, AvisoUrgente } from './types/types'   // ← PublicacionDestacada ya no se usa aquí
import { HeroCarruselConectado } from './components/HeroCarruselConectado'  // ← usa el conectado
import { TarjetaPublicacion } from './components/TarjetaPublicacion'
import { AvisosUrgentes } from './components/AvisosUrgentes'
import { publicacionesService, type PublicacionResponse } from '../../lib/api-services'

const AVISOS_URGENTES: AvisoUrgente[] = [
  { icon: '⚠️', label: 'Vialidad', texto: 'Av. Hernando Siles cerrada por obras hasta el viernes 23.', fecha: 'Hoy' },
  { icon: '📋', label: 'Trámites', texto: 'Oficinas cerradas el miércoles 21 por feriado nacional.',  fecha: '13 may' },
]

// DESTACADAS eliminado — ahora viene de la BD vía HeroCarruselConectado ✓

function normalizePublicacion(pub: PublicacionResponse): Publicacion {
  return {
    id:     String(pub.id ?? ''),
    titulo: String(pub.titulo ?? ''),
    contenido: {
      resumen: String((pub.contenido as Record<string, unknown>)?.resumen ?? ''),
      cuerpo:  String((pub.contenido as Record<string, unknown>)?.cuerpo  ?? ''),
    },
    adjuntos_urls: pub.adjuntos_urls
      ? {
          portada: String((pub.adjuntos_urls as Record<string, unknown>)?.portada ?? ''),
          extra: Array.isArray((pub.adjuntos_urls as Record<string, unknown>)?.archivos)
            ? ((pub.adjuntos_urls as Record<string, unknown>)?.archivos as string[]).map(String)
            : [],
        }
      : null,
    fecha_publicacion: String(pub.fecha_publicacion ?? ''),
    fecha_vencimiento: pub.fecha_vencimiento ?? undefined,
    estado: String(pub.estado?.nombre ?? ''),
    tipo: {
      id:        Number(pub.tipo?.id        ?? 0),
      nombre:    String(pub.tipo?.nombre    ?? 'General'),
      color_hex: String(pub.tipo?.color_hex ?? '#000000'),
    },
  }
}

export default function MasInformacionPage() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [mostrarTodas,    setMostrarTodas]    = useState(false)
  const [publicaciones,   setPublicaciones]   = useState<Publicacion[]>([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState<string | null>(null)

  useEffect(() => {
    let active = true

    publicacionesService.getActivas()
      .then((result: PublicacionResponse[]) => {
        if (!active) return
        setPublicaciones(result.map(normalizePublicacion))
        setCategoriaActiva('Todos')
      })
      .catch((err: Error) => {
        if (!active) return
        setError(err?.message || 'No se pudieron cargar las publicaciones')
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  const categories = useMemo(() => {
    const tipos = Array.from(new Set(publicaciones.map((p) => p.tipo.nombre)))
    return ['Todos', ...tipos]
  }, [publicaciones])

  const filtradas = publicaciones.filter((p) =>
    categoriaActiva === 'Todos' || p.tipo.nombre === categoriaActiva,
  )
  const visibles = mostrarTodas ? filtradas : filtradas.slice(0, 4)

  return (
    <>
      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowLine} />
            Portal GAMS · Noticias y avisos
          </div>
          <h1 className={styles.heroTitle}>
            Novedades del <em>municipio</em>
          </h1>
          <p className={styles.heroSub}>
            Eventos, restricciones, avisos y noticias oficiales de la Alcaldía de Sucre.
            Información actualizada en tiempo real.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {/* Carrusel conectado a la BD */}
        <HeroCarruselConectado />

        {/* Publicaciones */}
        <div style={{ marginBottom: 48 }}>
          <div className={styles.sectionLabel}>Noticias municipales</div>
          <h2 className={styles.sectionHeading}>Publicaciones <em>recientes</em></h2>
          <p className={styles.sectionDesc}>Información oficial de la Alcaldía de Sucre.</p>

          <div className={styles.filters}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategoriaActiva(cat); setMostrarTodas(false) }}
                className={`${styles.filterBtn} ${categoriaActiva === cat ? styles.filterBtnActive : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⏳</div>
              <p className={styles.emptyText}>Cargando publicaciones...</p>
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⚠️</div>
              <p className={styles.emptyText}>{error}</p>
            </div>
          ) : visibles.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <p className={styles.emptyText}>No hay publicaciones en esta categoría.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {visibles.map((pub) => <TarjetaPublicacion key={pub.id} pub={pub} />)}
            </div>
          )}

          {filtradas.length > 4 && (
            <button
              onClick={() => setMostrarTodas((v) => !v)}
              className={styles.showMoreBtn}
            >
              {mostrarTodas
                ? 'Mostrar menos ↑'
                : `Ver todas las publicaciones (${filtradas.length - 4} más) ↓`}
            </button>
          )}
        </div>

        {/* Avisos Urgentes */}
        <div style={{ marginBottom: 48 }}>
          <div className={styles.sectionLabel}>Avisos urgentes</div>
          <h2 className={styles.sectionHeading}>Lo que debes <em>saber hoy</em></h2>
          <AvisosUrgentes avisos={AVISOS_URGENTES} />
        </div>

        {/* CTA */}
        <div className={styles.ctaBanner}>
          <div className={styles.ctaBannerText}>
            <h3>¿Necesitas verificar un servicio?</h3>
            <p>Consulta la habilitación de taxis, permisos y credenciales municipales al instante.</p>
          </div>
          <Link href="/" className={styles.ctaBannerBtn}>Ver servicios →</Link>
        </div>
      </div>

      <SiteFooter />
    </>
  )
}
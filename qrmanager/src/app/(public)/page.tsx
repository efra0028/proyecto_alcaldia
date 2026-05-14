'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StatusBar from './components/StatusBar'
import SiteFooter from './components/SiteFooter'
import { sistemasService } from '@/app/lib/api-services'
import Image from 'next/image'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface SistemaPublico {
  id: string
  nombre: string
  descripcion: string
  color_hex: string
  icono?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EMOJI_FALLBACK: Record<string, string> = {
  taxi: '🚕', transporte: '🚌', cultura: '🎭',
  tráfico: '🚦', trafico: '🚦', baile: '🎵',
  credencial: '🪪', personal: '🪪',
}

function emojiPorNombre(nombre: string): string {
  const key = nombre.toLowerCase()
  for (const [k, v] of Object.entries(EMOJI_FALLBACK)) {
    if (key.includes(k)) return v
  }
  return '🏛️'
}

function bgPorColor(hex: string): string { return hex + '18' }

// ─── Componente principal ─────────────────────────────────────────────────────

export default function LandingPage() {
  const [search, setSearch] = useState('')
  const [sistemas, setSistemas] = useState<SistemaPublico[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    sistemasService.getPublicos()
      .then(setSistemas)
      .catch(() => setSistemas([]))
      .finally(() => setCargando(false))
  }, [])

  const filtered = sistemas.filter(s =>
    s.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (s.descripcion ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            GAMS · Sistema QR-Manager
          </div>
          <h1 className="hero-title">
            Verifica cualquier<br />
            servicio <em>municipal</em><br />
            al instante.
          </h1>
          <p className="hero-sub">
            Consulta la habilitación y vigencia de conductores, permisos y
            credenciales municipales de forma rápida y segura.
          </p>
        </div>
        <div className="hero-stat">
        <Image
          src="../../../assets/img/logoSucre.png"
          alt="Descripción de mi imagen"
          width={300}  
          height={300}        
        />
          {cargando ? '…' : sistemas.length}
          <span>servicios activos</span>
        </div>

      </section>

      <StatusBar />

      {/* ── Servicios ────────────────────────────────────────────── */}
      <main className="main">
        <div className="search-wrap">
          <div className="search-bar">
            <span className="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              className="search-input"
              type="text"
              placeholder="Buscar servicio…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="section-header">
          <span className="section-title">Servicios disponibles</span>
          <span className="section-count">
            {filtered.length} servicio{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="services-grid">
          {cargando ? (
            <div className="empty-state">Cargando servicios…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              No se encontraron servicios para &ldquo;{search}&rdquo;
            </div>
          ) : (
            filtered.map(s => (
              <Link
                key={s.id}
                href={`/verificar/${s.id}`}
                className="service-card"
                style={{
                  ['--card-color' as string]: s.color_hex,
                  ['--card-bg' as string]: bgPorColor(s.color_hex),
                }}
              >
                <div className="card-top">
                  <div className="card-icon">{s.icono ?? emojiPorNombre(s.nombre)}</div>
                  <div className="card-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div className="card-name">{s.nombre}</div>
                <div className="card-desc">{s.descripcion}</div>
                <div className="card-footer">
                  <span className="card-tag">
                    <span className="card-tag-dot" />
                    Municipal
                  </span>
                  <span className="card-action">Consultar →</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
'use client'

import Link from 'next/link'
import StatCard from './components/StatCard'
import ActividadReciente from './components/ActividadReciente'
import SistemasResumen from './components/SistemasResumen'
import { useDashboard } from './hooks/useDashboard'
import styles from './page.module.css'

const ACCESOS_RAPIDOS = [
  { label: 'Nuevo QR',      icono: '⬛', href: '/admin/qr/nuevo' },
  { label: 'Registro',      icono: '📋', href: '/admin/registros/nuevo' },
  { label: 'Publicación',   icono: '📰', href: '/admin/publicaciones/nueva' },
  { label: 'Escaneos',      icono: '📈', href: '/admin/escaneos' },
  { label: 'Usuarios',      icono: '👥', href: '/admin/usuarios' },
  { label: 'Configuración', icono: '⚙️', href: '/admin/sistemas' },
]

const PROGRESS_DEFAULT = [84, 91, 62, 70]

function obtenerSaludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatFecha() {
  return new Date().toLocaleDateString('es-BO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ── Skeleton para stats mientras carga ──────────────────────────────────────
function StatsSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: 120,
            borderRadius: 12,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
          }}
        />
      ))}
    </>
  )
}

export default function AdminDashboard() {
  const { stats, sistemas, actividad, cargando, error } = useDashboard()

  return (
    <>
      {/* ── ALERTA ─────────────────────────────────────────────────── */}
      {error && (
        <div className={styles.alertBanner} style={{ background: '#FEF2F2', borderColor: '#FCA5A5' }}>
          <span>⚠️</span>
          <span>
            <strong>Error al cargar datos:</strong> {error}.{' '}
            <button
              onClick={() => window.location.reload()}
              style={{ color: '#B91C1C', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Reintentar →
            </button>
          </span>
        </div>
      )}

      {/* ── BIENVENIDA ─────────────────────────────────────────────── */}
      <div className={styles.welcome}>
        <div className={styles.welcomeText}>
          <h1>{obtenerSaludo()} 👋</h1>
          <p style={{ textTransform: 'capitalize' }}>{formatFecha()}</p>
        </div>
        <div className={styles.welcomeActions}>
          <Link href="/admin/registros/nuevo" className={styles.btnSecondary}>
            📋 Nuevo registro
          </Link>
          <Link href="/admin/qr/nuevo" className={styles.btnPrimary}>
            ⬛ Generar QR
          </Link>
        </div>
      </div>

      {/* ── ACCESOS RÁPIDOS ────────────────────────────────────────── */}
      <div className={styles.quickAccess}>
        <div className={styles.quickAccessTitle}>Accesos rápidos</div>
        <div className={styles.quickGrid}>
          {ACCESOS_RAPIDOS.map(item => (
            <Link key={item.label} href={item.href} className={styles.quickItem}>
              <span className={styles.quickIcon}>{item.icono}</span>
              <span className={styles.quickLabel}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── STATS ──────────────────────────────────────────────────── */}
      <div className={styles.statsGrid}>
        {cargando ? (
          <StatsSkeleton />
        ) : (
          stats.map((stat, i) => (
            <StatCard
              key={stat.id}
              stat={stat}
              progress={PROGRESS_DEFAULT[i] ?? 70}
            />
          ))
        )}
      </div>

      {/* ── GRILLA PRINCIPAL ───────────────────────────────────────── */}
      <div className={styles.mainGrid}>
        <SistemasResumen sistemas={cargando ? undefined : sistemas} />
        <ActividadReciente actividades={cargando ? undefined : actividad} />
      </div>
    </>
  )
}
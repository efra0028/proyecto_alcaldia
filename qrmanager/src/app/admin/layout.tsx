'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from './hooks/useAdminAuth'
import AdminSidebar from './components/AdminSidebar'
import AdminNavbar from './components/AdminNavbar'
import styles from './layout.module.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, cargando, cerrarSesion } = useAdminAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // ── Redirect si no hay sesión ────────────────────────────────────────────
  useEffect(() => {
    if (!cargando && !user) {
      window.location.href = '/login'
    }
  }, [cargando, user])

  // ── Loading ──────────────────────────────────────────────────────────────
  if (cargando || !user) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#F5F4F0', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: '#C8102E',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>🏛️</div>
      <div style={{ fontSize: 13, color: '#6B6B67' }}>
        {cargando ? 'Verificando sesión...' : 'Redirigiendo...'}
      </div>
    </div>
  )

  return (
    <div className={styles.wrapper}>
      <AdminSidebar
        user={user}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onCerrarSesion={cerrarSesion}
      />
      <div className={`${styles.main} ${collapsed ? styles.mainCollapsed : ''}`}>
        <AdminNavbar
          user={user}
          collapsed={collapsed}
          onToggleSidebar={() => {
            if (window.innerWidth <= 768) setMobileOpen(v => !v)
            else setCollapsed(v => !v)
          }}
        />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}
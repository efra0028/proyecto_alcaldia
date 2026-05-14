'use client'

import { usePathname } from 'next/navigation'
import type { AdminUser } from '../types'
import styles from './AdminNavbar.module.css'

const TITULOS: Record<string, { titulo: string; sub: string }> = {
  '/admin':               { titulo: 'Dashboard',     sub: 'Vista general del sistema' },
  '/admin/registros':     { titulo: 'Registros',     sub: 'Gestión de habilitaciones' },
  '/admin/qr':            { titulo: 'Códigos QR',    sub: 'Generación y seguimiento' },
  '/admin/publicaciones': { titulo: 'Publicaciones', sub: 'Noticias y avisos GAMS' },
  '/admin/sistemas':      { titulo: 'Sistemas',      sub: 'Configuración de servicios' },
  '/admin/escaneos':      { titulo: 'Escaneos',      sub: 'Analítica de escaneos QR' },
  '/admin/auditoria':     { titulo: 'Auditoría',     sub: 'Registro de actividad' },
  '/admin/usuarios':      { titulo: 'Usuarios',      sub: 'Gestión de accesos' },
  '/admin/roles':         { titulo: 'Roles',         sub: 'Permisos del sistema' },
}

interface Props {
  user: AdminUser
  collapsed: boolean
  onToggleSidebar: () => void
}

export default function AdminNavbar({ user, collapsed, onToggleSidebar }: Props) {
  const pathname = usePathname()
  const pagina = TITULOS[pathname] ?? { titulo: 'QR-Manager', sub: 'Panel de administración' }
  const iniciales = user.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')

  const navbarClass = [
    styles.navbar,
    collapsed ? styles.navbarCollapsed : '',
  ].filter(Boolean).join(' ')

  return (
    <header className={navbarClass}>
      {/* Toggle sidebar */}
      <button className={styles.toggleBtn} onClick={onToggleSidebar} title="Contraer menú">
        ☰
      </button>

      {/* Título de página */}
      <div className={styles.pageTitle}>
        <div className={styles.pageTitleText}>{pagina.titulo}</div>
        <div className={styles.pageBreadcrumb}>GAMS · {pagina.sub}</div>
      </div>

      {/* Acciones */}
      <div className={styles.actions}>
        {/* Estado sistema */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div className={styles.statusDot} />
          <span style={{ fontSize: 11, color: '#15803D', fontWeight: 500 }}>En línea</span>
        </div>

        <div className={styles.divider} />

        {/* Notificaciones */}
        <button className={styles.actionBtn} title="Notificaciones">
          🔔
          <span className={styles.notifBadge} />
        </button>

        {/* Búsqueda rápida */}
        <button className={styles.actionBtn} title="Búsqueda rápida">
          🔍
        </button>

        <div className={styles.divider} />

        {/* Perfil */}
        <div className={styles.profileChip}>
          <div className={styles.profileAvatar}>{iniciales}</div>
          <span className={styles.profileName}>{user.nombre.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  )
}
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { AdminUser, NavItem } from '../types'
import styles from './AdminSidebar.module.css'

const NAV_ITEMS: { seccion: string; items: NavItem[] }[] = [
  {
    seccion: 'Principal',
    items: [
      { id: 'dashboard', label: 'Dashboard',       icono: '📊', href: '/admin' },
    ],
  },
  {
    seccion: 'Gestión',
    items: [
      { id: 'usuarios',     label: 'Usuarios',         icono: '�', href: '/admin/usuarios' },
      { id: 'qr',           label: 'Códigos QR',       icono: '⬛', href: '/admin/qr-generador', },
      { id: 'publicaciones',label: 'Publicaciones',    icono: '📰', href: '/admin/publicaciones' },
      { id: 'sistemas',     label: 'Sistemas',         icono: '⚙️', href: '/admin/sistemas' },
    ],
  },
  {
    seccion: 'Reportes',
    items: [
      { id: 'escaneos',  label: 'Escaneos',       icono: '📈', href: '/admin/escaneos' },
      { id: 'auditoria', label: 'Auditoría',       icono: '🔍', href: '/admin/auditoria' },
    ],
  },
  {
    seccion: 'Configuración',
    items: [
      { id: 'usuarios', label: 'Usuarios',    icono: '👥', href: '/admin/usuarios' },
    ],
  },
]

const ROL_LABEL: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  operador: 'Operador',
}

interface Props {
  user: AdminUser
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
  onCerrarSesion: () => void
}

export default function AdminSidebar({
  user, collapsed, mobileOpen, onCloseMobile, onCerrarSesion,
}: Props) {
  const pathname = usePathname()

  const sidebarClass = [
    styles.sidebar,
    collapsed ? styles.sidebarCollapsed : '',
    mobileOpen ? styles.sidebarOpen : '',
  ].filter(Boolean).join(' ')

  const iniciales = user.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && <div className={styles.overlay} onClick={onCloseMobile} />}

      <aside className={sidebarClass}>
        {/* Marca */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}>🏛️</div>
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>QR-Manager</div>
            <div className={styles.brandSub}>GAMS · Administración</div>
          </div>
        </div>

        {/* Navegación */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(seccion => (
            <div key={seccion.seccion} className={styles.navSection}>
              <div className={styles.navSectionLabel}>{seccion.seccion}</div>
              {seccion.items.map(item => {
                const isActive = pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  >
                    <span className={styles.navItemIcon}>{item.icono}</span>
                    <span className={styles.navItemLabel}>{item.label}</span>
                    {item.badge && (
                      <span className={styles.navBadge}>{item.badge}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Usuario */}
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>{iniciales}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div className={styles.userName}>{user.nombre}</div>
            <div className={styles.userRole}>{ROL_LABEL[user.rol]}</div>
          </div>
          <button className={styles.logoutBtn} onClick={onCerrarSesion} title="Cerrar sesión">
            ⏻
          </button>
        </div>
      </aside>
    </>
  )
}
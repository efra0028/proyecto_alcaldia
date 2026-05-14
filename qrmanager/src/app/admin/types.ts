// ─── Tipos del módulo Admin ──────────────────────────────────────────────────

export interface AdminUser {
  id: number
  nombre: string
  email: string
  rol: 'superadmin' | 'admin' | 'operador' | 'user'
  avatar?: string
  sistema_asignado?: string
}

export interface StatCard {
  id: string
  titulo: string
  valor: number | string
  cambio: number        // porcentaje respecto al mes anterior
  icono: string
  color: string         // hex del color del sistema o del stat
  descripcion: string
}

export interface ActividadReciente {
  id: number
  tipo: 'qr_generado' | 'registro_creado' | 'publicacion' | 'verificacion' | 'suspension'
  descripcion: string
  usuario: string
  sistema: string
  tiempo: string        // "hace 5 min", "hace 2h", etc.
  color: string
}

export interface SistemaResumen {
  id: string
  nombre: string
  color_hex: string
  emoji: string
  total_registros: number
  registros_vigentes: number
  qrs_generados: number
  escaneos_hoy: number
}

export interface NavItem {
  id: string
  label: string
  icono: string
  href: string
  badge?: number
  children?: NavItem[]
}
// src/app/admin/auditoria/types/index.ts

export type AccionAuditoria = 'INSERT' | 'UPDATE' | 'DELETE'

export interface AuditoriaUsuario {
  id: number
  nombre: string
  email: string
}

export interface AuditoriaEntry {
  id: number
  tabla_nombre: string
  registro_id: string
  accion: AccionAuditoria
  usuario_id: number | null
  datos_antes: Record<string, unknown> | null
  datos_despues: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  usuario: AuditoriaUsuario | null
}

export interface AuditoriaFiltros {
  tabla: string        // '' = todas
  accion: string       // '' = todas
  busqueda: string     // filtra registro_id o usuario email
}

// Tablas conocidas en el sistema
export const TABLAS_CONOCIDAS = [
  { value: '',              label: 'Todas las tablas' },
  { value: 'usuarios',      label: 'Usuarios' },
  { value: 'sistemas',      label: 'Sistemas' },
  { value: 'registros',     label: 'Registros' },
  { value: 'qr_codigos',    label: 'QR Códigos' },
  { value: 'publicaciones', label: 'Publicaciones' },
  { value: 'escaneos',      label: 'Escaneos' },
]

export const ACCIONES: { value: string; label: string }[] = [
  { value: '',       label: 'Todas las acciones' },
  { value: 'INSERT', label: 'Creación' },
  { value: 'UPDATE', label: 'Modificación' },
  { value: 'DELETE', label: 'Eliminación' },
]
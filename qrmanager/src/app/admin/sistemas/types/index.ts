export type EstadoSistema = 'activo' | 'inactivo'

export interface Sistema {
  id: string
  nombre: string
  descripcion: string
  color_hex: string
  logo_url: string
  api_key: string
  schema_campos: object | null
  is_active: boolean
  estado: EstadoSistema
  created_at: string
  update_at: string
  created_by: number
  updated_by: number
  usuariosCount: number
}

export interface SistemaFormData {
  id?: string
  nombre: string
  descripcion: string
  color_hex: string
  logo_url: string
  schema_campos: object | null
}

export interface FormErrors {
  nombre?: string
  descripcion?: string
  color_hex?: string
  logo_url?: string
}

export interface ToastState {
  msg: string
  type: 'success' | 'error'
}

export type SortKey = 'nombre' | 'estado' | 'created_at' | 'usuariosCount'
export type SortDir = 'asc' | 'desc'
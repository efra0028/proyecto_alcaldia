export type EstadoPublicacion = 'borrador' | 'publicado' | 'archivado'

export interface TipoPublicacion {
  id: number
  nombre: string
  color_hex: string
}

export interface Publicacion {
  id: string                       // uuid
  tipo_id: number
  tipo?: TipoPublicacion
  titulo: string
  contenido: {
    resumen: string
    cuerpo?: string
  }
  adjuntos_urls: {
    portada?: string
    archivos?: string[]
  }
  fecha_publicacion: string        // ISO date
  fecha_vencimiento?: string
  estado_id: number
  estado?: EstadoPublicacion
  destacada: boolean
  orden_carrusel: number
  created_at?: string
  updated_at?: string
  created_by?: number
  updated_by?: number
}

export interface PublicacionFormData {
  id?: string
  tipo_id: number
  titulo: string
  resumen: string
  cuerpo: string
  portada_url: string
  archivos_urls: string
  fecha_publicacion: string
  fecha_vencimiento: string
  estado: EstadoPublicacion
  destacada: boolean
  orden_carrusel: number
}

export interface FormErrors {
  titulo?: string
  resumen?: string
  fecha_publicacion?: string
  tipo_id?: string
}

export interface ToastState {
  msg: string
  type: 'success' | 'error'
}

export type SortKey = 'titulo' | 'fecha_publicacion' | 'estado' | 'destacada'
export type SortDir = 'asc' | 'desc'
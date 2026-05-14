export type Rol = 'superadmin' | 'admin' | 'operador'
export type EstadoUsuario = 'activo' | 'suspendido'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: Rol
  estado: EstadoUsuario
  ultimoAcceso: string
  creado: string
  sistemas: string[]
}

export interface UsuarioFormData {
  id?: number
  nombre: string
  email: string
  rol: Rol
  estado: EstadoUsuario
  sistemas: string[]
  password: string
}

export interface FormErrors {
  nombre?: string
  email?: string
  password?: string
  sistemas?: string
}

export interface ToastState {
  msg: string
  type: 'success' | 'error'
}

export type SortKey = 'nombre' | 'rol' | 'estado' | 'ultimoAcceso'
export type SortDir = 'asc' | 'desc'

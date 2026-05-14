import { ESTADOS_REGISTRO, SISTEMAS } from '../data/constants'
import type { EstadoRegistro } from '../types'

export function formatDate(str?: string): string {
  if (!str) return '—'
  const [y, m, d] = str.split('T')[0].split('-')
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${d} ${months[parseInt(m) - 1]} ${y}`
}

export function isVencido(fecha?: string): boolean {
  if (!fecha) return false
  return new Date(fecha) < new Date()
}

export function getEstadoMeta(estado?: EstadoRegistro) {
  return ESTADOS_REGISTRO.find((e) => e.value === estado) ?? ESTADOS_REGISTRO[0]
}

export function getSistemaMeta(sistema_id: string) {
  return SISTEMAS.find((s) => s.id === sistema_id)
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

/** Genera un UUID v4 simple para el frontend mock */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** Valida si un string es JSON válido y retorna el objeto o null */
export function parseJsonSafe(str: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(str)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
}

/** Formatea los datos_display para PDF: convierte claves snake_case a Title Case */
export function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
import { ESTADOS, TIPOS } from '../data/constants'
import type { EstadoPublicacion } from '../types'

export function formatDate(str?: string): string {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${d} ${months[parseInt(m) - 1]} ${y}`
}

export function isVencida(fecha?: string): boolean {
  if (!fecha) return false
  return new Date(fecha) < new Date()
}

export function getEstadoMeta(estado?: EstadoPublicacion) {
  return ESTADOS.find((e) => e.value === estado) ?? ESTADOS[0]
}

export function getTipoMeta(tipo_id: number) {
  return TIPOS.find((t) => t.id === tipo_id)
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}
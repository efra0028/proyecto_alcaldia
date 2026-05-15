// src/app/admin/qrGenerador/utils/qr.ts

import type { QrFormatoDescarga } from '../types'

// ── URL ────────────────────────────────────────────────────────

export function isValidUrl(value: string): boolean {
  if (!value.trim()) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function slugifyUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url)
    return (hostname + pathname)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)
  } catch {
    return 'qr-code'
  }
}

// ── Archivos ───────────────────────────────────────────────────

export const ALLOWED_MIMETYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
  'application/zip', 'application/x-rar-compressed',
]

export const MIME_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/vnd.ms-powerpoint': 'PowerPoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
  'text/plain': 'TXT',
  'text/csv': 'CSV',
  'application/zip': 'ZIP',
  'application/x-rar-compressed': 'RAR',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'image/webp': 'WebP',
  'image/svg+xml': 'SVG',
}

export const MIME_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.ms-powerpoint': '📑',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📑',
  'text/plain': '📃',
  'text/csv': '📃',
  'application/zip': '🗜️',
  'application/x-rar-compressed': '🗜️',
}

export function getMimeIcon(mime: string): string {
  if (mime.startsWith('image/')) return '🖼️'
  return MIME_ICONS[mime] ?? '📁'
}

export function getMimeLabel(mime: string): string {
  return MIME_LABELS[mime] ?? 'Archivo'
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

// ── Canvas / descarga ──────────────────────────────────────────

export function downloadCanvas(
  canvas: HTMLCanvasElement,
  slug: string,
  format: QrFormatoDescarga,
  exportSize: number,
): void {
  if (format === 'svg') return  // SVG se maneja aparte

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
  const ext = format === 'jpeg' ? 'jpg' : 'png'

  // Escalar a exportSize
  const offscreen = document.createElement('canvas')
  offscreen.width = exportSize
  offscreen.height = exportSize
  const ctx = offscreen.getContext('2d')
  if (!ctx) return
  ctx.drawImage(canvas, 0, 0, exportSize, exportSize)

  const link = document.createElement('a')
  link.download = `${slug}.${ext}`
  link.href = offscreen.toDataURL(mimeType, 0.95)
  link.click()
}

// ── Presets de color ───────────────────────────────────────────

export const PRESET_COLORS = [
  { label: 'GAMS Rojo',     fg: '#BE2D26', bg: '#FFFFFF' },
  { label: 'Oscuro clásico', fg: '#1E1A18', bg: '#FFFFFF' },
  { label: 'Inverso',        fg: '#FFFFFF', bg: '#1E1A18' },
  { label: 'Azul oficial',   fg: '#1D3557', bg: '#FFFFFF' },
  { label: 'Verde',          fg: '#2D6A4F', bg: '#FFFFFF' },
]

// ── Tamaños de exportación ─────────────────────────────────────

export const SIZE_OPTIONS = [
  { label: '512 px',  value: 512 },
  { label: '1024 px', value: 1024 },
  { label: '2048 px', value: 2048 },
]

// ── Corrección de errores ──────────────────────────────────────

export const ERROR_CORRECTION_LABELS: Record<string, string> = {
  L: '7%',
  M: '15%',
  Q: '25%',
  H: '30%',
}

// ── Upload al backend ──────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

export async function uploadArchivo(
  file: File,
  token: string,
): Promise<{ url: string; originalName: string; mimetype: string; size: number }> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_URL}/upload/archivo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `Error ${res.status}`)
  }

  return res.json()
}
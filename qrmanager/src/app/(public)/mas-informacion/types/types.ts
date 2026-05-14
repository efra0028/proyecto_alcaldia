import { PublicacionResponse } from '@/app/lib/api-services'

// ── Tipos que page.tsx necesita ──────────────────────────────────────────────

export interface Publicacion {
  id: string
  titulo: string
  contenido: {
    resumen: string
    cuerpo: string
  }
  adjuntos_urls: {
    portada: string
    extra: string[]
  } | null
  fecha_publicacion: string
  fecha_vencimiento?: string | null
  estado: string
  tipo: {
    id: number
    nombre: string
    color_hex: string
  }
}

export interface AvisoUrgente {
  icon: string
  label: string
  texto: string
  fecha: string
}

// ── Carrusel ─────────────────────────────────────────────────────────────────

export interface PublicacionDestacada {
  id: string          // ← string, no number
  titulo: string
  subtitulo?: string
  imagen_url?: string
  tag: string
  tag_color: string
  fecha: string
  orden: number
  emoji_fallback: string
  link_id: string     // ← string, no number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMOJI_MAP: Record<string, string> = {
  resolución: '📋',
  resolucion: '📋',
  convocatoria: '📣',
  comunicado: '📢',
  evento: '📅',
  noticia: '📰',
  aviso: '⚠️',
  decreto: '📜',
}

function emojiPorTipo(nombre: string): string {
  const key = nombre.toLowerCase()
  for (const [k, v] of Object.entries(EMOJI_MAP)) {
    if (key.includes(k)) return v
  }
  return '📌'
}

function formatearFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function adaptarPublicaciones(
  publicaciones: PublicacionResponse[],
): PublicacionDestacada[] {
  return publicaciones
    .filter((p) => p.destacada)
    .sort((a, b) => (a.orden_carrusel ?? 0) - (b.orden_carrusel ?? 0))
    .map((p) => {
      const contenido = (p.contenido ?? {}) as Record<string, unknown>
      const adjuntos  = (p.adjuntos_urls ?? {}) as Record<string, unknown>

      return {
        id:      p.id,           // string ✓
        link_id: p.id,           // string ✓
        titulo:  p.titulo,
        subtitulo:
          typeof contenido.subtitulo === 'string' ? contenido.subtitulo : undefined,
        imagen_url:
          typeof contenido.imagen_url === 'string' ? contenido.imagen_url
          : typeof adjuntos.portada === 'string'   ? adjuntos.portada
          : undefined,
        tag:           p.tipo?.nombre    ?? 'Publicación',
        tag_color:     p.tipo?.color_hex ?? '#6366f1',
        fecha:         formatearFecha(p.fecha_publicacion),
        orden:         p.orden_carrusel  ?? 0,
        emoji_fallback: emojiPorTipo(p.tipo?.nombre ?? ''),
      }
    })
}
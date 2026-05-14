'use client'

import { useState, useEffect } from 'react'
import {
  sistemasService,
  registrosService,
  escaneoService,
  publicacionesService,
  type SistemaBackendResponse,
} from '@/app/lib/api-services'
import type { StatCard, SistemaResumen, ActividadReciente } from '../types'

// ─── Tipos internos del hook ────────────────────────────────────────────────

interface DashboardStats {
  stats: StatCard[]
  sistemas: SistemaResumen[]
  actividad: ActividadReciente[]
  cargando: boolean
  error: string | null
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const EMOJI_MAP: Record<string, string> = {
  taxi: '🚕',
  transporte: '🚌',
  carnaval: '🎭',
  cultura: '🎭',
  tráfico: '🚦',
  trafico: '🚦',
  baile: '🎵',
  credencial: '🪪',
  personal: '🪪',
}

function emojiPorNombre(nombre: string): string {
  const key = nombre.toLowerCase()
  for (const [k, v] of Object.entries(EMOJI_MAP)) {
    if (key.includes(k)) return v
  }
  return '🏛️'
}

/**
 * Mapea un sistema del backend al formato SistemaResumen que usa el widget.
 * Los contadores (registros, escaneos) se rellenan con 0 si el backend
 * no tiene endpoints de resumen por sistema todavía.
 */
function mapSistema(s: SistemaBackendResponse): SistemaResumen {
  return {
    id: s.id,
    nombre: s.nombre,
    color_hex: s.color_hex ?? '#BE2D26',
    emoji: emojiPorNombre(s.nombre),
    total_registros: 0,
    registros_vigentes: 0,
    qrs_generados: 0,
    escaneos_hoy: 0,
  }
}

// ─── Hook principal ──────────────────────────────────────────────────────────

export function useDashboard(): DashboardStats {
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const [stats, setStats]       = useState<StatCard[]>([])
  const [sistemas, setSistemas] = useState<SistemaResumen[]>([])
  const [actividad, setActividad] = useState<ActividadReciente[]>([])

  useEffect(() => {
    let cancelled = false

    async function cargar() {
      try {
        // ── Cargar todo en paralelo ─────────────────────────────────────
        const [
          sistemasData,
          escaneoStats,
          registrosData,
          publicacionesData,
          escaneoRecientes,
        ] = await Promise.allSettled([
          sistemasService.getAll(),
          escaneoService.getStats(),
          registrosService.getAll(undefined, 1, 1),   // solo para total
          publicacionesService.getAll(),
          escaneoService.getRecent(20),
        ])

        if (cancelled) return

        // ── Sistemas ───────────────────────────────────────────────────
        const sistemasArray: SistemaBackendResponse[] =
          sistemasData.status === 'fulfilled' ? sistemasData.value : []
        setSistemas(sistemasArray.map(mapSistema))

        // ── Stats cards ────────────────────────────────────────────────
        const totalRegistros =
          registrosData.status === 'fulfilled'
            ? (registrosData.value as { total?: number }).total ?? 0
            : 0

        const scanStats =
          escaneoStats.status === 'fulfilled'
            ? escaneoStats.value
            : { total: 0, validos: 0, bloqueados: 0, vencidos: 0 }

        const totalPublicaciones =
          publicacionesData.status === 'fulfilled'
            ? publicacionesData.value.length
            : 0

        setStats([
          {
            id: 'registros',
            titulo: 'Registros activos',
            valor: totalRegistros,
            cambio: 0,
            icono: '📋',
            color: '#C8102E',
            descripcion: 'Total de habilitaciones en el sistema',
          },
          {
            id: 'qrs',
            titulo: 'QRs válidos',
            valor: scanStats.validos,
            cambio: 0,
            icono: '⬛',
            color: '#1D4ED8',
            descripcion: 'Códigos QR verificados correctamente',
          },
          {
            id: 'escaneos',
            titulo: 'Escaneos totales',
            valor: scanStats.total,
            cambio: 0,
            icono: '📈',
            color: '#059669',
            descripcion: 'Verificaciones realizadas',
          },
          {
            id: 'publicaciones',
            titulo: 'Publicaciones',
            valor: totalPublicaciones,
            cambio: 0,
            icono: '📰',
            color: '#7C3AED',
            descripcion: 'Noticias y avisos activos en el portal',
          },
        ])

        // ── Actividad reciente desde escaneos ──────────────────────────
        const recientes =
          escaneoRecientes.status === 'fulfilled'
            ? escaneoRecientes.value
            : []

        const COLOR_RESULTADO: Record<string, string> = {
          valido:    '#059669',
          invalido:  '#B91C1C',
          vencido:   '#D97706',
          bloqueado: '#7C3AED',
        }

        const actividadMapeada: ActividadReciente[] = recientes
          .slice(0, 6)
          .map((e, idx) => ({
            id: e.id ?? idx,
            tipo: 'verificacion' as const,
            descripcion: e.detalles || `Escaneo QR #${e.qr_codigo_id} — ${e.resultado}`,
            usuario: 'Sistema',
            sistema: 'QR Manager',
            tiempo: new Date(e.creado_en).toLocaleTimeString('es-BO', {
              hour: '2-digit', minute: '2-digit',
            }),
            color: COLOR_RESULTADO[e.resultado] ?? '#6B7280',
          }))

        setActividad(actividadMapeada)

      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error cargando dashboard')
        }
      } finally {
        if (!cancelled) setCargando(false)
      }
    }

    cargar()
    return () => { cancelled = true }
  }, [])

  return { stats, sistemas, actividad, cargando, error }
}
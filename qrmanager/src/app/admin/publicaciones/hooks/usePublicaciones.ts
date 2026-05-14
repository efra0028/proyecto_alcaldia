import { useState, useMemo, useCallback, useEffect } from 'react'
import type {
  Publicacion,
  PublicacionFormData,
  ToastState,
  SortKey,
  SortDir,
  EstadoPublicacion,
} from '../types/index'
import { publicacionesService, tiposPublicacionService, type PublicacionResponse, type TipoPublicacionResponse } from '../../../lib/api-services'

function mapEstadoNombre(nombre?: string): EstadoPublicacion {
  if (!nombre) return 'borrador'
  const key = nombre.toUpperCase()
  if (key === 'ACTIVA') return 'publicado'
  if (key === 'INACTIVA') return 'archivado'
  if (key === 'BORRADOR') return 'borrador'
  return 'borrador'
}

function mapEstadoId(estado: EstadoPublicacion): number {
  if (estado === 'publicado') return 1
  if (estado === 'archivado') return 2
  return 3
}

function normalizeApiPublicacion(pub: PublicacionResponse): Publicacion {
  return {
    id: pub.id,
    tipo_id: pub.tipo_id,
    tipo: pub.tipo,
    titulo: pub.titulo,
    contenido: {
      resumen: String(pub.contenido?.resumen ?? ''),
      cuerpo: String(pub.contenido?.cuerpo ?? ''),
    },
    adjuntos_urls: {
      portada: pub.adjuntos_urls?.['portada'] ? String(pub.adjuntos_urls['portada']) : '',
      archivos: Array.isArray(pub.adjuntos_urls?.['archivos'])
        ? pub.adjuntos_urls['archivos'].map(String)
        : [],
    },
    fecha_publicacion: String(pub.fecha_publicacion),
    fecha_vencimiento: pub.fecha_vencimiento ? String(pub.fecha_vencimiento) : undefined,
    estado_id: pub.estado_id,
    estado: mapEstadoNombre(pub.estado?.nombre),
    destacada: Boolean(pub.destacada ?? false),
    orden_carrusel: Number(pub.orden_carrusel ?? 0),
    created_at: pub.created_at,
    updated_at: pub.update_at,
  }
}

export function usePublicaciones() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [search, setSearch]               = useState('')
  const [filtroTipo, setFiltroTipo]       = useState('todos')
  const [filtroEst, setFiltroEst]         = useState('todos')
  const [sortKey, setSortKey]             = useState<SortKey>('fecha_publicacion')
  const [sortDir, setSortDir]             = useState<SortDir>('desc')
  const [toast, setToast]                 = useState<ToastState>({ msg: '', type: 'success' })
  const [loading, setLoading]             = useState(true)  // eslint-disable-line @typescript-eslint/no-unused-vars
  const [tipos, setTipos] = useState<TipoPublicacionResponse[]>([])

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: ToastState['type'] = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000)
  }, [])

  // ── Carga inicial ─────────────────────────────────────────────────────────
// ── Carga de tipos ────────────────────────────────────────────────────────
    useEffect(() => {
      let active = true

      tiposPublicacionService.getAll()
      .then((data) => { if (active) setTipos(data) })
      .catch(() => { if (active) setTipos([]) })

      publicacionesService.getAll()
      .then((data) => {
        if (!active) return
        setPublicaciones((data as PublicacionResponse[]).map(normalizeApiPublicacion))
      })
      .catch(() => {
        if (!active) return
        showToast('Error al cargar las publicaciones', 'error')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => { active = false }
  }, [showToast])

  // ── Sort toggle ───────────────────────────────────────────────────────────
  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }, [sortKey])

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...publicaciones]

    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (p) =>
          p.titulo.toLowerCase().includes(q) ||
          p.contenido.resumen.toLowerCase().includes(q),
      )
    }

    if (filtroTipo !== 'todos') rows = rows.filter((p) => String(p.tipo_id) === filtroTipo)
    if (filtroEst !== 'todos')  rows = rows.filter((p) => p.estado === filtroEst)

    rows.sort((a, b) => {
      let va: string
      let vb: string

      if (sortKey === 'destacada') {
        va = String(a.destacada ? 1 : 0)
        vb = String(b.destacada ? 1 : 0)
      } else {
        va = String(a[sortKey as keyof Publicacion] ?? '')
        vb = String(b[sortKey as keyof Publicacion] ?? '')
      }

      const cmp = va.localeCompare(vb, 'es')
      return sortDir === 'asc' ? cmp : -cmp
    })

    return rows
  }, [publicaciones, search, filtroTipo, filtroEst, sortKey, sortDir])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      publicaciones.length,
    publicadas: publicaciones.filter((p) => p.estado === 'publicado').length,
    borradores: publicaciones.filter((p) => p.estado === 'borrador').length,
    destacadas: publicaciones.filter((p) => p.destacada && p.orden_carrusel > 0).length,
  }), [publicaciones])

  const buildPublicacionPayload = useCallback((form: PublicacionFormData) => {
    const adjuntos: Record<string, unknown> = {}
    const portada = form.portada_url?.trim()
    if (portada) adjuntos.portada = portada

    const archivos = form.archivos_urls
      ? form.archivos_urls.split('\n').map((s) => s.trim()).filter(Boolean)
      : []
    if (archivos.length > 0) adjuntos.archivos = archivos

    return {
      tipo_id: form.tipo_id,
      titulo: form.titulo,
      contenido: { resumen: form.resumen, cuerpo: form.cuerpo || '' },
      ...(Object.keys(adjuntos).length > 0 ? { adjuntos_urls: adjuntos } : {}),
      fecha_publicacion: form.fecha_publicacion,
      fecha_vencimiento: form.fecha_vencimiento || undefined,
      estado_id: mapEstadoId(form.estado),
      destacada: form.destacada,
      orden_carrusel: form.orden_carrusel,
    }
  }, [])

  // ── Create ────────────────────────────────────────────────────────────────
  const crearPublicacion = useCallback(async (form: PublicacionFormData) => {
    try {
      const payload = buildPublicacionPayload(form)
      await publicacionesService.create(payload)
      // ✅ Recargar todo
      const todas = await publicacionesService.getAll()
      setPublicaciones((todas as PublicacionResponse[]).map(normalizeApiPublicacion))
      showToast('Publicación creada correctamente')
    } catch {
      showToast('Error al crear la publicación', 'error')
    }
  }, [buildPublicacionPayload, showToast])


  // ── Update ────────────────────────────────────────────────────────────────
  const editarPublicacion = useCallback(async (form: PublicacionFormData) => {
    if (!form.id) return
    try {
      const payload = buildPublicacionPayload(form)
      await publicacionesService.update(form.id, payload)
      // ✅ Recargar todo
      const todas = await publicacionesService.getAll()
      setPublicaciones((todas as PublicacionResponse[]).map(normalizeApiPublicacion))
      showToast('Publicación actualizada correctamente')
    } catch {
      showToast('Error al actualizar la publicación', 'error')
    }
  }, [buildPublicacionPayload, showToast])

  // ── Toggle estado ─────────────────────────────────────────────────────────
  const toggleEstado = useCallback(async (pub: Publicacion) => {
    try {
      const next: EstadoPublicacion = pub.estado === 'publicado' ? 'archivado' : 'publicado'
      if (pub.estado === 'publicado') {
        await publicacionesService.unpublish(pub.id)
      } else {
        await publicacionesService.publish(pub.id)
      }
      // ✅ Forzar re-fetch completo en lugar de actualizar localmente
      const todas = await publicacionesService.getAll()
      setPublicaciones((todas as PublicacionResponse[]).map(normalizeApiPublicacion))

      showToast(
        `Publicación ${next === 'publicado' ? 'publicada' : 'archivada'}`,
        next === 'publicado' ? 'success' : 'error',
      )
    } catch {
      showToast('Error al cambiar el estado de la publicación', 'error')
    }
  }, [showToast])

  // ── Delete ────────────────────────────────────────────────────────────────
  const eliminarPublicacion = useCallback(async (id: string) => {
    try {
      await publicacionesService.remove(id)
      setPublicaciones((prev) => prev.filter((p) => p.id !== id))
      showToast('Publicación eliminada', 'error')
    } catch {
      showToast('Error al eliminar la publicación', 'error')
    }
  }, [showToast])

  return {
    search, setSearch,
    filtroTipo, setFiltroTipo,
    filtroEst, setFiltroEst,
    sortKey, sortDir, toggleSort,
    filtered,
    total: publicaciones.length,
    stats,
    crearPublicacion,
    editarPublicacion,
    toggleEstado,
    eliminarPublicacion,
    toast,
    tipos,
  }
}
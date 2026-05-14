import { useState, useMemo, useCallback, useEffect } from 'react'
import type {
  Sistema,
  SistemaFormData,
  ToastState,
  SortKey,
  SortDir,
} from '../types/index'
import {
  sistemasService,
  type SistemaBackendResponse,
} from '../../../lib/api-services'

// ── Mapeo backend → UI ───────────────────────────────────────────────────────
function mapBackendSistema(s: SistemaBackendResponse): Sistema {
  return {
    id: s.id,
    nombre: s.nombre,
    descripcion: s.descripcion ?? '',
    color_hex: s.color_hex ?? '#BE2D26',
    logo_url: s.logo_url ?? '',
    api_key: s.api_key ?? '',
    schema_campos: s.schema_campos ?? null,
    is_active: s.is_active,
    estado: s.is_active ? 'activo' : 'inactivo',
    created_at: s.created_at ? String(s.created_at).slice(0, 10) : '—',
    update_at: s.update_at ? String(s.update_at).slice(0, 10) : '—',
    created_by: s.created_by,
    updated_by: s.updated_by,
    usuariosCount: 0,
  }
}

export function useSistemas() {
  const [sistemas, setSistemas]   = useState<Sistema[]>([])
  const [search, setSearch]       = useState('')
  const [filtroEst, setFiltroEst] = useState('todos')
  const [sortKey, setSortKey]     = useState<SortKey>('nombre')
  const [sortDir, setSortDir]     = useState<SortDir>('asc')
  const [toast, setToast]         = useState<ToastState>({ msg: '', type: 'success' })

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: ToastState['type'] = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000)
  }, [])

  // ── Load — efecto directo, sin useCallback para evitar el warning ──────────
  useEffect(() => {
    let cancelled = false

    sistemasService.getAll()
      .then((data) => {
        if (!cancelled) setSistemas(data.map(mapBackendSistema))
      })
      .catch((error) => {
        console.error('Error cargando sistemas:', error)
        if (!cancelled) showToast('No se pudo cargar la lista de sistemas', 'error')
      })

    return () => { cancelled = true }
  }, [showToast])

  // ── Sort ──────────────────────────────────────────────────────────────────
  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }, [sortKey])

  // ── Filtered + sorted ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...sistemas]

    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (s) =>
          s.nombre.toLowerCase().includes(q) ||
          s.descripcion.toLowerCase().includes(q),
      )
    }

    if (filtroEst !== 'todos') rows = rows.filter((s) => s.estado === filtroEst)

    rows.sort((a, b) => {
      const va = String(a[sortKey] ?? '')
      const vb = String(b[sortKey] ?? '')
      return sortDir === 'asc'
        ? va.localeCompare(vb, 'es')
        : vb.localeCompare(va, 'es')
    })

    return rows
  }, [sistemas, search, filtroEst, sortKey, sortDir])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     sistemas.length,
    activos:   sistemas.filter((s) => s.estado === 'activo').length,
    inactivos: sistemas.filter((s) => s.estado === 'inactivo').length,
    usuarios:  sistemas.reduce((acc, s) => acc + s.usuariosCount, 0),
  }), [sistemas])

  // ── Create ────────────────────────────────────────────────────────────────
  const crearSistema = useCallback(async (form: SistemaFormData) => {
    try {
      const created = await sistemasService.create({
        nombre:        form.nombre,
        descripcion:   form.descripcion || undefined,
        color_hex:     form.color_hex   || undefined,
        logo_url:      form.logo_url    || undefined,
        schema_campos: form.schema_campos ?? undefined,
      })
      setSistemas((prev) => [mapBackendSistema(created), ...prev])
      showToast('Sistema creado correctamente')
    } catch (error) {
      console.error('Error creando sistema:', error)
      showToast('No se pudo crear el sistema', 'error')
    }
  }, [showToast])

  // ── Update ────────────────────────────────────────────────────────────────
  const editarSistema = useCallback(async (form: SistemaFormData) => {
    if (!form.id) return
    try {
      const updated = await sistemasService.update(form.id, {
        nombre:        form.nombre,
        descripcion:   form.descripcion || undefined,
        color_hex:     form.color_hex   || undefined,
        logo_url:      form.logo_url    || undefined,
        schema_campos: form.schema_campos ?? undefined,
      })
      setSistemas((prev) =>
        prev.map((s) => s.id === form.id ? mapBackendSistema(updated) : s),
      )
      showToast('Sistema actualizado correctamente')
    } catch (error) {
      console.error('Error actualizando sistema:', error)
      showToast('No se pudo actualizar el sistema', 'error')
    }
  }, [showToast])

  // ── Toggle estado ─────────────────────────────────────────────────────────
  const toggleEstado = useCallback(async (sistema: Sistema) => {
    try {
      const updated = await sistemasService.toggle(sistema.id)
      setSistemas((prev) =>
        prev.map((s) => s.id === sistema.id ? mapBackendSistema(updated) : s),
      )
      showToast(
        `${sistema.nombre} ${sistema.estado === 'activo' ? 'desactivado' : 'activado'}`,
        sistema.estado === 'activo' ? 'error' : 'success',
      )
    } catch (error) {
      console.error('Error cambiando estado:', error)
      showToast('No se pudo cambiar el estado del sistema', 'error')
    }
  }, [showToast])

  // ── Regenerar API Key ─────────────────────────────────────────────────────
  const regenerarKey = useCallback(async (sistema: Sistema) => {
    try {
      const updated = await sistemasService.regenerarKey(sistema.id)
      setSistemas((prev) =>
        prev.map((s) => s.id === sistema.id ? mapBackendSistema(updated) : s),
      )
      showToast('API Key regenerada correctamente')
    } catch (error) {
      console.error('Error regenerando key:', error)
      showToast('No se pudo regenerar la API Key', 'error')
    }
  }, [showToast])

  return {
    search, setSearch,
    filtroEst, setFiltroEst,
    sortKey, sortDir, toggleSort,
    filtered,
    total: sistemas.length,
    stats,
    crearSistema,
    editarSistema,
    toggleEstado,
    regenerarKey,
    toast,
  }
}
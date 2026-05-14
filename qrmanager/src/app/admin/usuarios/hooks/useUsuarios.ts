import { useState, useMemo, useCallback, useEffect } from 'react'
import type {
  Usuario,
  UsuarioFormData,
  ToastState,
  SortKey,
  SortDir,
} from '../types/index'
import { usuariosService } from '../../../lib/api-services'

interface BackendRol {
  id: number
  nombre: string
}

interface BackendUsuarioResponse {
  id: number
  email: string
  nombre: string
  apellidos?: string
  carnet?: string
  is_active?: boolean
  roles?: Array<string | BackendRol>
  last_login?: string
  created_at?: string
  updated_at?: string
}

function mapBackendUsuario(user: BackendUsuarioResponse): Usuario {
  const roles = Array.isArray(user.roles) ? user.roles : []
  const firstRole = roles.find((r) => {
    if (typeof r === 'string') return ['SUPER_ADMIN', 'ADMIN', 'OPERADOR'].includes(r)
    return typeof r === 'object' && typeof r.nombre === 'string'
  })

  const rol = typeof firstRole === 'string'
    ? firstRole === 'SUPER_ADMIN'
      ? 'superadmin'
      : firstRole === 'ADMIN'
        ? 'admin'
        : 'operador'
    : typeof firstRole === 'object'
      ? firstRole.nombre === 'SUPER_ADMIN'
        ? 'superadmin'
        : firstRole.nombre === 'ADMIN'
          ? 'admin'
          : 'operador'
      : 'operador'

  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol,
    estado: user.is_active === false ? 'suspendido' : 'activo',
    ultimoAcceso: user.last_login ?? '—',
    creado: user.created_at ? String(user.created_at).slice(0, 10) : '—',
    sistemas: [],
  }
}

export function useUsuarios() {
  const [usuarios, setUsuarios]       = useState<Usuario[]>([])
  const [search, setSearch]           = useState('')
  const [filtroRol, setFiltroRol]     = useState('todos')
  const [filtroEst, setFiltroEst]     = useState('todos')
  const [sortKey, setSortKey]         = useState<SortKey>('nombre')
  const [sortDir, setSortDir]         = useState<SortDir>('asc')
  const [toast, setToast]             = useState<ToastState>({ msg: '', type: 'success' })

  // ── Toast ────────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: ToastState['type'] = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000)
  }, [])

  // ── Load users ─────────────────────────────────────────────────────────────────
  const loadUsuarios = useCallback(async () => {
    try {
      const backendUsuarios = await usuariosService.getAll()
      setUsuarios(backendUsuarios.map(mapBackendUsuario))
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      showToast('No se pudo cargar la lista de usuarios', 'error')
    }
  }, [showToast])

  useEffect(() => {
    async function init() {
      await loadUsuarios()
    }
    void init()
  }, [loadUsuarios])

  // ── Sort toggle ──────────────────────────────────────────────────────────────
  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }, [sortKey])

  // ── Filtered + sorted list ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...usuarios]

    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (u) =>
          u.nombre.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      )
    }

    if (filtroRol !== 'todos') rows = rows.filter((u) => u.rol === filtroRol)
    if (filtroEst !== 'todos') rows = rows.filter((u) => u.estado === filtroEst)

    rows.sort((a, b) => {
      const va = String(a[sortKey] ?? '')
      const vb = String(b[sortKey] ?? '')
      const cmp = va.localeCompare(vb, 'es')
      return sortDir === 'asc' ? cmp : -cmp
    })

    return rows
  }, [usuarios, search, filtroRol, filtroEst, sortKey, sortDir])

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:       usuarios.length,
    activos:     usuarios.filter((u) => u.estado === 'activo').length,
    suspendidos: usuarios.filter((u) => u.estado === 'suspendido').length,
    admins:      usuarios.filter((u) => u.rol === 'admin' || u.rol === 'superadmin').length,
  }), [usuarios])

  // ── Create ───────────────────────────────────────────────────────────────────
  const crearUsuario = useCallback(async (form: UsuarioFormData) => {
    try {
      const created = await usuariosService.create({
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        rol: form.rol,
      })

      const newUser = mapBackendUsuario(created)
      newUser.sistemas = form.sistemas

      setUsuarios((prev) => [newUser, ...prev])
      showToast('Usuario creado correctamente')
    } catch (error) {
      console.error('Error creando usuario:', error)
      showToast('No se pudo crear el usuario', 'error')
    }
  }, [showToast])

  // ── Update ───────────────────────────────────────────────────────────────────
  const editarUsuario = useCallback(async (form: UsuarioFormData) => {
    if (!form.id) return

    try {
      const backendUpdate = await usuariosService.update(form.id, {
        nombre: form.nombre,
        email: form.email,
        password: form.password || undefined,
        rol: form.rol,
      })

      if (form.estado !== undefined) {
        const existing = usuarios.find((u) => u.id === form.id)
        if (existing && existing.estado !== form.estado) {
          await usuariosService.toggle(form.id)
        }
      }

      const updatedUser = mapBackendUsuario(backendUpdate)
      updatedUser.sistemas = form.sistemas
      if (form.estado !== undefined) {
        updatedUser.estado = form.estado
      }

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === form.id ? updatedUser : u,
        ),
      )
      showToast('Usuario actualizado correctamente')
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      showToast('No se pudo actualizar el usuario', 'error')
    }
  }, [showToast, usuarios])

  // ── Toggle estado ────────────────────────────────────────────────────────────
  const toggleEstado = useCallback(async (usuario: Usuario) => {
    try {
      await usuariosService.toggle(usuario.id)
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === usuario.id
            ? { ...u, estado: usuario.estado === 'activo' ? 'suspendido' : 'activo' }
            : u,
        ),
      )
      showToast(
        `${usuario.nombre} ${usuario.estado === 'activo' ? 'suspendido' : 'reactivado'}`,
        usuario.estado === 'activo' ? 'error' : 'success',
      )
    } catch (error) {
      console.error('Error cambiando estado:', error)
      showToast('No se pudo cambiar el estado del usuario', 'error')
    }
  }, [showToast])

  return {
    // Estado filtros
    search, setSearch,
    filtroRol, setFiltroRol,
    filtroEst, setFiltroEst,
    sortKey, sortDir, toggleSort,
    // Datos
    filtered,
    total: usuarios.length,
    stats,
    // Acciones
    crearUsuario,
    editarUsuario,
    toggleEstado,
    // Toast
    toast,
  }
}

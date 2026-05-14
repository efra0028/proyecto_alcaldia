'use client'

import { useState } from 'react'
import type { Usuario, UsuarioFormData } from './types'
import { useUsuarios } from './hooks/useUsuarios'
import StatsRow from './components/StatsRow'
import FiltersBar from './components/FiltersBar'
import UsuariosTable from './components/UsuariosTable'
import UsuarioModal from './components/UsuarioModal'
import ConfirmModal from './components/ConfirmModal'
import Toast from './components/Toast'
import styles from './page.module.css'

export default function UsuariosPage() {
  const {
    search, setSearch,
    filtroRol, setFiltroRol,
    filtroEst, setFiltroEst,
    sortKey, sortDir, toggleSort,
    filtered, total, stats,
    crearUsuario, editarUsuario, toggleEstado,
    toast,
  } = useUsuarios()

  // Modal state
  const [modalUsuario, setModalUsuario] = useState<Usuario | 'crear' | null>(null)
  const [confirmUsuario, setConfirmUsuario] = useState<Usuario | null>(null)

  function handleSave(form: UsuarioFormData) {
    if (form.id) {
      editarUsuario(form)
    } else {
      crearUsuario(form)
    }
    setModalUsuario(null)
  }

  function handleConfirmToggle(u: Usuario) {
    toggleEstado(u)
    setConfirmUsuario(null)
  }

  return (
    <div className={styles.page}>

      {/* ── Encabezado ── */}
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>Administración › Usuarios</div>
          <h1 className={styles.title}>Usuarios del sistema</h1>
          <p className={styles.subtitle}>
            Gestión de funcionarios con acceso al panel administrativo.
          </p>
        </div>
        <button
          className={styles.btnPrimary}
          onClick={() => setModalUsuario('crear')}
        >
          <span>+</span> Nuevo usuario
        </button>
      </div>

      {/* ── Stats ── */}
      <StatsRow
        total={stats.total}
        activos={stats.activos}
        suspendidos={stats.suspendidos}
        admins={stats.admins}
      />

      {/* ── Filtros ── */}
      <FiltersBar
        search={search}
        onSearch={setSearch}
        filtroRol={filtroRol}
        onFiltroRol={setFiltroRol}
        filtroEst={filtroEst}
        onFiltroEst={setFiltroEst}
        total={total}
        visible={filtered.length}
      />

      {/* ── Tabla ── */}
      <UsuariosTable
        usuarios={filtered}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={toggleSort}
        onEditar={(u) => setModalUsuario(u)}
        onToggleEstado={(u) => setConfirmUsuario(u)}
      />

      {/* ── Modal crear / editar ── */}
      {modalUsuario !== null && (
        <UsuarioModal
          usuario={modalUsuario === 'crear' ? null : modalUsuario}
          onClose={() => setModalUsuario(null)}
          onSave={handleSave}
        />
      )}

      {/* ── Modal confirmar suspensión ── */}
      {confirmUsuario && (
        <ConfirmModal
          usuario={confirmUsuario}
          onClose={() => setConfirmUsuario(null)}
          onConfirm={handleConfirmToggle}
        />
      )}

      {/* ── Toast ── */}
      <Toast msg={toast.msg} type={toast.type} />
    </div>
  )
}

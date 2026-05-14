'use client'

import { useState } from 'react'
import type { Publicacion, PublicacionFormData } from './types'
import { usePublicaciones } from './hooks/usePublicaciones'
import StatsRow from './components/StatsRow'
import FiltersBar from './components/FiltersBar'
import PublicacionesTable from './components/PublicacionesTable'
import PublicacionModal from './components/PublicacionModal'
import ConfirmModal from './components/ConfirmModal'
import Toast from './components/Toast'
import styles from './page.module.css'

type ConfirmAccion = 'eliminar' | 'archivar' | 'publicar'

export default function PublicacionesPage() {
  const {
    search, setSearch,
    filtroTipo, setFiltroTipo,
    filtroEst, setFiltroEst,
    sortKey, sortDir, toggleSort,
    filtered, total, stats,
    crearPublicacion, editarPublicacion,
    toggleEstado, eliminarPublicacion,
    toast,
    tipos,
  } = usePublicaciones()

  // Modal state
  const [modalPub, setModalPub]   = useState<Publicacion | 'crear' | null>(null)
  const [confirm, setConfirm]     = useState<{ pub: Publicacion; accion: ConfirmAccion } | null>(null)

  function handleSave(form: PublicacionFormData) {
    if (form.id) {
      editarPublicacion(form)
    } else {
      crearPublicacion(form)
    }
    setModalPub(null)
  }

  function handleToggleEstado(p: Publicacion) {
    const accion: ConfirmAccion = p.estado === 'publicado' ? 'archivar' : 'publicar'
    setConfirm({ pub: p, accion })
  }

  function handleEliminar(p: Publicacion) {
    setConfirm({ pub: p, accion: 'eliminar' })
  }

  function handleConfirm(p: Publicacion) {
    if (!confirm) return
    if (confirm.accion === 'eliminar') {
      eliminarPublicacion(p.id)
    } else {
      toggleEstado(p)
    }
    setConfirm(null)
  }

  return (
    <div className={styles.page}>

      {/* ── Encabezado ── */}
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>Administración › Publicaciones</div>
          <h1 className={styles.title}>Publicaciones</h1>
          <p className={styles.subtitle}>
            Gestión de noticias, avisos y contenido del portal ciudadano.
          </p>
        </div>
        <button
          className={styles.btnPrimary}
          onClick={() => setModalPub('crear')}
        >
          <span>+</span> Nueva publicación
        </button>
      </div>

      {/* ── Stats ── */}
      <StatsRow
        total={stats.total}
        publicadas={stats.publicadas}
        borradores={stats.borradores}
        destacadas={stats.destacadas}
      />

      {/* ── Filtros ── */}
      <FiltersBar
        search={search}
        onSearch={setSearch}
        filtroTipo={filtroTipo}
        onFiltroTipo={setFiltroTipo}
        filtroEst={filtroEst}
        onFiltroEst={setFiltroEst}
        total={total}
        visible={filtered.length}
      />

      {/* ── Tabla ── */}
      <PublicacionesTable
        publicaciones={filtered}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={toggleSort}
        onEditar={(p) => setModalPub(p)}
        onToggleEstado={handleToggleEstado}
        onEliminar={handleEliminar}
      />

      {/* ── Modal crear / editar ── */}
      {modalPub !== null && (
        <PublicacionModal
          publicacion={modalPub === 'crear' ? null : modalPub}
          onClose={() => setModalPub(null)}
          onSave={handleSave}
          tipos={tipos}  
        />
      )}

      {/* ── Modal confirmación ── */}
      {confirm && (
        <ConfirmModal
          publicacion={confirm.pub}
          accion={confirm.accion}
          onClose={() => setConfirm(null)}
          onConfirm={handleConfirm}
        />
      )}

      {/* ── Toast ── */}
      <Toast msg={toast.msg} type={toast.type} />
    </div>
  )
}

'use client'
import { useState } from 'react'
import type { Sistema, SistemaFormData } from './types'
import { useSistemas } from './hooks/useSistemas'
import StatsRow from './components/StatsRow'
import FiltersBar from './components/FiltersBar'
import SistemasTable from './components/SistemasTable'
import SistemaModal from './components/SistemaModal'
import ConfirmModal from './components/ConfirmModal'
import ConfirmRegenerarModal from './components/ConfirmRegenerarModal'
import Toast from '../usuarios/components/Toast'   // ← reutiliza el tuyo
import styles from './page.module.css'

export default function SistemasPage() {
  const {
    search, setSearch,
    filtroEst, setFiltroEst,
    sortKey, sortDir, toggleSort,
    filtered, total, stats,
    crearSistema, editarSistema, toggleEstado, regenerarKey,
    toast,
  } = useSistemas()

  const [modalSistema, setModalSistema] = useState<Sistema | 'crear' | null>(null)
  const [confirmSistema, setConfirmSistema] = useState<Sistema | null>(null)
  const [confirmRegenerar, setConfirmRegenerar] = useState<Sistema | null>(null) 

  function handleSave(form: SistemaFormData) {
    if (form.id) editarSistema(form)
    else crearSistema(form)
    setModalSistema(null)
  }

  function handleConfirmToggle(s: Sistema) {
    toggleEstado(s)
    setConfirmSistema(null)
  }
  function handleConfirmRegenerar(s: Sistema) {
    regenerarKey(s)
    setConfirmRegenerar(null)
  }

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>Administración › Sistemas</div>
          <h1 className={styles.title}>Sistemas registrados</h1>
          <p className={styles.subtitle}>
            Gestión de los sistemas municipales integrados a la plataforma.
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setModalSistema('crear')}>
          <span>+</span> Nuevo sistema
        </button>
      </div>

      <StatsRow
        total={stats.total}
        activos={stats.activos}
        inactivos={stats.inactivos}
        usuarios={stats.usuarios}
      />

      <FiltersBar
        search={search}
        onSearch={setSearch}
        filtroEst={filtroEst}
        onFiltroEst={setFiltroEst}
        total={total}
        visible={filtered.length}
      />

      <SistemasTable
        sistemas={filtered}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={toggleSort}
        onEditar={(s) => setModalSistema(s)}
        onToggleEstado={(s) => setConfirmSistema(s)}
        onRegenerarKey={(s: Sistema) => setConfirmRegenerar(s)}
      />

      {modalSistema !== null && (
        <SistemaModal
          sistema={modalSistema === 'crear' ? null : modalSistema}
          onClose={() => setModalSistema(null)}
          onSave={handleSave}
        />
      )}

      {confirmSistema && (
        <ConfirmModal
          sistema={confirmSistema}
          onClose={() => setConfirmSistema(null)}
          onConfirm={handleConfirmToggle}
        />
      )}
      {confirmRegenerar && (
        <ConfirmRegenerarModal
          sistema={confirmRegenerar}
          onClose={() => setConfirmRegenerar(null)}
          onConfirm={handleConfirmRegenerar}
        />
      )}

      <Toast msg={toast.msg} type={toast.type} />
    </div>
  )
}
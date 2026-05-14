'use client'

import { useState } from 'react'
import { useQrCodigos } from './hooks/useQrCodigos'
import type { QrCodigo } from './types'

import StatsRow              from './components/StatsRow'
import FiltersBar            from './components/FiltersBar'
import QrTable               from './components/QrTable'
import QrCrearModal          from './components/QrCrearModal'
import QrViewer              from './components/QrViewer'
import ConfirmarEliminarModal from './components/ConfirmarEliminarModal'

import styles from './page.module.css'

export default function QrGeneradorPage() {
  const {
    search, setSearch,
    filtroSistema, setFiltroSistema,
    filtroEst, setFiltroEst,
    sortKey, sortDir, toggleSort,
    filtered,
    total,
    stats,
    crearQr,
    toggleEstado,
    eliminarQr,
    toast,
    sistemas,  
  } = useQrCodigos()

  const [showCrear, setShowCrear]     = useState(false)
  const [qrViewer, setQrViewer]       = useState<QrCodigo | null>(null)
  const [qrAEliminar, setQrAEliminar] = useState<QrCodigo | null>(null)
  const [modalKey, setModalKey] = useState(0)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoRow}>
            <span className={styles.logoIcon}>Administración › Generador Qr</span>
            <div>
              <h1 className={styles.heading}>Generador de QRs</h1>
              <p className={styles.subheading}>
                Gobierno Autónomo Municipal de Sucre — Panel de administración
              </p>
            </div>
          </div>
        </div>
        <button
          className={styles.btnNuevo}
          onClick={() => { setModalKey((k) => k + 1); setShowCrear(true) }}
        >
          <span className={styles.btnNuevoIcon}>＋</span>
          Nuevo QR
        </button>
      </header>

      <StatsRow
        total={stats.total}
        activos={stats.activos}
        vencidos={stats.vencidos}
        sistemas={stats.sistemas}
      />

      <FiltersBar
        search={search}
        onSearch={setSearch}
        filtroSistema={filtroSistema}
        onFiltroSistema={setFiltroSistema}
        filtroEst={filtroEst}
        onFiltroEst={setFiltroEst}
        total={total}
        visible={filtered.length}
      />

      <QrTable
        qrCodigos={filtered}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={toggleSort}
        onVerQr={(qr) => setQrViewer(qr)}
        onToggleEstado={toggleEstado}
        onEliminar={(qr) => setQrAEliminar(qr)}
      />

      {toast.msg && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          <span className={styles.toastIcon}>
            {toast.type === 'success' ? '✅' : '⚠️'}
          </span>
          {toast.msg}
        </div>
      )}

      {showCrear && (
        <QrCrearModal
          key={modalKey}
          onClose={() => setShowCrear(false)}
          onSave={crearQr}
          sistemas={sistemas.map((s) => ({
            ...s,
            activo: s.is_active,
          }))}
        />
      )}

      {qrViewer && (
        <QrViewer qr={qrViewer} onClose={() => setQrViewer(null)} />
      )}

      {qrAEliminar && (
        <ConfirmarEliminarModal
          qr={qrAEliminar}
          onClose={() => setQrAEliminar(null)}
          onConfirmar={() => {
            eliminarQr(qrAEliminar.id)
            setQrAEliminar(null)
          }}
        />
      )}
    </div>
  )
}
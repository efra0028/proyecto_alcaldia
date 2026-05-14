'use client'

import { useState, useRef } from 'react'
import type { QrFormData, FormErrors, EstadoRegistro } from '../types'
import type { SistemaResponse } from '../../../lib/api-services'
import { parseJsonSafe } from '../utils/format'
import styles from './QrCrearModal.module.css'

interface Props {
  onClose: () => void
  onSave: (form: QrFormData) => void
  sistemas: SistemaResponse[]
}

const today = new Date().toISOString().slice(0, 10)

const EMPTY_FORM: QrFormData = {
  sistema_id: '',
  referencia_externa: '',
  fecha_inicio: today,
  fecha_vencimiento: '',
  estado: 'activo',
  datos_display_raw: '',
}

// ─── Ejemplos indexados por NOMBRE del sistema (en minúsculas, sin tildes) ───
// Así funcionan aunque el id sea un UUID dinámico de la BD
type EjemploEntry = { referencia: string; json: Record<string, unknown> }

const EJEMPLOS_POR_NOMBRE: Record<string, EjemploEntry> = {
  // Coincide si el nombre del sistema contiene alguna de estas palabras clave
  construccion: {
    referencia: 'TC-2025-00123',
    json: {
      tipo: 'Permiso de construcción',
      solicitante: 'Juan Pérez Mamani',
      ci: '4521789',
      descripcion: 'Construcción vivienda unifamiliar — Zona Norte',
      estado: 'Aprobado',
    },
  },
  tramite: {
    referencia: 'TC-2025-00123',
    json: {
      tipo: 'Permiso de construcción',
      solicitante: 'Juan Pérez Mamani',
      ci: '4521789',
      descripcion: 'Construcción vivienda unifamiliar — Zona Norte',
      estado: 'Aprobado',
    },
  },
  credencial: {
    referencia: 'CI-8754321',
    json: {
      nombre: 'María Fernanda Rojas',
      cargo: 'Directora de Cultura',
      dependencia: 'GAMS — Secretaría de Cultura',
      ci: '8754321',
      fecha_posesion: '2024-01-15',
    },
  },
  funcionario: {
    referencia: 'CI-8754321',
    json: {
      nombre: 'María Fernanda Rojas',
      cargo: 'Directora de Cultura',
      dependencia: 'GAMS — Secretaría de Cultura',
      ci: '8754321',
      fecha_posesion: '2024-01-15',
    },
  },
  vehiculo: {
    referencia: '1234-SUC',
    json: {
      placa: '1234-SUC',
      propietario: 'Roberto Mamani Quispe',
      tipo_vehiculo: 'Automóvil',
      marca: 'Toyota',
      modelo: 'Corolla 2020',
      licencia: 'LIC-2025-00456',
    },
  },
  transito: {
    referencia: '1234-SUC',
    json: {
      placa: '1234-SUC',
      propietario: 'Roberto Mamani Quispe',
      tipo_vehiculo: 'Automóvil',
      marca: 'Toyota',
      modelo: 'Corolla 2020',
      licencia: 'LIC-2025-00456',
    },
  },
  publicacion: {
    referencia: 'PUB-2025-00789',
    json: {
      titulo: 'Aviso de restricción vial — Día del Peatón',
      tipo: 'Vialidad',
      fecha: '2025-05-18',
      area: 'Centro histórico',
    },
  },
  aviso: {
    referencia: 'PUB-2025-00789',
    json: {
      titulo: 'Aviso de restricción vial — Día del Peatón',
      tipo: 'Vialidad',
      fecha: '2025-05-18',
      area: 'Centro histórico',
    },
  },
  evento: {
    referencia: 'EVT-GUADALUPE-001',
    json: {
      evento: 'Entrada de la Virgen de Guadalupe 2025',
      tipo_entrada: 'Palco VIP — Fila A',
      titular: 'Ana Sofía Delgado',
      numero_entrada: '001',
      fecha_evento: '2025-05-15',
    },
  },
  documento: {
    referencia: 'DOC-2025-CERT-789',
    json: {
      tipo_documento: 'Certificado de residencia',
      titular: 'Luis Miguel Torrez',
      ci: '5678901',
      zona: 'Barrio Petrolero',
      emitido_por: 'Sub-Alcaldía Norte',
      documento_url: 'https://sucre.gob.bo/docs/cert-789.pdf',
    },
  },
  certificado: {
    referencia: 'DOC-2025-CERT-789',
    json: {
      tipo_documento: 'Certificado de residencia',
      titular: 'Luis Miguel Torrez',
      ci: '5678901',
      zona: 'Barrio Petrolero',
      emitido_por: 'Sub-Alcaldía Norte',
      documento_url: 'https://sucre.gob.bo/docs/cert-789.pdf',
    },
  },
}

// Ejemplo genérico si no hay coincidencia por nombre
const EJEMPLO_GENERICO: EjemploEntry = {
  referencia: 'REF-2025-00001',
  json: {
    campo1: 'Valor de ejemplo',
    campo2: 'Otro valor',
    descripcion: 'Descripción del registro',
  },
}

/**
 * Busca un ejemplo por el nombre del sistema.
 * Normaliza a minúsculas y sin tildes para comparar.
 */
function getEjemploPorSistema(sistema: SistemaResponse | undefined): EjemploEntry {
  if (!sistema) return EJEMPLO_GENERICO

  const nombreNorm = sistema.nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes

  const clave = Object.keys(EJEMPLOS_POR_NOMBRE).find((k) =>
    nombreNorm.includes(k),
  )

  return clave ? EJEMPLOS_POR_NOMBRE[clave] : EJEMPLO_GENERICO
}

export default function QrCrearModal({ onClose, onSave, sistemas }: Props) {
  const [form, setForm]     = useState<QrFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [tab, setTab]       = useState<'datos' | 'json'>('datos')
  const fileRef             = useRef<HTMLInputElement>(null)

  const parsedJson       = parseJsonSafe(form.datos_display_raw)
  const parsedJsonObject = parsedJson ?? {}
  const jsonValido       = form.datos_display_raw.trim() === '' || parsedJson !== null

  // Sistema actualmente seleccionado
  const sistemaActual = sistemas.find((s) => s.id === form.sistema_id)

  function setField<K extends keyof QrFormData>(key: K, val: QrFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  // ── Cargar ejemplo según el sistema seleccionado (busca por nombre) ──────────
  function cargarEjemplo() {
    if (!form.sistema_id) return
    const ej = getEjemploPorSistema(sistemaActual)
    // Solo rellena referencia si está vacía
    if (!form.referencia_externa.trim()) {
      setField('referencia_externa', ej.referencia)
    }
    setField('datos_display_raw', JSON.stringify(ej.json, null, 2))
    setErrors({})
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      try {
        const parsed = JSON.parse(text)
        if (parsed.referencia_externa) setField('referencia_externa', parsed.referencia_externa)
        if (parsed.sistema_id)         setField('sistema_id', parsed.sistema_id)
        if (parsed.fecha_inicio)       setField('fecha_inicio', parsed.fecha_inicio)
        if (parsed.fecha_vencimiento)  setField('fecha_vencimiento', parsed.fecha_vencimiento)
        const datos = parsed.datos_display ?? parsed
        const filtrado = Object.fromEntries(
          Object.entries(datos).filter(
            ([k]) =>
              !['referencia_externa', 'sistema_id', 'fecha_inicio', 'fecha_vencimiento', 'estado'].includes(k),
          ),
        )
        setField('datos_display_raw', JSON.stringify(filtrado, null, 2))
        setErrors({})
      } catch {
        setErrors((e) => ({ ...e, datos_display_raw: 'El archivo no es un JSON válido' }))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.sistema_id)                e.sistema_id           = 'Selecciona un sistema'
    if (!form.referencia_externa.trim()) e.referencia_externa   = 'La referencia externa es requerida'
    if (!form.fecha_inicio)              e.fecha_inicio         = 'La fecha de inicio es requerida'
    if (form.datos_display_raw.trim() && !parsedJson) {
      e.datos_display_raw = 'El JSON no es válido. Revisa la sintaxis.'
    }
    setErrors(e)
    if (e.sistema_id || e.referencia_externa || e.fecha_inicio) setTab('datos')
    else if (e.datos_display_raw) setTab('json')
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave(form)
    onClose()
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  const TABS = [
    { key: 'datos', label: '① Datos del registro' },
    { key: 'json',  label: '② Contenido a mostrar (JSON)' },
  ] as const

  // Placeholder de referencia usando el ejemplo del sistema actual
  const ejemploActual     = getEjemploPorSistema(sistemaActual)
  const placeholderRef    = sistemaActual ? ejemploActual.referencia : 'Ej: TC-2025-00123'

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Generar nuevo QR</div>
            <div className={styles.sub}>
              El código QR se genera automáticamente al guardar el registro
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key === 'json' && parsedJson && (
                <span className={styles.tabOk}>✓</span>
              )}
              {t.key === 'json' && errors.datos_display_raw && (
                <span className={styles.tabErr}>!</span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* ── TAB: Datos ── */}
          {tab === 'datos' && (
            <div className={styles.grid}>

              {/* Sistema */}
              <div className={`${styles.group} ${styles.full}`}>
                <label className={styles.label}>Sistema *</label>

                {sistemas.length === 0 ? (
                  <div className={styles.emptyMsg}>
                    ⚠️ No hay sistemas disponibles. Verifica la conexión con el backend.
                  </div>
                ) : (
                  <div className={styles.sistemaGrid}>
                    {sistemas.map((s) => (
                      <div
                        key={s.id}
                        className={`${styles.sistemaChip} ${form.sistema_id === s.id ? styles.sistemaChipOn : ''}`}
                        style={
                          form.sistema_id === s.id
                            ? {
                                borderColor: s.color_hex,
                                backgroundColor: (s.color_hex ?? '#666') + '12',
                                color: s.color_hex,
                              }
                            : {}
                        }
                        onClick={() => setField('sistema_id', s.id)}
                      >
                        <span className={styles.sistemaIcon}>{s.icono}</span>
                        <span className={styles.sistemaNombre}>{s.nombre}</span>
                      </div>
                    ))}
                  </div>
                )}

                {errors.sistema_id && (
                  <span className={styles.errMsg}>{errors.sistema_id}</span>
                )}
              </div>

              {/* Referencia externa */}
              <div className={`${styles.group} ${styles.full}`}>
                <label className={styles.label}>Referencia externa *</label>
                <input
                  className={`${styles.input} ${errors.referencia_externa ? styles.inputErr : ''}`}
                  value={form.referencia_externa}
                  onChange={(e) => setField('referencia_externa', e.target.value)}
                  placeholder={placeholderRef}
                />
                <span className={styles.hint}>
                  Número de trámite, cédula, placa, código de evento, etc.
                </span>
                {errors.referencia_externa && (
                  <span className={styles.errMsg}>{errors.referencia_externa}</span>
                )}
              </div>

              {/* Fechas */}
              <div className={styles.group}>
                <label className={styles.label}>Fecha de inicio *</label>
                <input
                  className={`${styles.input} ${errors.fecha_inicio ? styles.inputErr : ''}`}
                  type="date"
                  value={form.fecha_inicio}
                  onChange={(e) => setField('fecha_inicio', e.target.value)}
                />
                {errors.fecha_inicio && (
                  <span className={styles.errMsg}>{errors.fecha_inicio}</span>
                )}
              </div>

              <div className={styles.group}>
                <label className={styles.label}>
                  Fecha de vencimiento{' '}
                  <span className={styles.optional}>(opcional)</span>
                </label>
                <input
                  className={styles.input}
                  type="date"
                  value={form.fecha_vencimiento}
                  onChange={(e) => setField('fecha_vencimiento', e.target.value)}
                />
              </div>

              {/* Estado */}
              <div className={`${styles.group} ${styles.full}`}>
                <label className={styles.label}>Estado inicial</label>
                <div className={styles.radioRow}>
                  {(['activo', 'suspendido'] as EstadoRegistro[]).map((est) => (
                    <div
                      key={est}
                      className={`${styles.radioChip} ${form.estado === est ? styles[`radio_${est}`] : ''}`}
                      onClick={() => setField('estado', est)}
                    >
                      ● {est === 'activo' ? 'Activo' : 'Suspendido'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: JSON ── */}
          {tab === 'json' && (
            <div className={styles.jsonTab}>

              {/* Acciones rápidas */}
              <div className={styles.jsonActions}>
                <button
                  className={styles.btnAccion}
                  onClick={cargarEjemplo}
                  disabled={!form.sistema_id}
                  title={!form.sistema_id ? 'Primero selecciona un sistema' : ''}
                >
                  💡 Cargar ejemplo{sistemaActual ? ` para ${sistemaActual.nombre}` : ''}
                </button>
                <button
                  className={styles.btnAccion}
                  onClick={() => fileRef.current?.click()}
                >
                  📂 Subir archivo .json
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json,application/json"
                  className={styles.fileInput}
                  onChange={handleFileUpload}
                />
              </div>

              {/* Aviso si no hay sistema seleccionado */}
              {!form.sistema_id && (
                <div className={styles.warnMsg}>
                  ⬅️ Vuelve a la pestaña anterior y selecciona un sistema primero.
                </div>
              )}

              {/* Editor JSON */}
              <div className={styles.group}>
                <label className={styles.label}>
                  datos_display — campos a mostrar al escanear el QR
                </label>
                <textarea
                  className={`${styles.jsonEditor} ${errors.datos_display_raw ? styles.inputErr : ''} ${parsedJson && !errors.datos_display_raw ? styles.jsonOk : ''}`}
                  rows={12}
                  value={form.datos_display_raw}
                  onChange={(e) => setField('datos_display_raw', e.target.value)}
                  placeholder={`{\n  "campo1": "valor",\n  "campo2": "valor"\n}`}
                  spellCheck={false}
                />
                {errors.datos_display_raw && (
                  <span className={styles.errMsg}>{errors.datos_display_raw}</span>
                )}
                {!jsonValido && form.datos_display_raw.trim() && (
                  <span className={styles.errMsg}>JSON inválido — revisa la sintaxis</span>
                )}
              </div>

              {/* Preview de campos */}
              {parsedJson && Object.keys(parsedJsonObject).length > 0 && (
                <div className={styles.preview}>
                  <div className={styles.previewTitle}>
                    Vista previa — {Object.keys(parsedJsonObject).length} campos registrados
                  </div>
                  <div className={styles.previewGrid}>
                    {Object.entries(parsedJsonObject).map(([k, v]) => (
                      <div key={k} className={styles.previewItem}>
                        <span className={styles.previewKey}>
                          {k.replace(/_/g, ' ')}
                        </span>
                        <span className={styles.previewVal}>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          {tab === 'datos' && (
            <button className={styles.btnNext} onClick={() => setTab('json')}>
              Siguiente → Contenido JSON
            </button>
          )}
          {tab === 'json' && (
            <button className={styles.btnPrimary} onClick={handleSave}>
              🔲 Generar QR
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

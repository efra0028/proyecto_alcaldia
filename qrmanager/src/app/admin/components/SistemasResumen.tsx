import type { SistemaResumen } from '../types'
import styles from './SistemasResumen.module.css'

const MOCK: SistemaResumen[] = [
  { id: '1', nombre: 'Taxi Seguro',       color_hex: '#C8102E', emoji: '🚕', total_registros: 847, registros_vigentes: 712, qrs_generados: 802, escaneos_hoy: 143 },
  { id: '2', nombre: 'Transporte Público',color_hex: '#1D4ED8', emoji: '🚌', total_registros: 312, registros_vigentes: 298, qrs_generados: 310, escaneos_hoy: 87  },
  { id: '3', nombre: 'Carnaval & Cultura',color_hex: '#7C3AED', emoji: '🎭', total_registros: 156, registros_vigentes: 120, qrs_generados: 148, escaneos_hoy: 52  },
  { id: '4', nombre: 'Tráfico y Vialidad',color_hex: '#D97706', emoji: '🚦', total_registros: 203, registros_vigentes: 189, qrs_generados: 198, escaneos_hoy: 31  },
  { id: '5', nombre: 'Permisos de Baile', color_hex: '#059669', emoji: '🎵', total_registros: 94,  registros_vigentes: 78,  qrs_generados: 90,  escaneos_hoy: 18  },
]

interface Props { sistemas?: SistemaResumen[] }

export default function SistemasResumen({ sistemas = MOCK }: Props) {
  const maxEscaneos = Math.max(...sistemas.map(s => s.escaneos_hoy))

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Resumen por sistema</span>
        <span className={styles.headerSub}>Actividad de hoy</span>
      </div>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th>SISTEMA</th>
            <th>REGISTROS</th>
            <th>ESCANEOS HOY</th>
          </tr>
        </thead>
        <tbody>
          {sistemas.map(s => {
            const pct = Math.round((s.registros_vigentes / s.total_registros) * 100)
            const scanPct = Math.round((s.escaneos_hoy / maxEscaneos) * 100)
            return (
              <tr key={s.id} className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.sistemaNombre}>
                    <div
                      className={styles.sistemaIcono}
                      style={{ background: `${s.color_hex}18` }}
                    >
                      {s.emoji}
                    </div>
                    <span className={styles.sistemaNombreText}>{s.nombre}</span>
                  </div>
                </td>
                <td className={styles.td}>
                  <div className={styles.barWrap}>
                    <div className={styles.bar}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${pct}%`, background: s.color_hex }}
                      />
                    </div>
                    <span className={styles.pct}>{pct}%</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#9B9992', marginTop: 2 }}>
                    {s.registros_vigentes} / {s.total_registros} vigentes
                  </div>
                </td>
                <td className={styles.td}>
                  <span
                    className={styles.scan}
                    style={{ background: `${s.color_hex}15`, color: s.color_hex }}
                  >
                    {s.escaneos_hoy} escaneos
                  </span>
                  <div className={styles.bar} style={{ marginTop: 4 }}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${scanPct}%`, background: s.color_hex }}
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
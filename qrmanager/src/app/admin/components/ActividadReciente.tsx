import type { ActividadReciente as Actividad } from '../types'
import styles from './ActividadReciente.module.css'

const MOCK_ACTIVIDAD: Actividad[] = [
  { id: 1, tipo: 'qr_generado',     descripcion: 'QR generado para Carlos Mamani — Taxi Seguro',        usuario: 'J. Flores',    sistema: 'Taxi Seguro',     tiempo: 'hace 5 min',   color: '#C8102E' },
  { id: 2, tipo: 'registro_creado', descripcion: 'Nuevo registro: Permiso Carnaval — Comparsa Los Andes',usuario: 'M. Torrez',    sistema: 'Carnaval',        tiempo: 'hace 18 min',  color: '#7C3AED' },
  { id: 3, tipo: 'publicacion',     descripcion: 'Publicación "Día del Peatón 2025" publicada',          usuario: 'C. Rodríguez', sistema: 'General',         tiempo: 'hace 1h',      color: '#0F766E' },
  { id: 4, tipo: 'verificacion',    descripcion: 'Verificación manual — Placa 1234-ABC, resultado: vigente', usuario: 'Sistema',  sistema: 'Tráfico',         tiempo: 'hace 1h 20m',  color: '#D97706' },
  { id: 5, tipo: 'suspension',      descripcion: 'Registro suspendido — Licencia TX-2210-CH',            usuario: 'J. Flores',    sistema: 'Taxi Seguro',     tiempo: 'hace 2h',      color: '#B91C1C' },
  { id: 6, tipo: 'qr_generado',     descripcion: 'QR generado para Local "Ritmos del Sur" — Baile',      usuario: 'M. Torrez',    sistema: 'Permisos Baile',  tiempo: 'hace 3h',      color: '#059669' },
]

interface Props {
  actividades?: Actividad[]
}

export default function ActividadReciente({ actividades = MOCK_ACTIVIDAD }: Props) {
  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Actividad reciente</span>
        <button className={styles.verTodo}>Ver todo →</button>
      </div>
      <div className={styles.list}>
        {actividades.length === 0 ? (
          <div className={styles.empty}>Sin actividad reciente</div>
        ) : (
          actividades.map(act => (
            <div key={act.id} className={styles.item}>
              <div className={styles.dot} style={{ background: act.color }} />
              <div className={styles.itemBody}>
                <div className={styles.itemDesc}>{act.descripcion}</div>
                <div className={styles.itemMeta}>
                  <span>{act.usuario}</span>
                  <span>·</span>
                  <span className={styles.itemSistema}>{act.sistema}</span>
                </div>
              </div>
              <div className={styles.itemTime}>{act.tiempo}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
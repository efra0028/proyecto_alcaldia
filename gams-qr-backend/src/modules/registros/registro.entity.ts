import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sistema } from '../sistemas/sistema.entity';
import { EstadoRegistro } from '../estados-registro/estado-registro.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('registros')
export class Registro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sistema_id: string;

  @Column({ length: 100 })
  referencia_externa: string; // ej: número de placa, cédula, código catastral

  @Column({ type: 'jsonb' })
  datos_display: Record<string, unknown>; // datos a mostrar al escanear el QR

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'date', nullable: true })
  fecha_vencimiento: Date; // NULL = sin vencimiento

  @Column()
  estado_id: number;

  @Column({ nullable: true })
  suspendido_por: number;

  @Column({ type: 'timestamp', nullable: true })
  suspendido_en: Date;

  @Column({ type: 'text', nullable: true })
  motivo_suspension: string;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  update_at: Date;

  @Column()
  created_by: number;

  @Column()
  updated_by: number;

  // Relaciones
  @ManyToOne(() => Sistema)
  @JoinColumn({ name: 'sistema_id' })
  sistema: Sistema;

  @ManyToOne(() => EstadoRegistro)
  @JoinColumn({ name: 'estado_id' })
  estado: EstadoRegistro;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'suspendido_por' })
  suspensor: Usuario;
}

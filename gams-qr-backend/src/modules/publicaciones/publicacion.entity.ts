import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TipoPublicacion } from '../tipos-publicacion/tipo-publicacion.entity';
import { EstadoPublicacion } from '../estados-publicacion/estado-publicacion.entity';

@Entity('publicaciones')
export class Publicacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  tipo_id!: number;

  @Column({ length: 255 })
  titulo!: string;

  @Column({ type: 'jsonb' })
  contenido!: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  adjuntos_urls!: Record<string, unknown> | null;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  fecha_publicacion!: Date;

  @Column({ type: 'date', nullable: true })
  fecha_vencimiento!: Date | null;

  @Column()
  estado_id!: number;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  update_at!: Date;

  @Column()
  created_by!: number;

  @Column()
  updated_by!: number;

  // ✅ Campos que existen en la BD pero faltaban en el entity
  @Column({ default: false })
  destacada!: boolean;

  @Column({ default: 0 })
  orden_carrusel!: number;

  @ManyToOne(() => TipoPublicacion)
  @JoinColumn({ name: 'tipo_id' })
  tipo!: TipoPublicacion;

  @ManyToOne(() => EstadoPublicacion)
  @JoinColumn({ name: 'estado_id' })
  estado!: EstadoPublicacion;
}

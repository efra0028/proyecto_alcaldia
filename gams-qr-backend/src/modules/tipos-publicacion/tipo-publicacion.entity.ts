import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sistema } from '../sistemas/sistema.entity';

@Entity('tipos_publicacion')
export class TipoPublicacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  sistema_id: string;

  @Column({ length: 100 })
  nombre: string; // ej: 'Resolución', 'Aviso de multa', 'Aviso predial'

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  update_at: Date;

  @Column()
  created_by: number;

  @Column()
  updated_by: number;

  @ManyToOne(() => Sistema)
  @JoinColumn({ name: 'sistema_id' })
  sistema: Sistema;
}

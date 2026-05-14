import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipos_publicacion')
export class TipoPublicacion {
  @PrimaryGeneratedColumn()
  id!: number;

  // sistema_id ya no es relevante — tipos son globales
  @Column({ type: 'uuid', nullable: true })
  sistema_id!: string | null;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  // Agrega color_hex para que el frontend pueda usarlo
  @Column({ length: 7, default: '#000000' })
  color_hex!: string;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  update_at!: Date;

  @Column({ nullable: true })
  created_by!: number;

  @Column({ nullable: true })
  updated_by!: number;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sistemas')
export class Sistema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 7, nullable: true })
  color_hex: string;

  @Column({ length: 200, nullable: true })
  logo_url: string;

  @Column({ length: 100, unique: true })
  api_key: string;

  @Column({ type: 'jsonb', nullable: true })
  schema_campos: object;

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
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sistemas')
export class Sistema {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 150 })
  nombre!: string;

  @Column({ nullable: true, type: 'text' })
  descripcion!: string;

  @Column({ name: 'color_hex', default: '#3B82F6', length: 7 })
  color_hex!: string;

  @Column({ name: 'logo_url', nullable: true, length: 200 })
  logo_url!: string;

  @Column({ name: 'api_key', unique: true })
  api_key!: string;

  @Column({ name: 'schema_campos', type: 'jsonb', nullable: true })
  schema_campos!: object;

  @Column({ name: 'is_active', default: true })
  is_active!: boolean;

  @Column({ name: 'created_by', nullable: true })
  created_by!: number;

  @Column({ name: 'updated_by', nullable: true })
  updated_by!: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'update_at' })
  update_at!: Date;
}

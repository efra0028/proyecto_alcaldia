import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Rol } from '../roles/rol.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  nombre!: string;

  @Column({ length: 12, nullable: true, unique: true })
  carnet!: string; // nullable: true, puede ser undefined

  @Column({ length: 150, unique: true })
  email!: string;

  @Column({ length: 255, select: false })
  password_hash!: string;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  update_at!: Date;

  @Column()
  created_by!: number;

  @Column()
  updated_by!: number;

  @ManyToMany(() => Rol)
  @JoinTable({
    name: 'usuario_roles',
    joinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'rol_id', referencedColumnName: 'id' },
  })
  roles!: Rol[];
}

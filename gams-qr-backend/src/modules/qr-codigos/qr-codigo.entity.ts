import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Registro } from '../registros/registro.entity';

@Entity('qr_codigos')
export class QrCodigo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  registro_id!: string;

  @Column({ type: 'uuid', unique: true, default: () => 'gen_random_uuid()' })
  codigo_unico!: string;

  @Column({ length: 500 })
  url_intermedia!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imagen_qr_url!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @ManyToOne(() => Registro)
  @JoinColumn({ name: 'registro_id' })
  registro!: Registro;
}

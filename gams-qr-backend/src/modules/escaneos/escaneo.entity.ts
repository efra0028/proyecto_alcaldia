import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QrCodigo } from '../qr-codigos/qr-codigo.entity';

@Entity('escaneos')
export class Escaneo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  qr_codigo_id!: number;

  @Column({ length: 50 })
  ip_address!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  dispositivo!: string | null;

  @Column({ length: 20 })
  resultado!: string; // 'VALIDO' | 'BLOQUEADO' | 'VENCIDO' | 'EXPIRADO'

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  created_at!: Date;

  @ManyToOne(() => QrCodigo)
  @JoinColumn({ name: 'qr_codigo_id' })
  qr_codigo!: QrCodigo;
}

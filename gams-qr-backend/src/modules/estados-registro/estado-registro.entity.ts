import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('estados_registro')
export class EstadoRegistro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 7, nullable: true })
  color_hex: string;

  @Column({ default: false })
  bloquea_qr: boolean; // si TRUE → el QR de ese registro es inválido al escanear

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

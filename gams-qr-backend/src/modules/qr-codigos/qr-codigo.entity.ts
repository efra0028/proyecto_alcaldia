import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Registro } from '../registros/registro.entity';

@Entity('qr_codigos')
export class QrCodigo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  registro_id: string;

  @Column({ type: 'uuid', unique: true, default: () => 'gen_random_uuid()' })
  codigo_unico: string; // UUID público que va en la URL del QR

  @Column({ length: 500 })
  url_intermedia: string; // URL completa que codifica el QR

  @Column({ length: 500, nullable: true })
  imagen_qr_url: string; // ruta a la imagen PNG del QR

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;

  @ManyToOne(() => Registro)
  @JoinColumn({ name: 'registro_id' })
  registro: Registro;
}

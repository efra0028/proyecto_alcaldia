import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

export enum AccionAuditoria {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity('auditoria')
export class Auditoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  tabla_nombre: string; // ej: 'usuarios', 'registros', 'publicaciones'

  @Column({ type: 'text' })
  registro_id: string; // TEXT para soportar UUID e INT

  @Column({ type: 'enum', enum: AccionAuditoria, enumName: 'accion_auditoria', nullable: true })
  accion: AccionAuditoria;

  @Column({ nullable: true })
  usuario_id: number; // null si fue acción pública (escaneo)

  @Column({ type: 'jsonb', nullable: true })
  datos_antes: object;

  @Column({ type: 'jsonb', nullable: true })
  datos_despues: object;

  @Column({ length: 50, nullable: true })
  ip_address: string;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}

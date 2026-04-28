import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria, AccionAuditoria } from './auditoria.entity';

export interface RegistrarAuditoriaDto {
  tabla_nombre: string;
  registro_id: string;
  accion: AccionAuditoria;
  usuario_id?: number;
  datos_antes?: object;
  datos_despues?: object;
  ip_address?: string;
}

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private auditoriaRepo: Repository<Auditoria>,
  ) {}

  // Método que llama el interceptor automáticamente
  async registrar(dto: RegistrarAuditoriaDto): Promise<void> {
    const registro = this.auditoriaRepo.create(dto);
    await this.auditoriaRepo.save(registro);
  }

  // Listar logs de auditoría (solo SUPER_ADMIN)
  async findAll(tabla?: string, limite = 100) {
    const query = this.auditoriaRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.usuario', 'usuario')
      .orderBy('a.created_at', 'DESC')
      .take(limite);

    if (tabla) query.where('a.tabla_nombre = :tabla', { tabla });

    return query.getMany();
  }

  // Historial de un registro específico
  async findByRegistro(tabla: string, registroId: string) {
    return this.auditoriaRepo.find({
      where: { tabla_nombre: tabla, registro_id: registroId },
      relations: ['usuario'],
      order: { created_at: 'DESC' },
    });
  }
}

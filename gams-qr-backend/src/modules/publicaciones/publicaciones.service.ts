import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Publicacion } from './publicacion.entity';
import { EstadoPublicacion } from '../estados-publicacion/estado-publicacion.entity';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectRepository(Publicacion)
    private repo: Repository<Publicacion>,
    @InjectRepository(EstadoPublicacion)
    private estadoRepo: Repository<EstadoPublicacion>,
  ) {}

  // Listar solo ACTIVAS (endpoint público)
  findActivas() {
    return this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.tipo', 'tipo')
      .leftJoinAndSelect('p.estado', 'estado')
      .where('estado.nombre = :nombre', { nombre: 'ACTIVA' })
      .orderBy('p.fecha_publicacion', 'DESC')
      .getMany();
  }

  // Listar todas (panel admin)
  findAll() {
    return this.repo.find({
      relations: ['tipo', 'estado'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const pub = await this.repo.findOne({ where: { id }, relations: ['tipo', 'estado'] });
    if (!pub) throw new NotFoundException(`Publicación ${id} no encontrada`);
    return pub;
  }

  async create(dto: CreatePublicacionDto, currentUserId: number) {
    const estado = await this.estadoRepo.findOne({ where: { id: dto.estado_id } });
    if (!estado) throw new BadRequestException(`Estado #${dto.estado_id} no existe`);

    const pub = this.repo.create({
      ...dto,
      created_by: currentUserId,
      updated_by: currentUserId,
    });
    return this.repo.save(pub);
  }

  async update(id: string, dto: UpdatePublicacionDto, currentUserId: number) {
    const pub = await this.findOne(id);

    if (dto.estado_id) {
      const estado = await this.estadoRepo.findOne({ where: { id: dto.estado_id } });
      if (!estado) throw new BadRequestException(`Estado #${dto.estado_id} no existe`);
    }

    Object.assign(pub, { ...dto, updated_by: currentUserId, update_at: new Date() });
    return this.repo.save(pub);
  }

  async remove(id: string) {
    const pub = await this.findOne(id);
    await this.repo.remove(pub);
    return { mensaje: 'Publicación eliminada correctamente' };
  }

  // ── CRON JOB: Marcar publicaciones vencidas cada día a medianoche ──
  @Cron('0 0 * * *')
  async marcarVencidas() {
    const estadoVencida = await this.estadoRepo.findOne({ where: { nombre: 'VENCIDA' } });
    if (!estadoVencida) return;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    await this.repo
      .createQueryBuilder()
      .update(Publicacion)
      .set({ estado_id: estadoVencida.id, update_at: new Date() })
      .where('fecha_vencimiento < :hoy', { hoy })
      .andWhere('estado_id != :vencida', { vencida: estadoVencida.id })
      .andWhere('fecha_vencimiento IS NOT NULL')
      .execute();
  }
}

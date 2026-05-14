import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Publicacion } from './publicacion.entity';
import { EstadoPublicacion } from '../estados-publicacion/estado-publicacion.entity';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';

@Injectable()
export class PublicacionesService {
  private readonly logger = new Logger(PublicacionesService.name);

  constructor(
    @InjectRepository(Publicacion)
    private repo: Repository<Publicacion>,
    @InjectRepository(EstadoPublicacion)
    private estadoRepo: Repository<EstadoPublicacion>,
  ) {}

  // Listar solo ACTIVAS (endpoint público)
  async findActivas() {
    try {
      return await this.repo
        .createQueryBuilder('publicacion')
        .leftJoinAndSelect('publicacion.tipo', 'tipo')
        .leftJoinAndSelect('publicacion.estado', 'estado')
        .where('estado.nombre = :nombre', { nombre: 'ACTIVA' })
        .orderBy('publicacion.fecha_publicacion', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error(
        'Error al cargar publicaciones activas',
        error as Error,
      );
      throw error;
    }
  }

  // Listar todas (panel admin)
  findAll() {
    return this.repo.find({
      relations: ['tipo', 'estado'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const pub = await this.repo.findOne({
      where: { id },
      relations: ['tipo', 'estado'],
    });
    if (!pub) throw new NotFoundException(`Publicación ${id} no encontrada`);
    return pub;
  }

  async create(dto: CreatePublicacionDto, currentUserId: number) {
    const estado = await this.estadoRepo.findOne({
      where: { id: dto.estado_id },
    });
    if (!estado)
      throw new BadRequestException(`Estado #${dto.estado_id} no existe`);

    const pub = this.repo.create({
      ...dto,
      created_by: currentUserId,
      updated_by: currentUserId,
    });
    const saved = await this.repo.save(pub);
    return this.repo.findOne({
      where: { id: saved.id },
      relations: ['tipo', 'estado'],
    });
  }

  async update(id: string, dto: UpdatePublicacionDto, currentUserId: number) {
    const pub = await this.findOne(id);

    if (dto.estado_id) {
      const estado = await this.estadoRepo.findOne({
        where: { id: dto.estado_id },
      });
      if (!estado)
        throw new BadRequestException(`Estado #${dto.estado_id} no existe`);
    }

    Object.assign(pub, {
      ...dto,
      updated_by: currentUserId,
      update_at: new Date(),
    });
    await this.repo.save(pub);
    return this.findOne(id);
  }

  async publish(id: string, currentUserId: number) {
    const estadoActiva = await this.estadoRepo.findOne({
      where: { nombre: 'ACTIVA' },
    });
    if (!estadoActiva)
      throw new BadRequestException('Estado ACTIVA no encontrado');

    await this.repo.update(id, {
      estado_id: estadoActiva.id,
      updated_by: currentUserId,
      update_at: new Date(),
    });

    return this.findOne(id);
  }

  async unpublish(id: string, currentUserId: number) {
    const estadoInactiva = await this.estadoRepo.findOne({
      where: { nombre: 'INACTIVA' },
    });
    if (!estadoInactiva)
      throw new BadRequestException('Estado INACTIVA no encontrado');

    await this.repo.update(id, {
      estado_id: estadoInactiva.id,
      updated_by: currentUserId,
      update_at: new Date(),
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const pub = await this.findOne(id);
    await this.repo.remove(pub);
    return { mensaje: 'Publicación eliminada correctamente' };
  }

  // ── CRON JOB: Marcar publicaciones vencidas cada día a medianoche ──
  @Cron('0 0 * * *')
  async marcarVencidas() {
    const estadoVencida = await this.estadoRepo.findOne({
      where: { nombre: 'VENCIDA' },
    });
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

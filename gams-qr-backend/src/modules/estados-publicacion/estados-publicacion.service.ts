import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoPublicacion } from './estado-publicacion.entity';
import { CreateEstadoPublicacionDto } from './dto/create-estado-publicacion.dto';

@Injectable()
export class EstadosPublicacionService {
  constructor(
    @InjectRepository(EstadoPublicacion)
    private repo: Repository<EstadoPublicacion>,
  ) {}

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const estado = await this.repo.findOne({ where: { id } });
    if (!estado) throw new NotFoundException(`Estado #${id} no encontrado`);
    return estado;
  }

  async create(dto: CreateEstadoPublicacionDto, currentUserId: number) {
    const existe = await this.repo.findOne({ where: { nombre: dto.nombre } });
    if (existe)
      throw new ConflictException(`El estado "${dto.nombre}" ya existe`);

    const estado = this.repo.create({
      ...dto,
      created_by: currentUserId,
      updated_by: currentUserId,
    });
    return this.repo.save(estado);
  }

  async update(
    id: number,
    dto: Partial<CreateEstadoPublicacionDto>,
    currentUserId: number,
  ) {
    const estado = await this.findOne(id);

    if (dto.nombre && dto.nombre !== estado.nombre) {
      const existe = await this.repo.findOne({ where: { nombre: dto.nombre } });
      if (existe)
        throw new ConflictException(`El estado "${dto.nombre}" ya existe`);
    }

    Object.assign(estado, {
      ...dto,
      updated_by: currentUserId,
      update_at: new Date(),
    });
    return this.repo.save(estado);
  }

  async toggleActivo(id: number, currentUserId: number) {
    const estado = await this.findOne(id);
    estado.is_active = !estado.is_active;
    estado.updated_by = currentUserId;
    estado.update_at = new Date();
    await this.repo.save(estado);
    return {
      mensaje: `Estado ${estado.is_active ? 'activado' : 'desactivado'}`,
      is_active: estado.is_active,
    };
  }
}

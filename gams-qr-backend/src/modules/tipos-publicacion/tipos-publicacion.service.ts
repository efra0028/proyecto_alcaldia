import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { TipoPublicacion } from './tipo-publicacion.entity';
import { CreateTipoPublicacionDto } from './dto/create-tipo-publicacion.dto';

@Injectable()
export class TiposPublicacionService {
  constructor(
    @InjectRepository(TipoPublicacion)
    private repo: Repository<TipoPublicacion>,
  ) {}

  findAll() {
    return this.repo.find({
      where: { is_active: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const tipo = await this.repo.findOne({
      where: { id },
    });
    if (!tipo)
      throw new NotFoundException(`Tipo de publicación #${id} no encontrado`);
    return tipo;
  }

  async create(dto: CreateTipoPublicacionDto, currentUserId: number) {
    const existe = await this.repo.findOne({
      where: {
        nombre: dto.nombre,
        sistema_id: IsNull(),
      },
    });
    if (existe)
      throw new ConflictException(`El tipo "${dto.nombre}" ya existe`);

    const tipo = this.repo.create({
      ...dto,
      sistema_id: null,
      created_by: currentUserId,
      updated_by: currentUserId,
    });
    return this.repo.save(tipo);
  }

  async update(
    id: number,
    dto: Partial<CreateTipoPublicacionDto>,
    currentUserId: number,
  ) {
    const tipo = await this.findOne(id);
    Object.assign(tipo, {
      ...dto,
      updated_by: currentUserId,
      update_at: new Date(),
    });
    return this.repo.save(tipo);
  }

  async toggleActivo(id: number, currentUserId: number) {
    const tipo = await this.findOne(id);
    tipo.is_active = !tipo.is_active;
    tipo.updated_by = currentUserId;
    tipo.update_at = new Date();
    await this.repo.save(tipo);
    return {
      mensaje: `Tipo ${tipo.is_active ? 'activado' : 'desactivado'}`,
      is_active: tipo.is_active,
    };
  }
}

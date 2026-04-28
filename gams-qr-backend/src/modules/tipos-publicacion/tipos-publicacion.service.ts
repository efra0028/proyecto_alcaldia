import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoPublicacion } from './tipo-publicacion.entity';
import { CreateTipoPublicacionDto } from './dto/create-tipo-publicacion.dto';

@Injectable()
export class TiposPublicacionService {
  constructor(
    @InjectRepository(TipoPublicacion)
    private repo: Repository<TipoPublicacion>,
  ) {}

  findAll(sistema_id?: string) {
    const where = sistema_id ? { sistema_id } : {};
    return this.repo.find({ where, relations: ['sistema'], order: { nombre: 'ASC' } });
  }

  async findOne(id: number) {
    const tipo = await this.repo.findOne({ where: { id }, relations: ['sistema'] });
    if (!tipo) throw new NotFoundException(`Tipo de publicación #${id} no encontrado`);
    return tipo;
  }

  async create(dto: CreateTipoPublicacionDto, currentUserId: number) {
    const existe = await this.repo.findOne({
      where: { sistema_id: dto.sistema_id, nombre: dto.nombre },
    });
    if (existe) throw new ConflictException(`El tipo "${dto.nombre}" ya existe en este sistema`);

    const tipo = this.repo.create({ ...dto, created_by: currentUserId, updated_by: currentUserId });
    return this.repo.save(tipo);
  }

  async update(id: number, dto: Partial<CreateTipoPublicacionDto>, currentUserId: number) {
    const tipo = await this.findOne(id);
    Object.assign(tipo, { ...dto, updated_by: currentUserId, update_at: new Date() });
    return this.repo.save(tipo);
  }

  async toggleActivo(id: number, currentUserId: number) {
    const tipo = await this.findOne(id);
    tipo.is_active = !tipo.is_active;
    tipo.updated_by = currentUserId;
    tipo.update_at = new Date();
    await this.repo.save(tipo);
    return { mensaje: `Tipo ${tipo.is_active ? 'activado' : 'desactivado'}`, is_active: tipo.is_active };
  }
}

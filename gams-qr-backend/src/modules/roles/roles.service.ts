import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private rolRepo: Repository<Rol>,
  ) {}

  findAll() {
    return this.rolRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const rol = await this.rolRepo.findOne({ where: { id } });
    if (!rol) throw new NotFoundException(`Rol #${id} no encontrado`);
    return rol;
  }

  async create(dto: CreateRolDto, currentUserId: number) {
    const existe = await this.rolRepo.findOne({ where: { nombre: dto.nombre } });
    if (existe) throw new ConflictException(`El rol "${dto.nombre}" ya existe`);

    const rol = this.rolRepo.create({ ...dto, created_by: currentUserId, updated_by: currentUserId });
    return this.rolRepo.save(rol);
  }

  async update(id: number, dto: Partial<CreateRolDto>, currentUserId: number) {
    const rol = await this.findOne(id);

    if (dto.nombre && dto.nombre !== rol.nombre) {
      const existe = await this.rolRepo.findOne({ where: { nombre: dto.nombre } });
      if (existe) throw new ConflictException(`El rol "${dto.nombre}" ya existe`);
    }

    Object.assign(rol, { ...dto, updated_by: currentUserId, update_at: new Date() });
    return this.rolRepo.save(rol);
  }

  async toggleActivo(id: number, currentUserId: number) {
    const rol = await this.findOne(id);
    rol.is_active = !rol.is_active;
    rol.updated_by = currentUserId;
    rol.update_at = new Date();
    await this.rolRepo.save(rol);
    return { mensaje: `Rol ${rol.is_active ? 'activado' : 'desactivado'}`, is_active: rol.is_active };
  }
}

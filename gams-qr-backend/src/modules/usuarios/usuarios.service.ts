import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './usuario.entity';
import { Rol } from '../roles/rol.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolRepo: Repository<Rol>,
  ) {}

  findAll() {
    // Usamos QueryBuilder porque TypeORM no soporta 'select' + 'relations' juntos en find()
    return this.usuarioRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.roles', 'roles')
      .select(['u.id', 'u.nombre', 'u.carnet', 'u.email', 'u.is_active', 'u.created_at', 'u.update_at'])
      .addSelect(['roles.id', 'roles.nombre'])
      .orderBy('u.id', 'ASC')
      .getMany();
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!usuario) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return usuario;
  }

  async create(dto: CreateUsuarioDto, currentUserId: number) {
    // Verificar email duplicado
    const existe = await this.usuarioRepo.findOne({ where: { email: dto.email } });
    if (existe) throw new ConflictException(`El email ${dto.email} ya está registrado`);

    // Hashear contraseña
    const password_hash = await bcrypt.hash(dto.password, 10);

    // Buscar roles a asignar
    let roles: Rol[] = [];
    if (dto.rol_ids && dto.rol_ids.length > 0) {
      roles = await this.rolRepo.findBy({ id: In(dto.rol_ids) });
    }

    const usuario = this.usuarioRepo.create({
      nombre: dto.nombre,
      carnet: dto.carnet,
      email: dto.email,
      password_hash,
      roles,
      created_by: currentUserId,
      updated_by: currentUserId,
    });

    const saved = await this.usuarioRepo.save(usuario);

    // Retornar sin password_hash (select:false ya lo omite en TypeORM, pero por seguridad lo excluimos)
    const { password_hash: _omit, ...result } = saved as unknown as Record<string, unknown>;
    return result;
  }

  async update(id: number, dto: UpdateUsuarioDto, currentUserId: number) {
    const usuario = await this.findOne(id);

    // Verificar email duplicado si se está cambiando
    if (dto.email && dto.email !== usuario.email) {
      const existe = await this.usuarioRepo.findOne({ where: { email: dto.email } });
      if (existe) throw new ConflictException(`El email ${dto.email} ya está registrado`);
    }

    // Hashear nueva contraseña si se envió
    if (dto.password) {
      Object.assign(usuario, { password_hash: await bcrypt.hash(dto.password, 10) });
    }

    // Actualizar roles si se enviaron
    if (dto.rol_ids && dto.rol_ids.length > 0) {
      usuario.roles = await this.rolRepo.findBy({ id: In(dto.rol_ids) });
    }

    Object.assign(usuario, {
      nombre: dto.nombre ?? usuario.nombre,
      carnet: dto.carnet ?? usuario.carnet,
      email: dto.email ?? usuario.email,
      updated_by: currentUserId,
      update_at: new Date(),
    });

    return this.usuarioRepo.save(usuario);
  }

  async toggleActivo(id: number, currentUserId: number) {
    const usuario = await this.findOne(id);
    usuario.is_active = !usuario.is_active;
    usuario.updated_by = currentUserId;
    usuario.update_at = new Date();
    await this.usuarioRepo.save(usuario);
    return {
      mensaje: `Usuario ${usuario.is_active ? 'activado' : 'desactivado'} correctamente`,
      is_active: usuario.is_active,
    };
  }
}

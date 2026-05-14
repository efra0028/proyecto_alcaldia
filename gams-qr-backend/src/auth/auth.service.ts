import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../modules/usuarios/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // 1. Buscar usuario por email (incluyendo password_hash que está oculto por defecto)
    const usuario = await this.usuarioRepo
      .createQueryBuilder('u')
      .addSelect('u.password_hash')
      .leftJoinAndSelect('u.roles', 'roles')
      .where('u.email = :email', { email: dto.email })
      .getOne();

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!usuario.is_active) {
      throw new UnauthorizedException(
        'Usuario inactivo. Contacta al administrador',
      );
    }

    // 2. Verificar contraseña
    const passwordValido = await bcrypt.compare(
      dto.password,
      usuario.password_hash,
    );
    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 3. Generar JWT
    const roles = usuario.roles?.map((r) => r.nombre) ?? [];
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      roles,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        roles,
      },
    };
  }

  async getMe(userId: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      carnet: usuario.carnet,
      is_active: usuario.is_active,
      roles: usuario.roles?.map((r) => r.nombre) ?? [],
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    // Cargar usuario con password_hash
    const usuario = await this.usuarioRepo
      .createQueryBuilder('u')
      .addSelect('u.password_hash')
      .where('u.id = :id', { id: userId })
      .getOne();

    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

    // Verificar contraseña actual
    const valida = await bcrypt.compare(
      dto.current_password,
      usuario.password_hash,
    );
    if (!valida)
      throw new BadRequestException('La contraseña actual es incorrecta');

    // Guardar nueva contraseña
    usuario.password_hash = await bcrypt.hash(dto.new_password, 10);
    usuario.update_at = new Date();
    await this.usuarioRepo.save(usuario);

    return { mensaje: 'Contraseña actualizada correctamente' };
  }
}

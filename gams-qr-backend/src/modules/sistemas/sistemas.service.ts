import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Sistema } from './sistema.entity';
import { CreateSistemaDto } from './dto/create-sistema.dto';
import { UpdateSistemaDto } from './dto/update-sistema.dto';

@Injectable()
export class SistemasService {
  constructor(
    @InjectRepository(Sistema)
    private sistemaRepo: Repository<Sistema>,
  ) {}

  async findAll() {
    return this.sistemaRepo.find({
      order: { created_at: 'ASC' },
      select: [
        'id',
        'nombre',
        'descripcion',
        'color_hex',
        'logo_url',
        'is_active',
        'created_at',
      ],
    });
  }

  // ── PÚBLICO ───────────────────────────────────────────────────────────────
  async findActivos() {
    return this.sistemaRepo.find({
      where: { is_active: true },
      order: { nombre: 'ASC' },
      select: ['id', 'nombre', 'descripcion', 'color_hex'], // ✅ Cambiado de 'icono' a 'icon'
    });
  }

  async findOne(id: string) {
    const sistema = await this.sistemaRepo.findOne({ where: { id } });
    if (!sistema) throw new NotFoundException(`Sistema ${id} no encontrado`);
    return sistema;
  }

  async create(dto: CreateSistemaDto, currentUserId: number) {
    const existe = await this.sistemaRepo.findOne({
      where: { nombre: dto.nombre },
    });
    if (existe)
      throw new ConflictException(
        `Ya existe un sistema con el nombre "${dto.nombre}"`,
      );

    const api_key = `gams_${crypto.randomBytes(32).toString('hex')}`;

    const sistema = this.sistemaRepo.create({
      ...dto,
      api_key,
      created_by: currentUserId,
      updated_by: currentUserId,
    });

    const saved = await this.sistemaRepo.save(sistema);

    return {
      ...saved,
      api_key,
      aviso: '⚠️ Guarda esta api_key ahora. No se podrá ver de nuevo.',
    };
  }

  async update(id: string, dto: UpdateSistemaDto, currentUserId: number) {
    const sistema = await this.findOne(id);

    if (dto.nombre && dto.nombre !== sistema.nombre) {
      const existe = await this.sistemaRepo.findOne({
        where: { nombre: dto.nombre },
      });
      if (existe)
        throw new ConflictException(
          `Ya existe un sistema con el nombre "${dto.nombre}"`,
        );
    }

    Object.assign(sistema, {
      ...dto,
      updated_by: currentUserId,
      update_at: new Date(),
    });

    return this.sistemaRepo.save(sistema);
  }

  async toggleActivo(id: string, currentUserId: number) {
    const sistema = await this.findOne(id);
    sistema.is_active = !sistema.is_active;
    sistema.updated_by = currentUserId;
    sistema.update_at = new Date();
    await this.sistemaRepo.save(sistema);
    return {
      mensaje: `Sistema ${sistema.is_active ? 'activado' : 'desactivado'} correctamente`,
      is_active: sistema.is_active,
    };
  }

  async regenerarApiKey(id: string, currentUserId: number) {
    const sistema = await this.findOne(id);
    const nueva_api_key = `gams_${crypto.randomBytes(32).toString('hex')}`;
    sistema.api_key = nueva_api_key;
    sistema.updated_by = currentUserId;
    sistema.update_at = new Date();
    await this.sistemaRepo.save(sistema);
    return {
      api_key: nueva_api_key,
      aviso: '⚠️ La api_key anterior quedó invalidada. Guarda esta nueva.',
    };
  }

  async findByApiKey(api_key: string): Promise<Sistema | null> {
    return this.sistemaRepo.findOne({ where: { api_key, is_active: true } });
  }
}

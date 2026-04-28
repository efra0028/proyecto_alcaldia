import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registro } from './registro.entity';
import { EstadoRegistro } from '../estados-registro/estado-registro.entity';
import { CreateRegistroDto } from './dto/create-registro.dto';
import { UpdateRegistroDto } from './dto/update-registro.dto';
import { SuspenderRegistroDto } from './dto/suspender-registro.dto';
import { paginar } from '../../common/dto/paginacion.dto';

@Injectable()
export class RegistrosService {
  constructor(
    @InjectRepository(Registro)
    private registroRepo: Repository<Registro>,
    @InjectRepository(EstadoRegistro)
    private estadoRepo: Repository<EstadoRegistro>,
  ) {}

  async findAll(sistema_id?: string, pagina = 1, limite = 20) {
    const query = this.registroRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.estado', 'estado')
      .leftJoinAndSelect('r.sistema', 'sistema')
      .orderBy('r.created_at', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite);

    if (sistema_id) {
      query.where('r.sistema_id = :sistema_id', { sistema_id });
    }

    const [data, total] = await query.getManyAndCount();
    return paginar(data, total, pagina, limite);
  }

  async findOne(id: string) {
    const registro = await this.registroRepo.findOne({
      where: { id },
      relations: ['estado', 'sistema', 'suspensor'],
    });
    if (!registro) throw new NotFoundException(`Registro ${id} no encontrado`);
    return registro;
  }

  async create(dto: CreateRegistroDto, currentUserId: number) {
    // Verificar que no exista ya ese referencia_externa en ese sistema
    const existe = await this.registroRepo.findOne({
      where: { sistema_id: dto.sistema_id, referencia_externa: dto.referencia_externa },
    });
    if (existe) {
      throw new ConflictException(
        `Ya existe un registro con referencia "${dto.referencia_externa}" en este sistema`,
      );
    }

    // Verificar que el estado exista
    const estado = await this.estadoRepo.findOne({ where: { id: dto.estado_id } });
    if (!estado) throw new BadRequestException(`Estado #${dto.estado_id} no existe`);

    const registro = this.registroRepo.create({
      ...dto,
      created_by: currentUserId,
      updated_by: currentUserId,
    });

    return this.registroRepo.save(registro);
  }

  async update(id: string, dto: UpdateRegistroDto, currentUserId: number) {
    const registro = await this.findOne(id);

    if (dto.estado_id) {
      const estado = await this.estadoRepo.findOne({ where: { id: dto.estado_id } });
      if (!estado) throw new BadRequestException(`Estado #${dto.estado_id} no existe`);
    }

    Object.assign(registro, {
      ...dto,
      updated_by: currentUserId,
      update_at: new Date(),
    });

    return this.registroRepo.save(registro);
  }

  async suspender(id: string, dto: SuspenderRegistroDto, currentUserId: number) {
    const registro = await this.findOne(id);

    // Buscar el estado SUSPENDIDO
    const estadoSuspendido = await this.estadoRepo.findOne({
      where: { nombre: 'SUSPENDIDO' },
    });
    if (!estadoSuspendido) {
      throw new BadRequestException('No existe el estado SUSPENDIDO en el catálogo');
    }

    Object.assign(registro, {
      estado_id: estadoSuspendido.id,
      suspendido_por: currentUserId,
      suspendido_en: new Date(),
      motivo_suspension: dto.motivo,
      updated_by: currentUserId,
      update_at: new Date(),
    });

    return this.registroRepo.save(registro);
  }

  async activar(id: string, currentUserId: number) {
    const registro = await this.findOne(id);

    const estadoActivo = await this.estadoRepo.findOne({
      where: { nombre: 'ACTIVO' },
    });
    if (!estadoActivo) {
      throw new BadRequestException('No existe el estado ACTIVO en el catálogo');
    }

    Object.assign(registro, {
      estado_id: estadoActivo.id,
      suspendido_por: null,
      suspendido_en: null,
      motivo_suspension: null,
      updated_by: currentUserId,
      update_at: new Date(),
    });

    return this.registroRepo.save(registro);
  }
}

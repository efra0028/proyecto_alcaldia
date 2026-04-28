import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { QrCodigo } from './qr-codigo.entity';
import { Escaneo } from '../escaneos/escaneo.entity';
import { Registro } from '../registros/registro.entity';

@Injectable()
export class QrCodigosService {
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(QrCodigo)
    private qrRepo: Repository<QrCodigo>,
    @InjectRepository(Escaneo)
    private escaneoRepo: Repository<Escaneo>,
    @InjectRepository(Registro)
    private registroRepo: Repository<Registro>,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL') ?? 'http://localhost:3000';
  }

  // ── GENERACIÓN ──────────────────────────────────────────────

  async generar(registroId: string, currentUserId: number) {
    // 1. Verificar que el registro exista
    const registro = await this.registroRepo.findOne({
      where: { id: registroId },
      relations: ['estado'],
    });
    if (!registro) throw new NotFoundException(`Registro ${registroId} no encontrado`);

    // 2. Verificar que el registro esté activo
    if (registro.estado?.bloquea_qr) {
      throw new BadRequestException(
        `No se puede generar QR para un registro en estado "${registro.estado.nombre}"`,
      );
    }

    // 3. Verificar que no tenga ya un QR (relación 1-a-1)
    const qrExistente = await this.qrRepo.findOne({ where: { registro_id: registroId } });
    if (qrExistente) {
      throw new ConflictException(
        `Este registro ya tiene un QR. Usa el endpoint /regenerar para renovarlo`,
      );
    }

    return this.crearQr(registroId);
  }

  async regenerar(id: number, currentUserId: number) {
    const qr = await this.qrRepo.findOne({ where: { id } });
    if (!qr) throw new NotFoundException(`QR #${id} no encontrado`);

    // Eliminar imagen anterior si existe
    if (qr.imagen_qr_url) {
      const oldPath = path.join(process.cwd(), 'public', 'qr', `${path.basename(qr.imagen_qr_url)}`);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Nuevo codigo_unico
    const nuevo_codigo = uuidv4();
    const nuevaUrl = `${this.baseUrl}/api/v1/qr-codigos/scan/${nuevo_codigo}`;
    const imagenPath = await this.guardarImagenQr(nuevo_codigo, nuevaUrl);

    qr.codigo_unico = nuevo_codigo;
    qr.url_intermedia = nuevaUrl;
    qr.imagen_qr_url = imagenPath;

    return this.qrRepo.save(qr);
  }

  async findOne(id: number) {
    const qr = await this.qrRepo.findOne({ where: { id }, relations: ['registro'] });
    if (!qr) throw new NotFoundException(`QR #${id} no encontrado`);

    const totalEscaneos = await this.escaneoRepo.count({ where: { qr_codigo_id: id } });
    return { ...qr, total_escaneos: totalEscaneos };
  }

  async findByRegistroId(registroId: string) {
    const qr = await this.qrRepo.findOne({ where: { registro_id: registroId } });
    if (!qr) throw new NotFoundException(`No hay QR generado para este registro`);

    const totalEscaneos = await this.escaneoRepo.count({ where: { qr_codigo_id: qr.id } });
    return { ...qr, total_escaneos: totalEscaneos };
  }

  // ── ESCANEO PÚBLICO ─────────────────────────────────────────

  async scan(codigoUnico: string, ip: string, dispositivo?: string) {
    // 1. Buscar el QR por codigo_unico
    const qr = await this.qrRepo.findOne({
      where: { codigo_unico: codigoUnico },
    });

    if (!qr) {
      return this.registrarYResponder(null, ip, dispositivo, 'BLOQUEADO', {
        valido: false,
        resultado: 'NO_ENCONTRADO',
        mensaje: 'Código QR no encontrado o inválido',
      });
    }

    // 2. Obtener el registro con su estado
    const registro = await this.registroRepo.findOne({
      where: { id: qr.registro_id },
      relations: ['estado'],
    });

    if (!registro) {
      return this.registrarYResponder(qr.id, ip, dispositivo, 'BLOQUEADO', {
        valido: false,
        resultado: 'BLOQUEADO',
        mensaje: 'Registro no encontrado',
      });
    }

    // 3. Verificar fecha de vencimiento
    if (registro.fecha_vencimiento) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const vencimiento = new Date(registro.fecha_vencimiento);
      if (vencimiento < hoy) {
        return this.registrarYResponder(qr.id, ip, dispositivo, 'VENCIDO', {
          valido: false,
          resultado: 'VENCIDO',
          mensaje: 'Este registro está vencido',
          fecha_vencimiento: registro.fecha_vencimiento,
        });
      }
    }

    // 4. Verificar estado del registro
    if (registro.estado?.bloquea_qr) {
      return this.registrarYResponder(qr.id, ip, dispositivo, 'BLOQUEADO', {
        valido: false,
        resultado: 'BLOQUEADO',
        mensaje: `Registro ${registro.estado.nombre.toLowerCase()}`,
        estado: registro.estado.nombre,
        motivo: registro.motivo_suspension ?? null,
      });
    }

    // 5. Todo válido ✅
    return this.registrarYResponder(qr.id, ip, dispositivo, 'VALIDO', {
      valido: true,
      resultado: 'VALIDO',
      mensaje: 'Registro válido',
      datos: registro.datos_display,
      estado: registro.estado?.nombre,
      fecha_inicio: registro.fecha_inicio,
      fecha_vencimiento: registro.fecha_vencimiento ?? null,
    });
  }

  // ── HELPERS PRIVADOS ─────────────────────────────────────────

  private async crearQr(registroId: string) {
    const codigo_unico = uuidv4();
    const url_intermedia = `${this.baseUrl}/api/v1/qr-codigos/scan/${codigo_unico}`;
    const imagen_qr_url = await this.guardarImagenQr(codigo_unico, url_intermedia);

    const qr = this.qrRepo.create({
      registro_id: registroId,
      codigo_unico,
      url_intermedia,
      imagen_qr_url,
    });

    return this.qrRepo.save(qr);
  }

  private async guardarImagenQr(codigo: string, url: string): Promise<string> {
    const storageDir = path.join(process.cwd(), 'public', 'qr');

    // Crear directorio si no existe
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const nombreArchivo = `${codigo}.png`;
    const rutaCompleta = path.join(storageDir, nombreArchivo);

    await QRCode.toFile(rutaCompleta, url, {
      type: 'png',
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    });

    const baseUrl = this.baseUrl;
    return `${baseUrl}/public/qr/${nombreArchivo}`;
  }

  private async registrarYResponder(
    qrId: number | null,
    ip: string,
    dispositivo: string | undefined,
    resultado: string,
    respuesta: object,
  ) {
    // Registrar el escaneo si tenemos el QR ID
    if (qrId) {
      const escaneo = this.escaneoRepo.create({
        qr_codigo_id: qrId,
        ip_address: ip,
        dispositivo: dispositivo ?? null,
        resultado,
      });
      await this.escaneoRepo.save(escaneo);
    }
    return respuesta;
  }
}

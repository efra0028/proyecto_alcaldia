import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Escaneo } from './escaneo.entity';

@Injectable()
export class EscaneosService {
  constructor(
    @InjectRepository(Escaneo)
    private repo: Repository<Escaneo>,
  ) {}

  // Historial de escaneos de un QR específico
  findByQr(qrCodigoId: number) {
    return this.repo.find({
      where: { qr_codigo_id: qrCodigoId },
      order: { created_at: 'DESC' },
    });
  }

  // Últimos escaneos globales (para panel de control)
  findRecientes(limite = 50) {
    return this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.qr_codigo', 'qr')
      .orderBy('e.created_at', 'DESC')
      .take(limite)
      .getMany();
  }

  // Estadísticas básicas en una sola query con GROUP BY
  async estadisticas() {
    const rows = await this.repo
      .createQueryBuilder('e')
      .select('e.resultado', 'resultado')
      .addSelect('COUNT(*)', 'count')
      .groupBy('e.resultado')
      .getRawMany();

    const map: Record<string, number> = {};
    let total = 0;
    for (const row of rows) {
      map[row.resultado] = Number(row.count);
      total += Number(row.count);
    }

    return {
      total,
      validos: map['VALIDO'] ?? 0,
      bloqueados: map['BLOQUEADO'] ?? 0,
      vencidos: map['VENCIDO'] ?? 0,
    };
  }
}

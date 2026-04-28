import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EscaneosService } from './escaneos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Escaneos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('escaneos')
export class EscaneosController {
  constructor(private readonly service: EscaneosService) {}

  @Get('estadisticas')
  @ApiOperation({ summary: 'Estadísticas globales de escaneos (total, válidos, bloqueados, vencidos)' })
  estadisticas() {
    return this.service.estadisticas();
  }

  @Get('recientes')
  @ApiOperation({ summary: 'Últimos N escaneos del sistema' })
  @ApiQuery({ name: 'limite', required: false, example: 50 })
  recientes(@Query('limite') limite?: number) {
    return this.service.findRecientes(limite);
  }

  @Get('qr/:qrCodigoId')
  @ApiOperation({ summary: 'Historial de escaneos de un QR específico' })
  findByQr(@Param('qrCodigoId', ParseIntPipe) qrCodigoId: number) {
    return this.service.findByQr(qrCodigoId);
  }
}

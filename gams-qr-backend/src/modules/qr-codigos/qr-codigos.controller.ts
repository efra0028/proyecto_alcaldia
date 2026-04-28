import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { QrCodigosService } from './qr-codigos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('QR Códigos')
@Controller('qr-codigos')
export class QrCodigosController {
  constructor(private readonly qrService: QrCodigosService) {}

  // ── ENDPOINT PÚBLICO: Escaneo de QR ────────────────────────
  @Get('scan/:codigoUnico')
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // Máx 30 req/min por IP
  @ApiOperation({
    summary: '🔓 PÚBLICO — Escanear un QR y obtener datos del registro',
  })
  @ApiHeader({ name: 'user-agent', required: false })
  scan(
    @Param('codigoUnico', new ParseUUIDPipe({ version: '4' })) codigoUnico: string,
    @Req() req: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return this.qrService.scan(codigoUnico, ip, userAgent);
  }

  // ── ENDPOINTS PROTEGIDOS ────────────────────────────────────

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener datos de un QR por ID (incluye total de escaneos)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.qrService.findOne(id);
  }

  @Get('registro/:registroId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener QR de un registro por su UUID' })
  findByRegistro(@Param('registroId') registroId: string) {
    return this.qrService.findByRegistroId(registroId);
  }

  @Post('generar/:registroId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generar QR para un registro (solo 1 por registro)' })
  generar(
    @Param('registroId') registroId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.qrService.generar(registroId, user.id);
  }

  @Post(':id/regenerar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerar QR (invalida el anterior y genera código nuevo)' })
  regenerar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.qrService.regenerar(id, user.id);
  }
}

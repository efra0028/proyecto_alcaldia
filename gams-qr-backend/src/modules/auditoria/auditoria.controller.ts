import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Auditoría')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly service: AuditoriaService) {}

  @Get()
  @ApiOperation({ summary: 'Ver log de auditoría (filtrable por tabla)' })
  @ApiQuery({ name: 'tabla', required: false, example: 'usuarios' })
  @ApiQuery({ name: 'limite', required: false, example: 100 })
  findAll(
    @Query('tabla') tabla?: string,
    @Query('limite') limite?: number,
  ) {
    return this.service.findAll(tabla, limite);
  }

  @Get(':tabla/:registroId')
  @ApiOperation({ summary: 'Ver historial completo de un registro específico' })
  findByRegistro(
    @Param('tabla') tabla: string,
    @Param('registroId') registroId: string,
  ) {
    return this.service.findByRegistro(tabla, registroId);
  }
}

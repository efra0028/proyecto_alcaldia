import { Controller, Get, Post, Put, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EstadosRegistroService } from './estados-registro.service';
import { CreateEstadoRegistroDto } from './dto/create-estado-registro.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Estados de Registro')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('estados-registro')
export class EstadosRegistroController {
  constructor(private readonly service: EstadosRegistroService) {}

  @Get()
  @ApiOperation({ summary: 'Listar estados de registro (ACTIVO, SUSPENDIDO, etc.)' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener estado por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear nuevo estado de registro' })
  create(@Body() dto: CreateEstadoRegistroDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.id);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar estado de registro' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateEstadoRegistroDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Patch(':id/toggle')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Activar o desactivar estado' })
  toggle(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.service.toggleActivo(id, user.id);
  }
}

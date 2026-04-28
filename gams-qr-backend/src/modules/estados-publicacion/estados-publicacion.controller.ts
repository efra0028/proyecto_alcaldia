import { Controller, Get, Post, Put, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EstadosPublicacionService } from './estados-publicacion.service';
import { CreateEstadoPublicacionDto } from './dto/create-estado-publicacion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Estados de Publicación')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('estados-publicacion')
export class EstadosPublicacionController {
  constructor(private readonly service: EstadosPublicacionService) {}

  @Get()
  @ApiOperation({ summary: 'Listar estados de publicación (ACTIVA, BORRADOR, etc.)' })
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
  @ApiOperation({ summary: 'Crear nuevo estado de publicación' })
  create(@Body() dto: CreateEstadoPublicacionDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.id);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar estado de publicación' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateEstadoPublicacionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Patch(':id/toggle')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Activar o desactivar estado de publicación' })
  toggle(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.service.toggleActivo(id, user.id);
  }
}

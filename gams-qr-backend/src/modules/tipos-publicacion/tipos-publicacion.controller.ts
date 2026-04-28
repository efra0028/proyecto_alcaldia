import { Controller, Get, Post, Put, Patch, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TiposPublicacionService } from './tipos-publicacion.service';
import { CreateTipoPublicacionDto } from './dto/create-tipo-publicacion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Tipos de Publicación')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tipos-publicacion')
export class TiposPublicacionController {
  constructor(private readonly service: TiposPublicacionService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tipos de publicación (filtrable por sistema_id)' })
  @ApiQuery({ name: 'sistema_id', required: false })
  findAll(@Query('sistema_id') sistema_id?: string) {
    return this.service.findAll(sistema_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tipo de publicación por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Crear nuevo tipo de publicación para un sistema' })
  create(@Body() dto: CreateTipoPublicacionDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.id);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Actualizar tipo de publicación' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateTipoPublicacionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Patch(':id/toggle')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Activar o desactivar tipo de publicación' })
  toggle(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.service.toggleActivo(id, user.id);
  }
}

import { Controller, Get, Post, Put, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los roles del sistema' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo rol' })
  create(@Body() dto: CreateRolDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar rol' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateRolDto, @CurrentUser() user: JwtPayload) {
    return this.service.update(id, dto, user.id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Activar o desactivar rol' })
  toggle(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.service.toggleActivo(id, user.id);
  }
}

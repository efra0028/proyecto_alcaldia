import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Publicaciones')
@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly service: PublicacionesService) {}

  // ── ENDPOINTS PÚBLICOS ────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: '🔓 PÚBLICO — Listar publicaciones activas' })
  findActivas() {
    return this.service.findActivas();
  }

  // ✅ DEBE IR ANTES de @Get(':id') para que NestJS no lo intercepte como parámetro
  @Get('admin/todas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar TODAS las publicaciones (admin)' })
  findAll() {
    return this.service.findAll();
  }

  @Get('uuid/:uuid')
  @ApiOperation({ summary: '🔓 PÚBLICO — Ver una publicación por UUID' })
  findByUuid(@Param('uuid') uuid: string) {
    return this.service.findOne(uuid);
  }

  @Get(':id')
  @ApiOperation({ summary: '🔓 PÚBLICO — Ver una publicación' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // ── ENDPOINTS PROTEGIDOS (panel admin) ────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva publicación' })
  create(@Body() dto: CreatePublicacionDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar publicación' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePublicacionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Patch(':id/publicar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publicar publicación' })
  publish(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.service.publish(id, user.id);
  }

  @Patch(':id/despublicar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Despublicar publicación' })
  unpublish(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.service.unpublish(id, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar publicación' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SistemasService } from './sistemas.service';
import { CreateSistemaDto } from './dto/create-sistema.dto';
import { UpdateSistemaDto } from './dto/update-sistema.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Sistemas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('sistemas')
export class SistemasController {
  constructor(private readonly sistemasService: SistemasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los sistemas municipales' })
  findAll() {
    return this.sistemasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un sistema por ID' })
  findOne(@Param('id') id: string) {
    return this.sistemasService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo sistema municipal (genera api_key automáticamente)' })
  create(@Body() dto: CreateSistemaDto, @CurrentUser() user: JwtPayload) {
    return this.sistemasService.create(dto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos del sistema' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSistemaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.sistemasService.update(id, dto, user.id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Activar o desactivar sistema' })
  toggle(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.sistemasService.toggleActivo(id, user.id);
  }

  @Patch(':id/regenerar-key')
  @ApiOperation({ summary: 'Regenerar api_key del sistema (invalida la anterior)' })
  regenerarKey(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.sistemasService.regenerarApiKey(id, user.id);
  }
}

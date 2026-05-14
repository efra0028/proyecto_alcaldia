import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RegistrosService } from './registros.service';
import { CreateRegistroDto } from './dto/create-registro.dto';
import { UpdateRegistroDto } from './dto/update-registro.dto';
import { SuspenderRegistroDto } from './dto/suspender-registro.dto';
import { PaginacionDto } from '../../common/dto/paginacion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Registros')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('registros')
export class RegistrosController {
  constructor(private readonly registrosService: RegistrosService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar registros paginados (filtrable por sistema_id)',
  })
  @ApiQuery({ name: 'sistema_id', required: false })
  findAll(
    @Query('sistema_id') sistema_id?: string,
    @Query() paginacion?: PaginacionDto,
  ) {
    return this.registrosService.findAll(
      sistema_id,
      paginacion?.pagina,
      paginacion?.limite,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro por UUID' })
  findOne(@Param('id') id: string) {
    return this.registrosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo registro' })
  create(@Body() dto: CreateRegistroDto, @CurrentUser() user: JwtPayload) {
    return this.registrosService.create(dto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos del registro' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRegistroDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.registrosService.update(id, dto, user.id);
  }

  @Patch(':id/suspender')
  @ApiOperation({ summary: 'Suspender registro (requiere motivo obligatorio)' })
  suspender(
    @Param('id') id: string,
    @Body() dto: SuspenderRegistroDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.registrosService.suspender(id, dto, user.id);
  }

  @Patch(':id/activar')
  @ApiOperation({ summary: 'Reactivar un registro suspendido' })
  activar(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.registrosService.activar(id, user.id);
  }
}

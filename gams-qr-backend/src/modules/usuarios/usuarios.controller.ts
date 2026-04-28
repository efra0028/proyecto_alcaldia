import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  create(
    @Body() dto: CreateUsuarioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usuariosService.create(dto, user.id);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar usuario' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usuariosService.update(id, dto, user.id);
  }

  @Patch(':id/toggle')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Activar o desactivar usuario' })
  toggle(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usuariosService.toggleActivo(id, user.id);
  }
}

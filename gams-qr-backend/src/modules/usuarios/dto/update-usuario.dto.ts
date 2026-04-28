import { PartialType } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  // Todos los campos de CreateUsuarioDto son opcionales en el update
  // PartialType los marca como opcionales automáticamente
}

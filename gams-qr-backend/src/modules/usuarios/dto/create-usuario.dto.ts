import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsArray,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MaxLength(150)
  nombre: string;

  @ApiPropertyOptional({ example: '12345678' })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  carnet?: string;

  @ApiProperty({ example: 'juan@gams.gob.bo' })
  @IsEmail({}, { message: 'Email no válido' })
  @MaxLength(150)
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' })
  password: string;

  @ApiPropertyOptional({ example: [1, 2], description: 'IDs de roles a asignar' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  rol_ids?: number[];
}

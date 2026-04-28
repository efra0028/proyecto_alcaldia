import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRolDto {
  @ApiProperty({ example: 'SUPERVISOR' })
  @IsString()
  @MaxLength(50)
  nombre: string;

  @ApiPropertyOptional({ example: 'Supervisa operaciones del sistema' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}

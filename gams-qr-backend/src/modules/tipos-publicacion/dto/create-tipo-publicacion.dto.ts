import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTipoPublicacionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  sistema_id: string;

  @ApiProperty({ example: 'Resolución Municipal' })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiPropertyOptional({ example: 'Resoluciones emitidas por el municipio' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}

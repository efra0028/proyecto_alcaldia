import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePublicacionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  tipo_id!: number;

  @ApiProperty({ example: 'Resolución Municipal N° 123' })
  @IsString()
  @MaxLength(255)
  titulo!: string;

  @ApiProperty({
    example: { resumen: 'Texto breve', cuerpo: 'Texto completo' },
  })
  @IsObject()
  contenido!: Record<string, unknown>;

  @ApiPropertyOptional({ example: { portada: 'https://...', archivos: [] } })
  @IsOptional()
  @IsObject()
  adjuntos_urls?: Record<string, unknown>;

  @ApiPropertyOptional({ example: '2026-05-12' })
  @IsOptional()
  @IsDateString()
  fecha_publicacion?: string;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsOptional()
  @IsDateString()
  fecha_vencimiento?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  estado_id!: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  destacada?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  orden_carrusel?: number;
}

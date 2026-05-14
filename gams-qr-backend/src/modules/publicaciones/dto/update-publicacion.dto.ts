import {
  IsString,
  IsOptional,
  IsInt,
  IsObject,
  IsDateString,
  IsBoolean,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePublicacionDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  tipo_id?: number;

  @ApiPropertyOptional({ example: 'Resolución Municipal N° 002/2025' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titulo?: string;

  @ApiPropertyOptional({
    example: { texto: 'Texto actualizado', autor: 'Alcaldía' },
  })
  @IsOptional()
  @IsObject()
  contenido?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Array de URLs de archivos adjuntos' })
  @IsOptional()
  @IsObject()
  adjuntos_urls?: Record<string, unknown>;

  @ApiPropertyOptional({ example: '2025-02-01' })
  @IsOptional()
  @IsDateString()
  fecha_publicacion?: string;

  @ApiPropertyOptional({ example: '2026-02-01' })
  @IsOptional()
  @IsDateString()
  fecha_vencimiento?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  estado_id?: number;

  // ── Carrusel ────────────────────────────────────────────────────────────
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

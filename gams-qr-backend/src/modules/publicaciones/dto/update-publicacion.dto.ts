import {
  IsString,
  IsOptional,
  IsInt,
  IsObject,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar una publicación.
 * Todos los campos son opcionales — solo se actualizan los enviados.
 */
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
    description: 'Contenido en JSON — reemplaza el contenido anterior completo',
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
}

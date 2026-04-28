import {
  IsString,
  IsOptional,
  IsInt,
  IsObject,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePublicacionDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de publicación' })
  @IsInt()
  tipo_id: number;

  @ApiProperty({ example: 'Resolución Municipal N° 001/2025' })
  @IsString()
  @MaxLength(255)
  titulo: string;

  @ApiProperty({
    example: { texto: 'Se resuelve...', autor: 'Alcaldía Municipal' },
    description: 'Contenido libre en formato JSON definido por cada sistema',
  })
  @IsObject()
  contenido: object;

  @ApiPropertyOptional({
    example: ['https://cdn.gams.gob.bo/docs/resolucion.pdf'],
    description: 'Array de URLs de archivos adjuntos',
  })
  @IsOptional()
  adjuntos_urls?: object;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  fecha_publicacion?: string;

  @ApiPropertyOptional({ example: '2026-01-15', description: 'Dejar vacío si no tiene fecha de vencimiento' })
  @IsOptional()
  @IsDateString()
  fecha_vencimiento?: string;

  @ApiProperty({ example: 1, description: 'ID del estado de publicación (1=ACTIVA)' })
  @IsInt()
  estado_id: number;
}

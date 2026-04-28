import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSistemaDto {
  @ApiProperty({ example: 'Taxi Seguro' })
  @IsString()
  @MaxLength(150)
  nombre: string;

  @ApiPropertyOptional({ example: 'Sistema de registro de taxis del municipio' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ example: '#3B82F6', description: 'Color en formato HEX' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color_hex debe ser un color HEX válido (#RRGGBB)' })
  color_hex?: string;

  @ApiPropertyOptional({ example: 'https://cdn.gams.gob.bo/logos/taxi.png' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  logo_url?: string;

  @ApiPropertyOptional({
    example: { campos: ['nombre', 'placa', 'licencia'] },
    description: 'Esquema JSON que define los campos del registro para este sistema',
  })
  @IsOptional()
  @IsObject()
  schema_campos?: object;
}

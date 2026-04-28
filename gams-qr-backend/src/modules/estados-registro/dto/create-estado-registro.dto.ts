import { IsString, IsOptional, IsBoolean, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEstadoRegistroDto {
  @ApiProperty({ example: 'ACTIVO' })
  @IsString()
  @MaxLength(50)
  nombre: string;

  @ApiPropertyOptional({ example: 'Registro activo y válido' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ example: '#22C55E' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color_hex debe ser un color HEX válido (#RRGGBB)' })
  color_hex?: string;

  @ApiPropertyOptional({ example: false, description: 'Si TRUE, el QR de ese registro es inválido al escanear' })
  @IsOptional()
  @IsBoolean()
  bloquea_qr?: boolean;
}

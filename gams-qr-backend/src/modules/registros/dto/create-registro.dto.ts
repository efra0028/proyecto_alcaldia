import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  IsObject,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRegistroDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del sistema municipal',
  })
  @IsUUID()
  sistema_id!: string;

  @ApiProperty({
    example: '2345-ABC',
    description:
      'Identificador único del registro en el sistema externo (placa, cédula, código, etc.)',
  })
  @IsString()
  @MaxLength(100)
  referencia_externa!: string;

  @ApiProperty({
    example: { nombre: 'Juan Pérez', placa: '2345-ABC', licencia: 'B' },
    description:
      'Datos a mostrar cuando se escanea el QR (estructura libre por sistema)',
  })
  @IsObject()
  datos_display!: Record<string, unknown>;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  fecha_inicio!: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Dejar vacío si no tiene fecha de vencimiento',
  })
  @IsOptional()
  @IsDateString()
  fecha_vencimiento?: string;

  @ApiProperty({
    example: 1,
    description: 'ID del estado de registro (1=ACTIVO)',
  })
  @IsInt()
  estado_id!: number;
}

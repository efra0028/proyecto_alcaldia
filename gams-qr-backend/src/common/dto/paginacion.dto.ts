import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PaginacionDto {
  @ApiPropertyOptional({ example: 1, description: 'Página (inicia en 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Registros por página (máx 100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number = 20;
}

export interface PaginadoResponse<T> {
  data: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export function paginar<T>(
  data: T[],
  total: number,
  pagina: number,
  limite: number,
): PaginadoResponse<T> {
  return {
    data,
    total,
    pagina,
    limite,
    totalPaginas: Math.ceil(total / limite),
  };
}

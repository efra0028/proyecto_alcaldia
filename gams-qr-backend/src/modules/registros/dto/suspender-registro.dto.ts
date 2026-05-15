import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuspenderRegistroDto {
  @ApiProperty({ example: 'Documentación vencida, pendiente de renovación' })
  @IsString()
  @IsNotEmpty({ message: 'El motivo de suspensión es obligatorio' })
  @MaxLength(500)
  motivo!: string;
}

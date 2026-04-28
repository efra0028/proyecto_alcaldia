import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Admin2024' })
  @IsString()
  current_password: string;

  @ApiProperty({ example: 'NuevaClave2024' })
  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener mínimo 8 caracteres' })
  new_password: string;
}

import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@gams.gob.bo' })
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @ApiProperty({ example: 'Admin2024' })
  @IsString()
  password: string;
}

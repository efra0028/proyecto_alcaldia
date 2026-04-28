import { PartialType } from '@nestjs/swagger';
import { CreateSistemaDto } from './create-sistema.dto';

export class UpdateSistemaDto extends PartialType(CreateSistemaDto) {}

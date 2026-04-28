import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRegistroDto } from './create-registro.dto';

// Al actualizar, sistema_id no se puede cambiar (el registro pertenece a ese sistema)
export class UpdateRegistroDto extends PartialType(
  OmitType(CreateRegistroDto, ['sistema_id'] as const),
) {}

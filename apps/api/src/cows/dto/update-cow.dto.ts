import { PartialType } from '@nestjs/swagger';
import { CreateCowDto } from './create-cow.dto';

// codigoVaca NO es editable (no se incluye en CreateCowDto, por tanto tampoco aquí).
export class UpdateCowDto extends PartialType(CreateCowDto) {}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ReproductiveStatus } from '@prisma/client';

export class UpdateReproductionDto {
  @ApiProperty({ description: 'ID de la vaca' })
  @IsString()
  @IsNotEmpty()
  cowId!: string;

  @ApiProperty({ enum: ReproductiveStatus, description: 'Nuevo estado reproductivo' })
  @IsEnum(ReproductiveStatus)
  estado!: ReproductiveStatus;
}

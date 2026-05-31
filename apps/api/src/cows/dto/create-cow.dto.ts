import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CowType, FeedingStatus, ReproductiveStatus } from '@prisma/client';

export class CreateCowDto {
  @ApiProperty({ example: 'Lola M', description: 'Nombre de la vaca' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(60)
  nombre!: string;

  @ApiProperty({ enum: CowType, example: CowType.DAIRY, description: 'Tipo de vaca' })
  @IsEnum(CowType)
  tipoVaca!: CowType;

  @ApiPropertyOptional({ enum: ReproductiveStatus, default: ReproductiveStatus.NOT_IN_HEAT })
  @IsOptional()
  @IsEnum(ReproductiveStatus)
  estadoReproductivo?: ReproductiveStatus;

  @ApiPropertyOptional({ enum: FeedingStatus, default: FeedingStatus.NOT_FED })
  @IsOptional()
  @IsEnum(FeedingStatus)
  estadoAlimentacion?: FeedingStatus;

  @ApiPropertyOptional({
    example: 38.6,
    minimum: 30,
    maximum: 45,
    description: 'Temperatura corporal en °C. Si se omite, se usa un valor saludable por defecto.',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(30)
  @Max(45)
  temperatura?: number;
}

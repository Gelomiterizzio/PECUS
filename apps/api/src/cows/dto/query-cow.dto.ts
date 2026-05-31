import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { CowType, FeedingStatus, ReproductiveStatus } from '@prisma/client';
import { HealthStatus } from '@pecus/types';
import { PaginationDto } from '../../common/dto/pagination.dto';

const SORTABLE = [
  'codigoVaca',
  'nombre',
  'fechaRegistro',
  'fechaActualizacion',
  'ultimaAlimentacion',
  'temperatura',
] as const;

export class QueryCowDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Búsqueda por nombre o código de vaca' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CowType })
  @IsOptional()
  @IsEnum(CowType)
  tipoVaca?: CowType;

  @ApiPropertyOptional({ enum: FeedingStatus })
  @IsOptional()
  @IsEnum(FeedingStatus)
  estadoAlimentacion?: FeedingStatus;

  @ApiPropertyOptional({ enum: ReproductiveStatus })
  @IsOptional()
  @IsEnum(ReproductiveStatus)
  estadoReproductivo?: ReproductiveStatus;

  @ApiPropertyOptional({ enum: HealthStatus, description: 'Filtrar por estado de salud (derivado de la temperatura)' })
  @IsOptional()
  @IsEnum(HealthStatus)
  healthStatus?: HealthStatus;

  @ApiPropertyOptional({ enum: SORTABLE, default: 'codigoVaca' })
  @IsOptional()
  @IsIn(SORTABLE as unknown as string[])
  sortBy: (typeof SORTABLE)[number] = 'codigoVaca';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'asc';
}

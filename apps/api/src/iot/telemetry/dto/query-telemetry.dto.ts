import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SensorType } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryTelemetryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por vaca' })
  @IsOptional()
  @IsString()
  cowId?: string;

  @ApiPropertyOptional({ enum: SensorType })
  @IsOptional()
  @IsEnum(SensorType)
  sensorType?: SensorType;
}

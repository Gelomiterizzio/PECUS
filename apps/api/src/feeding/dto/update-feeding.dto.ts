import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FeedingStatus } from '@prisma/client';

export class UpdateFeedingDto {
  @ApiProperty({ description: 'ID de la vaca a alimentar' })
  @IsString()
  @IsNotEmpty()
  cowId!: string;

  @ApiPropertyOptional({
    enum: FeedingStatus,
    default: FeedingStatus.FED,
    description: 'Nuevo estado. Por defecto marca como alimentada (FED).',
  })
  @IsOptional()
  @IsEnum(FeedingStatus)
  estado?: FeedingStatus;
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CowsService } from './cows.service';
import { CreateCowDto } from './dto/create-cow.dto';
import { UpdateCowDto } from './dto/update-cow.dto';
import { QueryCowDto } from './dto/query-cow.dto';

@ApiTags('cows')
@Controller('cows')
export class CowsController {
  constructor(private readonly cowsService: CowsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva vaca (código autogenerado)' })
  @ApiResponse({ status: 201, description: 'Vaca creada' })
  create(@Body() dto: CreateCowDto) {
    return this.cowsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vacas con paginación, búsqueda, filtros y ordenamiento' })
  findAll(@Query() query: QueryCowDto) {
    return this.cowsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de una vaca (incluye sensores y telemetría)' })
  @ApiParam({ name: 'id', description: 'ID de la vaca (cuid)' })
  findOne(@Param('id') id: string) {
    return this.cowsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de una vaca (el código no es editable)' })
  update(@Param('id') id: string, @Body() dto: UpdateCowDto) {
    return this.cowsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una vaca' })
  remove(@Param('id') id: string) {
    return this.cowsService.remove(id);
  }
}

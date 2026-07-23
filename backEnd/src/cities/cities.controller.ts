import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CitiesService } from './cities.service';

@ApiTags('cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List / search official Israeli localities' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ description: 'Normalized city list' })
  async list(
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Number(limit) : 50;
    if (q?.trim()) {
      return this.citiesService.searchCities(q, Number.isFinite(parsedLimit) ? parsedLimit : 50);
    }
    // Full list for selectors (cached server-side).
    return this.citiesService.getCities();
  }
}

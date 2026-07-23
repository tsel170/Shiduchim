import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ImagesService } from './images.service';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Public()
  @Get('pigeons')
  @ApiOperation({ summary: 'Cached pigeon/dove placeholder images (Unsplash)' })
  @ApiQuery({ name: 'count', required: false })
  @ApiOkResponse({ description: 'Image URL list' })
  listPigeons(@Query('count') count?: string) {
    const parsed = count ? Number(count) : 20;
    return this.imagesService.getPigeonImages(Number.isFinite(parsed) ? parsed : 20);
  }

  @Public()
  @Get('pigeons/random')
  @ApiOperation({ summary: 'Random pigeon/dove placeholder from cache' })
  randomPigeon() {
    return this.imagesService.getRandomPigeonImage();
  }
}

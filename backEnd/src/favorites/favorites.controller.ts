import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateFavoriteDto,
  FavoriteResponseDto,
  UpdateFavoriteDto,
} from './dto/favorite.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Add profile to favorites' })
  @ApiCreatedResponse({ type: FavoriteResponseDto })
  create(@Body() createFavoriteDto: CreateFavoriteDto) {
    return this.favoritesService.create(createFavoriteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get favorites' })
  @ApiQuery({ name: 'ownerAccountId', required: false })
  @ApiOkResponse({ type: FavoriteResponseDto, isArray: true })
  findAll(@Query('ownerAccountId') ownerAccountId?: string) {
    return this.favoritesService.findAll(ownerAccountId);
  }

  @Get(':favoriteId')
  @ApiOperation({ summary: 'Get favorite by id' })
  @ApiParam({ name: 'favoriteId' })
  @ApiOkResponse({ type: FavoriteResponseDto })
  @ApiNotFoundResponse({ description: 'Favorite not found' })
  findOne(@Param('favoriteId') favoriteId: string) {
    return this.favoritesService.findOne(favoriteId);
  }

  @Patch(':favoriteId')
  @ApiOperation({ summary: 'Update favorite' })
  @ApiParam({ name: 'favoriteId' })
  @ApiOkResponse({ type: FavoriteResponseDto })
  @ApiNotFoundResponse({ description: 'Favorite not found' })
  update(
    @Param('favoriteId') favoriteId: string,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ) {
    return this.favoritesService.update(favoriteId, updateFavoriteDto);
  }

  @Delete(':favoriteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove favorite' })
  @ApiParam({ name: 'favoriteId' })
  @ApiNoContentResponse({ description: 'Favorite deleted' })
  @ApiNotFoundResponse({ description: 'Favorite not found' })
  remove(@Param('favoriteId') favoriteId: string) {
    return this.favoritesService.remove(favoriteId);
  }
}

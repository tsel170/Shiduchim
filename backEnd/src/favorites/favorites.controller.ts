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
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUserPayload } from '../auth/types/auth-user.payload';
import {
  CreateFavoriteDto,
  FavoriteResponseDto,
  UpdateFavoriteDto,
} from './dto/favorite.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Add profile to favorites' })
  @ApiCreatedResponse({ type: FavoriteResponseDto })
  create(
    @CurrentUser() user: AuthUserPayload,
    @Body() createFavoriteDto: CreateFavoriteDto,
  ) {
    return this.favoritesService.create(user.accountId, createFavoriteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get favorites for current user' })
  @ApiOkResponse({ type: FavoriteResponseDto, isArray: true })
  findAll(@CurrentUser() user: AuthUserPayload) {
    return this.favoritesService.findAll(user.accountId);
  }

  @Get(':favoriteId')
  @ApiOperation({ summary: 'Get favorite by id' })
  @ApiParam({ name: 'favoriteId' })
  @ApiOkResponse({ type: FavoriteResponseDto })
  findOne(
    @CurrentUser() user: AuthUserPayload,
    @Param('favoriteId') favoriteId: string,
  ) {
    return this.favoritesService.findOne(favoriteId, user.accountId);
  }

  @Put(':favoriteId')
  @ApiOperation({ summary: 'Update favorite' })
  @ApiParam({ name: 'favoriteId' })
  @ApiOkResponse({ type: FavoriteResponseDto })
  put(
    @CurrentUser() user: AuthUserPayload,
    @Param('favoriteId') favoriteId: string,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ) {
    return this.favoritesService.update(favoriteId, user.accountId, updateFavoriteDto);
  }

  @Patch(':favoriteId')
  @ApiOperation({ summary: 'Partially update favorite' })
  @ApiParam({ name: 'favoriteId' })
  @ApiOkResponse({ type: FavoriteResponseDto })
  patch(
    @CurrentUser() user: AuthUserPayload,
    @Param('favoriteId') favoriteId: string,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ) {
    return this.favoritesService.update(favoriteId, user.accountId, updateFavoriteDto);
  }

  @Delete(':favoriteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove favorite' })
  @ApiParam({ name: 'favoriteId' })
  @ApiNoContentResponse({ description: 'Favorite deleted' })
  remove(
    @CurrentUser() user: AuthUserPayload,
    @Param('favoriteId') favoriteId: string,
  ) {
    return this.favoritesService.remove(favoriteId, user.accountId);
  }
}

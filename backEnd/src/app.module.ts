import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import databaseConfig from './config/database.config';
import { FavoritesModule } from './favorites/favorites.module';
import { ManagementRequestsModule } from './management-requests/management-requests.module';
import { MatchRequestsModule } from './match-requests/match-requests.module';
import { ProfilesModule } from './profiles/profiles.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { DemoModule } from './demo/demo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('database.uri'),
      }),
    }),
    AuthModule,
    AccountsModule,
    ProfilesModule,
    FavoritesModule,
    SuggestionsModule,
    MatchRequestsModule,
    ManagementRequestsModule,
    DemoModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from './accounts/accounts.module';
import databaseConfig from './config/database.config';
import { FavoritesModule } from './favorites/favorites.module';
import { InterestsModule } from './interests/interests.module';
import { MatchRequestsModule } from './match-requests/match-requests.module';
import { ProfilesModule } from './profiles/profiles.module';

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
    AccountsModule,
    ProfilesModule,
    FavoritesModule,
    InterestsModule,
    MatchRequestsModule,
  ],
})
export class AppModule {}

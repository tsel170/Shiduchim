import { join } from 'path';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { FavoritesModule } from './favorites/favorites.module';
import { ManagementRequestsModule } from './management-requests/management-requests.module';
import { MatchRequestsModule } from './match-requests/match-requests.module';
import { ProfilesModule } from './profiles/profiles.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { MatchCasesModule } from './match-cases/match-cases.module';

function resolveMongoUri(configService: ConfigService): string {
  const uri = (
    configService.get<string>('MONGODB_URI') ??
    process.env.MONGODB_URI ??
    ''
  ).trim();

  if (!uri) {
    throw new Error(
      'MONGODB_URI is missing. Set it in backEnd/.env (e.g. mongodb://localhost:27017/shiduchim).',
    );
  }

  return uri;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // dist/app.module.js → ../.env = backEnd/.env
      envFilePath: [
        join(__dirname, '..', '.env'),
        join(process.cwd(), '.env'),
        join(process.cwd(), 'backEnd', '.env'),
      ],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: resolveMongoUri(configService),
      }),
    }),
    AuthModule,
    AccountsModule,
    ProfilesModule,
    FavoritesModule,
    SuggestionsModule,
    MatchRequestsModule,
    MatchCasesModule,
    ManagementRequestsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

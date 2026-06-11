import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { sqlServerDriver } from '../database/mssql-driver';
import { ProfileHobby } from '../profiles/entities/profile-hobby.entity';
import { ProfileInquiryPhone } from '../profiles/entities/profile-inquiry-phone.entity';
import { ProfileLookingForTrait } from '../profiles/entities/profile-looking-for.entity';
import { ProfilePersonality } from '../profiles/entities/profile-personality.entity';
import { Profile } from '../profiles/entities/profile.entity';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'mssql',
    driver: sqlServerDriver,
    host: 'localhost',
    database: process.env.DB_NAME ?? 'Shidohim',
    entities: [
      Profile,
      ProfilePersonality,
      ProfileHobby,
      ProfileLookingForTrait,
      ProfileInquiryPhone,
    ],
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
  }),
);

import { registerAs } from '@nestjs/config';

/** Kept for optional typed config; AppModule reads MONGODB_URI directly. */
export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI?.trim() ?? '',
}));

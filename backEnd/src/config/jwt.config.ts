import { ConfigService } from '@nestjs/config';

const DEV_JWT_SECRET = 'dev-shiduchim-secret';

/** Resolve JWT secret from env. Requires JWT_SECRET in production. */
export function resolveJwtSecret(configService: ConfigService): string {
  const secret = (
    configService.get<string>('JWT_SECRET') ??
    process.env.JWT_SECRET ??
    ''
  ).trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET is missing. Set it in the environment for production.',
    );
  }

  return DEV_JWT_SECRET;
}

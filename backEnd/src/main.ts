import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { validationExceptionFactory } from './common/utils/validation-error.util';

const BODY_SIZE_LIMIT = process.env.BODY_SIZE_LIMIT ?? '20mb';
const DEV_CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

function resolveCorsOrigins(): string | string[] {
  const raw = process.env.FRONTEND_URL ?? process.env.CORS_ORIGIN;
  if (!raw?.trim()) {
    return DEV_CORS_ORIGINS;
  }

  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    return DEV_CORS_ORIGINS;
  }

  return origins.length === 1 ? origins[0] : origins;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useBodyParser('json', { limit: BODY_SIZE_LIMIT });
  app.useBodyParser('urlencoded', { limit: BODY_SIZE_LIMIT, extended: true });

  app.enableCors({
    origin: resolveCorsOrigins(),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Shiduchim API')
    .setDescription('API for managing accounts, profiles, favorites, suggestions, and requests')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`Server listening on port ${port}`);
  console.log(`Swagger UI available at /api`);
}
bootstrap();

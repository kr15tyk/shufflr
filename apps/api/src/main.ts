import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3001;

  app.enableCors();
  app.setGlobalPrefix('api');

  await app.listen(port);
  console.log(`🚀 API is running on: http://localhost:${port}/api`);
}

void bootstrap();

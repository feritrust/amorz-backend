import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — در dev میتونی localhost رو بذاری، در prod از ENV استفاده کن
  const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3001';
  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });

  // cookie parser
  app.use(cookieParser());

  // global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // اگر می‌خوای سخت‌گیر نباشی، این رو false بذار
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();

// Vercel serverless function entrypoint for NestJS
// This file is required for Vercel to deploy NestJS as a serverless function

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    // API prefix
    app.setGlobalPrefix('api/v1');

    await app.init();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  const nestApp = await bootstrap();
  const handler = nestApp.getHttpAdapter().getInstance();
  return handler(req, res);
}

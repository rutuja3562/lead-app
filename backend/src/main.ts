import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import os from 'os';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS
  app.enableCors({
    origin: ['http://localhost:8081', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('Lead App API')
    .setDescription('Lead Onboarding & Management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);

  // Helpful when running the mobile app on a physical device over Wi-Fi.
  const nets = os.networkInterfaces();
  let lanIPv4: string | null = null;
  for (const iface of Object.values(nets)) {
    for (const addr of iface ?? []) {
      if (addr.family === 'IPv4' && !addr.internal) {
        lanIPv4 = addr.address;
        break;
      }
    }
    if (lanIPv4) break;
  }
  if (lanIPv4) logger.log(`📱 Phone URL: http://${lanIPv4}:${port}`);
  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(`📄 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();

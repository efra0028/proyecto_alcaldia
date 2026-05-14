import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Servir imágenes QR como archivos estáticos en /public
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public' });

  // ✅ Servir imágenes subidas por el admin
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/api/v1/uploads',
  });

  // Prefijo global de la API
  app.setGlobalPrefix('api/v1');

  // ✅ Helmet configurado para permitir imágenes cross-origin
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );

  // CORS — permitir comunicación con el frontend
  app.enableCors({
    origin:
      config.get('NODE_ENV') === 'development'
        ? [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
          ]
        : ['https://gams.gob.bo'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('GAMS QR-Manager API')
    .setDescription('API REST para el sistema de gestión de QR municipales')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en: http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger docs en:       http://localhost:${port}/api/docs`);
}
void bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded, Request, Response, NextFunction } from 'express';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { appConfig } from './config/config';
import { setupSwagger } from './config/swagger.config';
import logger from './common/utils/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = appConfig();
  const port = config.port;

  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.protocol}://${req.get('host') || 'localhost'}${req.originalUrl}`);
    next();
  });

  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ extended: true, limit: '20mb' }));

  app.use(cookieParser());

  app.enableCors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Initialize Swagger Documentation
  setupSwagger(app);

  await app.listen(port, () => {
    logger.info(`Server running in [${config.env}] mode on port: ${port}`);
    logger.info(`Swagger Documentation available at: http://localhost:${port}/api/docs`);
  });
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api');

  // Security
  app.use(helmet());
  app.enableCors();
  app.use(compression());

  // Global Exceptions Filter (For Debugging)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`SynapseMail Backend running on: http://localhost:${port}`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

function checkEnvironment(logger: any) {
  const requiredEnvs = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = requiredEnvs.filter(env => !process.env[env]);
  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Acupunturista Master API')
    .setDescription('The Acupunturista Master LMS API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Trust Proxy (Required for EasyPanel/Heroku/Reverse Proxies to handle HTTPS correctly)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1); // Trust first proxy

  // Security Headers
  app.use(helmet());

  // Environment Check
  checkEnvironment(console);

  // Input Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // CORS
  // CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

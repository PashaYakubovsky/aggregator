import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { config } from 'dotenv';

async function bootstrap() {
  const adapter = new FastifyAdapter({
    logger: true,
  });

  // cors
  const isProduction = process.env.NODE_ENV === 'production';
  let allowedOrigins = [];

  if (!isProduction) {
    allowedOrigins = ['http://localhost:5173'];
  } else {
    allowedOrigins = ['https://aggregator-viewer.vercel.app'];
  }
  adapter.enableCors({
    origin: (origin, callback) => {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // dotenv
  config();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  // fallback to heroku port
  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');
}
bootstrap();

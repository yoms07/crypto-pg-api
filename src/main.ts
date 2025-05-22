import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WinstonModule,
  utilities,
} from 'nest-winston';
import * as winston from 'winston';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    abortOnError: false,
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            utilities.format.nestLike('Lisk PG', {
              prettyPrint: true,
              colors: true,
            }),
          ),
        }),
      ],
      exitOnError: false,
    }),
  });

  app.setBaseViewsDir([join(__dirname, 'auth', 'templates')]);
  app.setViewEngine('hbs');

  app.enableCors();
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

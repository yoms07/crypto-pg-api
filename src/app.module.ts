import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BusinessProfileModule } from './business-profile/business-profile.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import appConfig from './config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';
import { AppLoggerMiddleware } from './common/middlewares/logging.middleware';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: appConfig,
    }),
    CacheModule.register(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.mongo_uri'),
        dbName: configService.get<string>('database.mongo_db_name'),
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('mailer.host'),
          port: configService.get<number>('mailer.port'),
          secure: false,
          auth: {
            user: configService.get<string>('mailer.user'),
            pass: configService.get<string>('mailer.pass'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        template: {
          dir: __dirname + '/mail/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    WinstonModule.forRoot({
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
    }),
    AuthModule,
    BusinessProfileModule,
    MailModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}

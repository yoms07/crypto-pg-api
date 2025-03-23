import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';
import urlConfig from 'src/config/url.config';

@Module({
  imports: [ConfigModule.forFeature(urlConfig)],
  providers: [MailService],
  exports: [MailService], // Export the MailService for use in other modules
})
export class MailModule {}

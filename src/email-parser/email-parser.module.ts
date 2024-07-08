import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EmailParserController } from './email-parser.controller';
import { EmailParserService } from './email-parser.service';
import { HttpModule } from '@nestjs/axios';
import { AttachmentProcessor } from './processors/attachment.processor';
import { HtmlContentProcessor } from './processors/html-content.processor';

@Module({
  imports: [HttpModule],
  providers: [EmailParserService],
})
export class EmailParserModule {}

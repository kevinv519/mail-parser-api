import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EmailParserController } from './email-parser.controller';
import { EmailParserService } from './email-parser.service';
import { AttachmentProcessor } from './processors/attachment.processor';
import { HtmlContentProcessor } from './processors/html-content.processor';

@Module({
  imports: [HttpModule],
  controllers: [EmailParserController],
  providers: [EmailParserService, AttachmentProcessor, HtmlContentProcessor],
})
export class EmailParserModule {}

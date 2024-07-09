import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { isURL } from 'class-validator';
import { readFile } from 'fs/promises';
import { ParsedMail, simpleParser } from 'mailparser';
import { join } from 'path';
import { lastValueFrom } from 'rxjs';
import { MailParserQueryDto } from './dtos/mail-parser-query.dto';
import { AttachmentProcessor } from './processors/attachment.processor';
import { HtmlContentProcessor } from './processors/html-content.processor';
import { JsonProcessor } from './processors/processor.interface';

@Injectable()
export class EmailParserService {
  constructor(
    private readonly httpService: HttpService,
    private readonly attachmentProcessor: AttachmentProcessor,
    private readonly htmlContentProcessor: HtmlContentProcessor,
  ) {}

  async parseJsonFromEmail(queryDto: MailParserQueryDto): Promise<Record<string, unknown>> {
    const mailContent = await this.getEmailContentFromSource(queryDto.source);

    const processor: JsonProcessor = mailContent.attachments.length
      ? this.attachmentProcessor
      : this.htmlContentProcessor;

    return processor.process(mailContent);
  }

  private async getEmailContentFromSource(source: string): Promise<ParsedMail> {
    if (isURL(source, { require_protocol: true, protocols: ['https', 'http'] })) {
      const response = await lastValueFrom(this.httpService.get(source));

      return simpleParser(response.data);
    } else {
      const path = join(process.cwd(), 'data', source);
      const file = await readFile(path, 'utf-8');
      return simpleParser(file);
    }
  }
}

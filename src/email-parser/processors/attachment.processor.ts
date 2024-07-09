import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ParsedMail } from 'mailparser';
import { JsonProcessor } from './processor.interface';

@Injectable()
export class AttachmentProcessor implements JsonProcessor {
  async process(parsedMail: ParsedMail): Promise<Record<string, unknown>> {
    for (const attachment of parsedMail.attachments) {
      if (attachment.contentType === 'application/json') {
        return JSON.parse(attachment.content.toString('utf-8'));
      }
    }
    throw new UnprocessableEntityException('Could not find JSON attachments in the email source.');
  }
}

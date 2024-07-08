import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { isURL } from 'class-validator';
import { readFile } from 'fs/promises';
import { ParsedMail, simpleParser } from 'mailparser';
import { join } from 'path';
import { lastValueFrom } from 'rxjs';
@Injectable()
export class EmailParserService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  async getEmailContentFromSource(source: string): Promise<ParsedMail> {
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

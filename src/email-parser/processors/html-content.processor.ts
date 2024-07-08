import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import { ParsedMail } from 'mailparser';
import { JsonProcessor } from './processor.interface';
import { lastValueFrom } from 'rxjs';
import { isURL } from 'class-validator';

@Injectable()
export class HtmlContentProcessor implements JsonProcessor {
  constructor(private readonly httpService: HttpService) {}

  async process(parsedMail: ParsedMail): Promise<Record<string, unknown>> {
    const links = this.getMailLinks(parsedMail.textAsHtml);

    for (const link of links) {
      const response = await lastValueFrom(this.httpService.get(link));
      const contentType: string = response.headers['content-type'];

      if (contentType.includes('application/json;')) {
        return response.data;
      }
    }

    throw new Error('Email did not have a reference to a JSON link');
  }

  getMailLinks(htmlText: string): string[] {
    const {
      window: { document: mailDocument },
    } = new JSDOM(htmlText);

    const links: string[] = [];

    for (const aElement of mailDocument.querySelectorAll('a')) {
      if (aElement.href && isURL(aElement.href, { require_protocol: true, protocols: ['https', 'http'] })) {
        links.push(aElement.href);
      }
    }

    return links;
  }
}

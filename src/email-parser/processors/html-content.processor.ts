import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import { ParsedMail } from 'mailparser';
import { JsonProcessor } from './processor.interface';
import { lastValueFrom } from 'rxjs';
import { isURL } from 'class-validator';

@Injectable()
export class HtmlContentProcessor implements JsonProcessor {
  private readonly logger = new Logger(HtmlContentProcessor.name);

  constructor(private readonly httpService: HttpService) {}

  async process(parsedMail: ParsedMail): Promise<Record<string, unknown>> {
    const links = this.getLinksFromHtmlText(parsedMail.textAsHtml);

    const emailLinkResponses = await Promise.allSettled(this.fetchResponsesFromLinks(links));

    const nestedLinks: string[] = [];

    for (const response of emailLinkResponses) {
      if (response.status === 'fulfilled') {
        if (response.value.contentType.includes('application/json;')) {
          return response.value.content;
        } else if (response.value.contentType.includes('text/html;')) {
          nestedLinks.push(...this.getLinksFromHtmlText(response.value.content, response.value.link));
        }
      }
    }

    this.logger.debug('Original email content did not contain a link to a JSON resource');

    const nestedLinksResponses = await Promise.allSettled(this.fetchResponsesFromLinks(nestedLinks));

    for (const response of nestedLinksResponses) {
      if (response.status === 'fulfilled' && response.value.contentType.includes('application/json;')) {
        return response.value.content;
      }
    }

    this.logger.debug('Nested content from original email links did not contain a link to a JSON response either.');

    throw new Error('Email did not have a reference to a JSON link');
  }

  /**
   * Parses HTML content from a string, identifies anchor tags within the elements and returns and array with valid URL values.
   * @param htmlText text to parse to an HTML DOM.
   * @param origin If provided, this value will be prepended to the anchor href value if the reference starts with "/".
   *
   * If not provided, href values that start with "/"" will be omitted from the resulting array
   * @returns array of all links found within the HTML content
   */
  private getLinksFromHtmlText(htmlText: string, origin?: string): string[] {
    const {
      window: { document: mailDocument },
    } = new JSDOM(htmlText);

    const links: string[] = [];

    for (const anchor of mailDocument.querySelectorAll('a')) {
      const link = prependOriginToLinkIfNeeded(anchor, origin);
      if (isURL(link, { require_protocol: true, protocols: ['https', 'http'] })) {
        links.push(link);
      }
    }

    return links;
  }

  private fetchResponsesFromLinks(links: string[]): Promise<{ contentType: string; content: any; link: string }>[] {
    return links.map(async (link) => {
      const response = await lastValueFrom(this.httpService.get(link));
      const contentType: string = response.headers['content-type'];

      return { contentType, content: response.data, link };
    });
  }
}

function prependOriginToLinkIfNeeded({ href }: HTMLAnchorElement, origin?: string) {
  return origin && href.startsWith('/') ? `${origin}${href}` : href;
}

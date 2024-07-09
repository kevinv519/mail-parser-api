import { HttpService } from '@nestjs/axios';
import { UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { readFile } from 'fs/promises';
import { simpleParser } from 'mailparser';
import { join } from 'path';
import { of } from 'rxjs';
import { HtmlContentProcessor } from './html-content.processor';
import { httpServiceMock } from '../../common/mocks/http.service.mock';

describe('HtmlContentProcessor', () => {
  let processor: HtmlContentProcessor;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [HtmlContentProcessor, { provide: HttpService, useFactory: httpServiceMock }],
    }).compile();

    processor = module.get(HtmlContentProcessor);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect.assertions(1);

    expect(processor).toBeDefined();
  });

  describe('processs', () => {
    it('should throw UnprocessableEntityException when content does not have nested JSON links', async () => {
      expect.assertions(3);

      const htmlData1 = `<a href="https://example.com">https://example.com</a>`;
      const htmlData2 = `<p>Hello, World!</p>`;
      const file = await readFile(join(process.cwd(), 'data', 'no-json-links.eml'));
      const mailContent = await simpleParser(file);
      httpService.get.mockReturnValueOnce(of({ data: htmlData1, headers: { 'content-type': 'text/html;' } } as any));
      httpService.get.mockReturnValueOnce(of({ data: htmlData2, headers: { 'content-type': 'text/html;' } } as any));

      try {
        await processor.process(mailContent);
      } catch (error) {
        expect(httpService.get).toHaveBeenCalledTimes(2);
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toEqual('Could not find a reference to a JSON link in the email source.');
      }
    });

    it('should return JSON from the email link', async () => {
      expect.assertions(2);

      const data = { test: 'value' };
      const file = await readFile(join(process.cwd(), 'data', 'email-with-json-link.eml'));
      const mailContent = await simpleParser(file);
      httpService.get.mockReturnValueOnce(of({ data, headers: { 'content-type': 'application/json;' } } as any));
      const result = await processor.process(mailContent);

      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(data);
    });

    it('should return JSON from the nested link', async () => {
      expect.assertions(2);

      const htmlData = `<a href="/users">/users</a><a href="https://example.com">https://example.com</a>`;
      const data = { test: 'value' };
      const file = await readFile(join(process.cwd(), 'data', 'email-with-json-link.eml'));
      const mailContent = await simpleParser(file);
      httpService.get.mockReturnValueOnce(of({ data: htmlData, headers: { 'content-type': 'text/html;' } } as any));
      httpService.get.mockReturnValueOnce(of({ data, headers: { 'content-type': 'application/json;' } } as any));
      const result = await processor.process(mailContent);

      expect(httpService.get).toHaveBeenCalledTimes(3);
      expect(result).toEqual(data);
    });
  });
});

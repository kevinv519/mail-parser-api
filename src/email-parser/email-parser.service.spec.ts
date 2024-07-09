import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { httpServiceMock } from '../common/mocks/http.service.mock';
import { EmailParserService } from './email-parser.service';
import { AttachmentProcessor } from './processors/attachment.processor';
import { HtmlContentProcessor } from './processors/html-content.processor';
import * as fsAsync from 'fs/promises';
import { readFile } from 'fs';
import { join } from 'path';
import { of } from 'rxjs';

const processorMock = () => ({
  process: jest.fn(),
});

describe('EmailParserService', () => {
  let service: EmailParserService;
  let attachmentProcessor: jest.Mocked<AttachmentProcessor>;
  let htmlContentProcessor: jest.Mocked<HtmlContentProcessor>;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailParserService,
        { provide: HttpService, useFactory: httpServiceMock },
        { provide: AttachmentProcessor, useFactory: processorMock },
        { provide: HtmlContentProcessor, useFactory: processorMock },
      ],
    }).compile();

    service = module.get(EmailParserService);
    attachmentProcessor = module.get(AttachmentProcessor);
    htmlContentProcessor = module.get(HtmlContentProcessor);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseJsonFromEmail', () => {
    it('should parse email content from local source', async () => {
      expect.assertions(2);

      const source = 'email-with-json-attachment.eml';
      const spyOnReadFile = jest.spyOn(fsAsync, 'readFile');
      const data = { hello: 'world' };
      attachmentProcessor.process.mockResolvedValueOnce(data);

      const result = await service.parseJsonFromEmail({ source });

      expect(spyOnReadFile).toHaveBeenCalledWith(expect.stringContaining(source), 'utf-8');
      expect(result).toEqual(data);
    });

    it('should parse email content from remote source when value is a valid URL', async () => {
      expect.assertions(2);

      const filename = 'email-with-json-link.eml';
      const source = `https://example.com/${filename}`;
      const fileContent = await fsAsync.readFile(join(process.cwd(), 'data', filename), 'utf-8');
      httpService.get.mockReturnValueOnce(of({ data: fileContent } as any));
      const data = { hello: 'world' };
      htmlContentProcessor.process.mockResolvedValueOnce(data);

      const result = await service.parseJsonFromEmail({ source });

      expect(httpService.get).toHaveBeenCalledWith(source);
      expect(result).toEqual(data);
    });
  });
});

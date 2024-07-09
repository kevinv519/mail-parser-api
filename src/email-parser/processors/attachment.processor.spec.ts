import { Test } from '@nestjs/testing';
import { AttachmentProcessor } from './attachment.processor';
import { UnprocessableEntityException } from '@nestjs/common';
import { simpleParser } from 'mailparser';
import { readFile } from 'fs/promises';
import { join } from 'path';

describe('AttachmentProcessor', () => {
  let processor: AttachmentProcessor;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AttachmentProcessor],
    }).compile();

    processor = module.get(AttachmentProcessor);
  });

  it('should be defined', () => {
    expect.assertions(1);

    expect(processor).toBeDefined();
  });

  describe('processs', () => {
    it('should throw UnprocessableEntityException when content does not have JSON attachments', async () => {
      expect.assertions(2);

      const file = await readFile(join(process.cwd(), 'data', 'pdf-attachment.eml'));
      const mailContent = await simpleParser(file);

      try {
        await processor.process(mailContent);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toEqual('Could not find JSON attachments in the email source.');
      }
    });

    it('should return JSON object when content has a JSON file attachment', async () => {
      expect.assertions(1);

      const file = await readFile(join(process.cwd(), 'data', 'email-with-json-attachment.eml'));
      const mailContent = await simpleParser(file);

      const result = await processor.process(mailContent);

      expect(result).toEqual(expect.objectContaining({}));
    });
  });
});

import { ParsedMail } from 'mailparser';

export interface JsonProcessor {
  process(parsedMail: ParsedMail): Promise<Record<string, unknown>>;
}

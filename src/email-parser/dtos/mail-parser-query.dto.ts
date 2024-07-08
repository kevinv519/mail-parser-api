import { IsNotEmpty, IsString } from 'class-validator';

export class MailParserQueryDto {
  @IsString()
  @IsNotEmpty()
  source: string;
}

import { Controller, Get, Query } from '@nestjs/common';
import { EmailParserService } from './email-parser.service';
import { MailParserQueryDto } from './dtos/mail-parser-query.dto';

@Controller('email-parser')
export class EmailParserController {
  constructor(private readonly emailParserService: EmailParserService) {}

  @Get()
  async parse(@Query() queryDto: MailParserQueryDto): Promise<Record<string, unknown>> {
    return this.emailParserService.parseJsonFromEmail(queryDto);
  }
}

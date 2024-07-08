import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getUptime(): string {
    return this.formatUptime(process.uptime());
  }

  formatUptime(uptime: number): string {
    const hours = Math.floor(uptime / (60 * 60))
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((uptime % (60 * 60)) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(uptime % 60)
      .toString()
      .padStart(2, '0');
    return `Server has been running for ${hours}:${minutes}:${seconds} (hh:mm:ss)`;
  }
}

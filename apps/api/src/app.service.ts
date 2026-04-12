import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      success: true,
      data: {
        name: 'shufflr-api',
        version: '0.0.1',
      },
    };
  }
}

import { Injectable } from '@nestjs/common';

import type { ApiResponse } from '@shufflr/types';

@Injectable()
export class AppService {
  getStatus(): ApiResponse<{ name: string; version: string }> {
    return {
      success: true,
      data: {
        name: 'shufflr-api',
        version: '0.0.1',
      },
    };
  }
}

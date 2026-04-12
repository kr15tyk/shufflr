import { Controller, Get } from '@nestjs/common';

import type { ApiResponse } from '@shufflr/types';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getStatus(): ApiResponse<{ name: string; version: string }> {
    return this.appService.getStatus();
  }
}

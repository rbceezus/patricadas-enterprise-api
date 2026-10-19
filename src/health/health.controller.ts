import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HealthService, HealthStatus } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  async get(@Res({ passthrough: true }) res: Response): Promise<HealthStatus> {
    const result = await this.health.check();
    res.status(result.db === 'up' ? 200 : 503);
    return result;
  }
}

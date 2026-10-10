import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { setSuccess } from '../common/utils/response.helper';
import { appConfig } from '../config/config';

@Controller('health')
export class HealthController {
  @Get()
  check(@Res() res: Response) {
    const config = appConfig();
    return setSuccess(res, {
      message: 'Server is healthy and running',
      status: 'ok',
      uptime: Number(process.uptime().toFixed(2)),
      timestamp: new Date().toISOString(),
      environment: config.env,
    });
  }
}

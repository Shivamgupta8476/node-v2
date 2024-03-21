// Inside app.module.ts

import { Module, NestModule, MiddlewareConsumer, NestMiddleware, Injectable, Logger } from '@nestjs/common';
import { CalcController } from './calc/calc.controller';
import { CalcService } from './calc/calc.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, url } = req;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      this.logger.log(`${method} ${url} ${statusCode} ${duration}ms`);
    });

    next();
  }
}

@Module({
  controllers: [CalcController],
  providers: [CalcService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}

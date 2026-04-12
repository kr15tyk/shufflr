import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare module 'express' {
  interface Request {
    orgId?: string;
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const orgSubdomain = req.headers['x-org-subdomain'] as string | undefined;
    if (orgSubdomain) {
      req.orgId = orgSubdomain;
    }
    next();
  }
}

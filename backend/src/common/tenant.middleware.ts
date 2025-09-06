import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request & { organization?: any }, res: Response, next: NextFunction) {
    try {
      const headerHost = (req.headers['x-tenant-host'] || req.headers.host || '').toString();
      let hostname = headerHost.split(':')[0].trim();

      if (!hostname && req.headers.origin) {
        try {
          hostname = new URL(req.headers.origin as string).hostname;
        } catch (e) {}
      }

      if (hostname) {
        const org = await this.prisma.organization.findFirst({
          where: { domain: hostname },
        });
        if (org) {
          req.organization = org;
        }
      }

      next();
    } catch (err) {
      console.error('Tenant middleware error', err);
      next();
    }
  }
}
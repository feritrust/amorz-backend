import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    // اول از cookie بررسی کن
    const adminTokenCookie = req.cookies?.admin_token;
    if (adminTokenCookie && adminTokenCookie === process.env.ADMIN_TOKEN) return true;

    // یا header X-Admin-Token
    const header = req.headers['x-admin-token'] as string | undefined;
    if (header && header === process.env.ADMIN_TOKEN) return true;

    throw new UnauthorizedException('Admin auth required');
  }
}

// src/admin/admin.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Get,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { LoginDto } from './dto/login.dto';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { password } = body;
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

    if (!ADMIN_TOKEN) {
      return { ok: false, message: 'Server not configured' };
    }

    const valid = this.adminService.validatePassword(password);
    if (!valid) {
      throw new UnauthorizedException('Invalid password');
    }

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('admin_token', ADMIN_TOKEN, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { ok: true };
  }

  @Post('logout')
@HttpCode(HttpStatus.OK)
logout(@Res({ passthrough: true }) res: Response) {
  const isProd = process.env.NODE_ENV === 'production';

  res.clearCookie('admin_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
  });

  return { ok: true };
}

  // ✅ چک کردن وضعیت لاگین ادمین
  @UseGuards(AdminGuard)
  @Get('check')
  check() {
    return { ok: true };
  }
}

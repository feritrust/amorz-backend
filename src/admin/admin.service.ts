// src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  // برای حالا فقط اعتبارسنجی ساده انجام میده
  validatePassword(password: string): boolean {
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
    return password === ADMIN_PASSWORD;
  }
}

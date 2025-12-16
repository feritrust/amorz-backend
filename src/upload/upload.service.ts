import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as ftp from 'basic-ftp';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  async uploadToFtp(buffer: Buffer, filename: string): Promise<string> {
    // timeout بالاتر برای جلوگیری از timeout بی‌خودی
    const client = new ftp.Client(20000);

    // اگر خواستی لاگ FTP ببینی: FTP_VERBOSE=true
    client.ftp.verbose = (process.env.FTP_VERBOSE || 'false') === 'true';

    // مسیرها
    const basePath = (process.env.FTP_BASE_PATH || '/uploads').replace(/\/+$/, '');
    const publicBase = (process.env.PUBLIC_BASE_URL || '').replace(/\/+$/, '');

    // HOST رو امن کنیم (اگر ftp:// گذاشته باشی خودش حذف می‌کنه)
    const hostRaw = process.env.FTP_HOST || '';
    const host = hostRaw.replace(/^ftp:\/\//i, '').trim();

    const port = Number(process.env.FTP_PORT || 21);

    // اگر هاست دانلود FTPS می‌خواد: FTP_SECURE=true
    const secure = (process.env.FTP_SECURE || 'false') === 'true';

    try {
      await client.access({
        host,
        port,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASS,
        secure,
        // برای بعضی هاست‌ها که cert درست ندارن (فقط وقتی secure=true)
        secureOptions: secure ? { rejectUnauthorized: false } : undefined,
      });

      // برو داخل مسیر و مطمئن شو هست
      await client.ensureDir(basePath);

      // آپلود فایل داخل همون مسیر (بهتر از دادن path کامل)
      const stream = Readable.from(buffer);
      await client.uploadFrom(stream, filename);

      if (!publicBase) {
        // اگه PUBLIC_BASE_URL ست نشده باشه، از بیخ خطا بده چون URL نمی‌سازه
        throw new Error('PUBLIC_BASE_URL is not set');
      }

      return `${publicBase}/${filename}`;
    } catch (err: any) {
      // لاگ برای دیباگ
      console.error('FTP_UPLOAD_ERROR:', err?.message || err, {
        host,
        port,
        secure,
        basePath,
      });

      throw new InternalServerErrorException('Upload failed');
    } finally {
      client.close();
    }
  }
}

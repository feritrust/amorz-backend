import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private uploadDir = '/var/www/amorz-uploads';
  private publicBaseUrl = 'https://amorz.ir/uploads';

  /* ================= Upload ================= */
  async saveToLocal(buffer: Buffer, filename: string): Promise<string> {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }

      const filePath = path.join(this.uploadDir, filename);
      await fs.promises.writeFile(filePath, buffer);

      return `${this.publicBaseUrl}/${filename}`;
    } catch (err) {
      console.error('LOCAL_UPLOAD_ERROR:', err);
      throw new InternalServerErrorException('Upload failed');
    }
  }

  /* ================= List ================= */
  listFiles() {
    if (!fs.existsSync(this.uploadDir)) return [];

    return fs.readdirSync(this.uploadDir).map((name) => {
      const filePath = path.join(this.uploadDir, name);
      const stat = fs.statSync(filePath);

      return {
        name,
        url: `${this.publicBaseUrl}/${name}`,
        size: stat.size,
        createdAt: stat.birthtime,
      };
    });
  }

  /* ================= Delete ================= */
  deleteFile(filename: string) {
    // امنیت: جلوگیری از ../
    if (filename.includes('..') || filename.includes('/')) {
      throw new ForbiddenException('Invalid filename');
    }

    const filePath = path.join(this.uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    fs.unlinkSync(filePath);
    return { success: true };
  }
}

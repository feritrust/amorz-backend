import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private uploadDir = '/var/www/amorz-uploads';
  private publicBaseUrl = 'https://amorz.ir/uploads';

  async saveToLocal(buffer: Buffer, filename: string): Promise<string> {
    try {
      // اگر پوشه نبود، بساز
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
}

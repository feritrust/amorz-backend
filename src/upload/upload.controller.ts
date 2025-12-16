import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

function safeExt(originalName: string) {
  const m = originalName.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
  return m?.[0] || null;
}

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadImage(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('file is required');

    const ext = safeExt(file.originalname);
    if (!ext) throw new BadRequestException('Only jpg/jpeg/png/webp allowed');

    const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    const url = await this.uploadService.uploadToFtp(file.buffer, filename);

    return { url };
  }
}

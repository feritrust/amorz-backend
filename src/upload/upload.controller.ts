import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { AdminGuard } from '../common/guards/admin.guard';


function safeExt(originalName: string) {
  const m = originalName.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
  return m?.[0] || null;
}

@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /* ========= Upload (public / admin) ========= */
  @Post('upload/image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadImage(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('file is required');

    const ext = safeExt(file.originalname);
    if (!ext) throw new BadRequestException('Only jpg/jpeg/png/webp allowed');

    const filename = `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}${ext}`;

    const url = await this.uploadService.saveToLocal(file.buffer, filename);
    return { url };
  }

  /* ========= Admin: list files ========= */
  @UseGuards(AdminGuard)
  @Get('admin/uploads')
  list() {
    return this.uploadService.listFiles();
  }

  /* ========= Admin: delete file ========= */
  @UseGuards(AdminGuard)
  @Delete('admin/uploads/:name')
  remove(@Param('name') name: string) {
    return this.uploadService.deleteFile(name);
  }
}

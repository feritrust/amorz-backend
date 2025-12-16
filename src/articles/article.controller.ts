// src/articles/article.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  getAll() {
    return this.articleService.findAll();
  }

  // ✅ SEO route
  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.articleService.findBySlugOrThrow(slug);
  }

  // ✅ numeric id route
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.findOneOrThrow(id);
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateArticleDto) {
    return this.articleService.create(dto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.delete(id);
  }
}

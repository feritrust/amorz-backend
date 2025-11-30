import { Controller, Get, Post, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ArticleService } from './article.service';
import { Article } from './article.entity';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  getAll(): Promise<Article[]> {
    return this.articleService.findAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<Article> {
    return this.articleService.findOneOrThrow(id);
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() data: Partial<Article>): Promise<Article> {
    return this.articleService.create(data);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.delete(id);
  }
}

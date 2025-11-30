// src/articles/article.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './article.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
  ) {}

  findAll(): Promise<Article[]> {
    return this.articleRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOneOrThrow(id: number): Promise<Article> {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  create(data: Partial<Article>): Promise<Article> {
    const article = this.articleRepo.create(data);
    return this.articleRepo.save(article);
  }

  async delete(id: number): Promise<{ deleted: boolean }> {
    const result = await this.articleRepo.delete(id);
    return { deleted: (result.affected ?? 0) > 0 };
  }
}

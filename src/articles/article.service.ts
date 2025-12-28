// src/articles/article.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';

function slugify(text: string) {
  return (text || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FF\w-]/g, '')
    .toLowerCase()
    .normalize('NFC');
}

// ✅ helper: متن ساده برای meta description
function toPlainText(htmlOrText: string) {
  return (htmlOrText || '')
    .replace(/<[^>]*>/g, ' ')      // strip html tags
    .replace(/\s+/g, ' ')
    .trim();
}

function clamp(str: string, max: number) {
  const s = (str || '').trim();
  return s.length > max ? s.slice(0, max).trim() : s;
}

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

  async findBySlugOrThrow(slug: string): Promise<Article> {
    const normalized = decodeURIComponent(slug).normalize('NFC');
    const article = await this.articleRepo.findOne({
      where: { slug: normalized },
    });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async create(dto: CreateArticleDto): Promise<Article> {
    const title = dto.title.trim();

    const base = slugify(title) || `article-${Date.now()}`;
    let slug = base;
    let i = 1;

    while (await this.articleRepo.exist({ where: { slug } })) {
      slug = `${base}-${i++}`.normalize('NFC');
    }

    // ✅ SEO fallbacks
    const metaTitle =
      dto.metaTitle?.trim()
        ? clamp(dto.metaTitle.trim(), 70)
        : clamp(title, 70);

    const fromExcerpt = dto.excerpt?.trim() ? dto.excerpt.trim() : '';
    const plain = toPlainText(fromExcerpt || dto.content);
    const metaDescription =
      dto.metaDescription?.trim()
        ? clamp(dto.metaDescription.trim(), 170)
        : clamp(plain, 170);

    const article = this.articleRepo.create({
      title,
      slug: slug.normalize('NFC'),
      content: dto.content,
      imageUrl: dto.imageUrl?.trim() || null,
      author: 'Admin',
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    });

    return this.articleRepo.save(article);
  }

  async delete(id: number): Promise<{ deleted: boolean }> {
    const result = await this.articleRepo.delete(id);
    return { deleted: (result.affected ?? 0) > 0 };
  }
}

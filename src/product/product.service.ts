import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, ILike, Like } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../category/category.entity';
import { CreateProductDto } from './dto/create-product.dto';

function slugify(text: string) {
  return (text || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FF\w-]/g, '')
    .toLowerCase()
    .normalize('NFC'); // ✅ مهم برای فارسی
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const title = (dto.title || '').trim();
    if (!title) throw new NotFoundException('Title is required');

    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    const slugRaw = slugify(title);
    const slugBase = slugRaw || `prod-${Date.now()}`;

    let slug = slugBase;
    let counter = 1;

    // ✅ سبک‌تر از findOne
    while (await this.repo.exist({ where: { slug } })) {
      slug = `${slugBase}-${counter++}`.normalize('NFC');
    }

    const product = this.repo.create({
      title,
      slug: slug.normalize('NFC'),
      description: dto.description?.trim() ? dto.description.trim() : null,
      price: dto.price,
      discountPrice:
        typeof dto.discountPrice === 'number' ? dto.discountPrice : null,
      imageUrl: dto.imageUrl?.trim() ? dto.imageUrl.trim() : null,
      category,
      categoryId: dto.categoryId,
    });

    return this.repo.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.repo.find({
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async search(q: string): Promise<Product[]> {
    const query = (q || '').trim();
    if (!query) return [];

    // ✅ Postgres: ILike | سایر DBها: Like
    try {
      return await this.repo.find({
        where: { title: ILike(`%${query}%`) },
        relations: ['category'],
        order: { createdAt: 'DESC' },
      });
    } catch {
      return this.repo.find({
        where: { title: Like(`%${query}%`) },
        relations: ['category'],
        order: { createdAt: 'DESC' },
      });
    }
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    return this.repo.find({
      where: { categoryId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneById(id: number): Promise<Product> {
    const product = await this.repo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findOneBySlug(slug: string): Promise<Product> {
    const normalized = decodeURIComponent(slug).normalize('NFC');

    const product = await this.repo.findOne({
      where: { slug: normalized },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOneById(id);
    await this.repo.remove(product);
  }

  async findDiscounted(limit = 8): Promise<Product[]> {
    return this.repo.find({
      where: { discountPrice: Not(IsNull()) },
      relations: ['category'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findRandom(limit = 8): Promise<Product[]> {
    // ✅ اگر Postgres باشه سریع‌تر
    try {
      return await this.repo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.category', 'category')
        .orderBy('RANDOM()')
        .take(limit)
        .getMany();
    } catch {
      // fallback برای DBهای دیگر
      const all = await this.repo.find({ relations: ['category'] });
      if (all.length <= limit) return all;

      const shuffled = [...all];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, limit);
    }
  }
}

import { Injectable , NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

function slugify(text: string) {
  return text
    .trim()
    .replace(/\s+/g, '-')                        // فاصله → -
    .replace(/[^\u0600-\u06FF\w-]/g, '')         // حروف فارسی و لاتین بمونن
    .toLowerCase();
}

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private repo: Repository<Category>,
  ) {}

  async create(dto: { name: string; sortOrder?: number; imageUrl?: string }) {
  let base = slugify(dto.name).normalize("NFC");   // ✅ اینجا
  if (!base) base = `cat-${Date.now()}`;

  let slug = base;
  let i = 1;

  while (await this.repo.exist({ where: { slug } })) {
    slug = `${base}-${i++}`.normalize("NFC");      // ✅ اینجا هم
  }

  const category = this.repo.create({
    name: dto.name,
    slug: slug.normalize("NFC"),                   // ✅ اینجا هم برای اطمینان
    sortOrder: dto.sortOrder ?? 0,
    imageUrl: dto.imageUrl ?? null,
  });

  return this.repo.save(category);
}
async remove(id: number) {
    const category = await this.findOne(id);
    if (!category) throw new NotFoundException('Category not found');
    return this.repo.remove(category); // حذف دسته‌بندی
  }
  async findAll() {
  return this.repo.find({
    order: { sortOrder: 'ASC' },
  });
}

async findOne(id: number): Promise<Category | null> {
  return this.repo.findOne({ where: { id } });
}

async findBySlug(slug: string): Promise<Category | null> {
  return this.repo.findOne({ where: { slug } });
}
async findRandom(limit = 6): Promise<Category[]> {
  const all = await this.repo.find();

  if (all.length <= limit) return all;

  const shuffled = [...all];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, limit);
}


}

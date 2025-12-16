import { BadRequestException,Injectable , NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

function cleanSlug(s: string) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')     // space -> -
    .replace(/-+/g, '-')      // --- -> -
    .replace(/^-|-$/g, '');   // trim -
}

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private repo: Repository<Category>,
  ) {}

  async create(dto: { name: string; slug: string; sortOrder?: number; imageUrl?: string }) {
    const base = cleanSlug(dto.slug);

    if (!base) throw new BadRequestException('slug is required');

    // ✅ اینجا هم دوباره enforce کن (به فرانت اعتماد نکن)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(base)) {
      throw new BadRequestException('slug format is invalid');
    }

    const exists = await this.repo.exist({ where: { slug: base } });
    if (exists) throw new BadRequestException('slug already exists');

    const category = this.repo.create({
      name: dto.name,
      slug: base,
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

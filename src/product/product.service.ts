import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository} from '@nestjs/typeorm';
import { Repository, Not, IsNull , ILike} from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../category/category.entity';
import { CreateProductDto } from './dto/create-product.dto';

function slugify(text: string) {
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FF\w-]/g, '')
    .toLowerCase();
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
  const category = await this.categoryRepo.findOne({
    where: { id: dto.categoryId },
  });

  if (!category) throw new NotFoundException('Category not found');

  const slugRaw = slugify(dto.title);
  const slugBase = slugRaw || `prod-${Date.now()}`;

  let slug = slugBase;
  let counter = 1;
  while (await this.repo.findOne({ where: { slug } })) {
    slug = `${slugBase}-${counter++}`;
  }

  const product = this.repo.create({
    title: dto.title,
    slug,
    description: dto.description || null,
    price: dto.price,
    discountPrice:
      typeof dto.discountPrice === 'number' ? dto.discountPrice : null,
    imageUrl: dto.imageUrl || null,
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
  return this.repo.find({
    where: { title: ILike(`%${q}%`) },
    relations: ['category'],
    order: { createdAt: 'DESC' },
  });
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
    const product = await this.repo.findOne({
      where: { slug },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  

   async remove(id: number): Promise<void> {
    const product = await this.findOneById(id); // اگر نباشه NotFoundException می‌ندازه
    await this.repo.remove(product);
  }
   async findDiscounted(limit = 8): Promise<Product[]> {
    return this.repo.find({
      where: {
        discountPrice: Not(IsNull()),
      },
      relations: ['category'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findRandom(limit = 8): Promise<Product[]> {
  // همه محصولات رو با دسته‌شون بگیر
  const all = await this.repo.find({
    relations: ['category'],
  });

  // اگر کمتر از limit بود، همونو برگردون
  if (all.length <= limit) return all;

  // Fisher–Yates shuffle
  const shuffled = [...all];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, limit);
}
  
}

// src/product/product.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Category } from '../category/category.entity';
// اگر CategoryModule هم ProductModule را import می‌کند و حلقه ایجاد می‌شود، می‌توان از forwardRef استفاده کرد:
// import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]),
    // در صورت نیاز به ماژول دسته‌ها و جلوگیری از circular dependency:
    // forwardRef(() => CategoryModule),
  ],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService], // مهم: اگر ماژول‌های دیگر بخوان از ProductService استفاده کنند
})
export class ProductModule {}

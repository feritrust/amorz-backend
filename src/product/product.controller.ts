// src/product/product.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() body: CreateProductDto) {
    return this.productService.create(body);
  }
   @Get('discounted')
  findDiscounted(@Query('limit') limit?: string) {
    const take = limit ? Number(limit) : 8;
    return this.productService.findDiscounted(take);
  }

  // GET /products/random?limit=8
  @Get('random')
  findRandom(@Query('limit') limit?: string) {
    const take = limit ? Number(limit) : 8;
    return this.productService.findRandom(take);
  }

  // GET /products?categoryId=1
  @Get()
findAll(
  @Query('categoryId') categoryId?: string,
  @Query('q') q?: string,
) {
  if (categoryId) {
    return this.productService.findByCategory(Number(categoryId));
  }
  if (q) {
    return this.productService.search(q);
  }
  return this.productService.findAll();
}

  

  @Get('slug/:slug')
async findBySlug(@Param('slug') slug: string) {
  const normalized = decodeURIComponent(slug).normalize('NFC');
  return this.productService.findOneBySlug(normalized);
}

@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.productService.findOneById(id);
}

  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productService.remove(id);
    return { message: 'Product deleted successfully' };
  }
}

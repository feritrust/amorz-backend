import { Controller, Get, Post, Body, Param, ParseIntPipe, NotFoundException, Delete, UseGuards,Query,  } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AdminGuard } from '../common/guards/admin.guard';
import { Category } from './category.entity';

@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }
   @Get('random')
  async findRandom(@Query('limit') limit?: string) {
    const take = limit ? Number(limit) : 6;
    return this.categoryService.findRandom(take);
  }

@Get('slug/:slug')
async findBySlug(@Param('slug') slug: string) {
  const s = String(slug || '').trim().toLowerCase();
  const cat = await this.categoryService.findBySlug(s);
  if (!cat) throw new NotFoundException('Category not found');
  return cat;
}


// GET by id (فقط عدد)
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  const cat = await this.categoryService.findOne(id);
  if (!cat) throw new NotFoundException('Category not found');
  return cat;
}

  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.categoryService.remove(id);
    return { message: 'Category deleted successfully' };
  }
}

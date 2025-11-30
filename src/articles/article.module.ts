import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { AdminGuard } from '../common/guards/admin.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  providers: [ArticleService,AdminGuard],
  controllers: [ArticleController],
})
export class ArticleModule {}

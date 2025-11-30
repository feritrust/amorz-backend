import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { ArticleModule } from './articles/article.module';
import { AdminModule } from './admin/admin.module';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ArticleModule,
    CategoryModule,
    ProductModule,
    AdminModule,
  ],
})
export class AppModule {}

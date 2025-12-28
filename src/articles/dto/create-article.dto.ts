// src/articles/dto/create-article.dto.ts
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(170)
  metaDescription?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

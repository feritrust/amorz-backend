import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  content!: string; // یا body / html / markdown (اسم فیلدت هر چی هست)

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

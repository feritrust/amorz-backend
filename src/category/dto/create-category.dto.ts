import { IsString, IsOptional, IsInt, Min, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  // ✅ اجباری و فقط a-z 0-9 و -
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase english letters/numbers with hyphens (e.g. "grave-services")',
  })
  slug: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

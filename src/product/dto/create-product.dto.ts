import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() title: string;

  @IsOptional() @IsString() description?: string;

  @IsInt() @Min(0) price: number;

  @IsOptional() @IsInt() @Min(0)
  discountPrice?: number;    // 👈 اضافه شد

  @IsOptional() @IsString() imageUrl?: string;

  @IsInt() categoryId: number;
}

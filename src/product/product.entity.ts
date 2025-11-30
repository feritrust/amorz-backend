// بالا چیزی مثل این داری:
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../category/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // قیمت اصلی به تومان
  @Column()
  price!: number;

  // 👇 قیمت تخفیف‌خورده (اختیاری)
  @Column({ type: 'int', nullable: true })
  discountPrice!: number | null;

  @Column({ type: 'text', nullable: true })
  imageUrl!: string | null;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
  })
  category!: Category;

  @Column()
  categoryId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

// src/articles/article.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Index({ unique: true })
  @Column()
  slug!: string;

  @Column('text')
  content!: string;

  @Column({ type: 'text', nullable: true })
  imageUrl!: string | null;

  // ✅ NEW: SEO fields
  @Column({ type: 'varchar', length: 70, nullable: true })
  metaTitle!: string | null;

  @Column({ type: 'varchar', length: 170, nullable: true })
  metaDescription!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: 'Admin' })
  author!: string;
}

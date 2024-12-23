import { Expose, Transform } from 'class-transformer';
import { format } from 'date-fns';

export class CreateArticleDTO {
  title!: string;
  content!: string;
  authorId!: number;
}

export class UpdateArticleDTO {
  title?: string;
  content?: string;
  authorId?: number; 
}

export class ArticleResponseDTO {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  authorId: number;

  @Expose()
  @Transform(() => {
    return new Date();
  })
  createdAt: string;

  @Expose()
  @Transform(() => {
    return new Date();
  })
  updatedAt: string;
}

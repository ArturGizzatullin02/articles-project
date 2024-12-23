import { Expose, Transform } from 'class-transformer';

export class CreateCommentDTO {
  content!: string;
  authorId!: number;
}

export class CommentResponseDTO {
  @Expose()
  id: number;

  @Expose()
  content: string;

  @Expose()
  authorId: number;

  @Expose()
  articleId: number;

  @Expose()
  @Transform(() => {
    return new Date();
  })
  createdAt: string;
}

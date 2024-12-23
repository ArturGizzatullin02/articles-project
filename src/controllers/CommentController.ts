import express from 'express';
import { Request, Response } from 'express';
import { CreateCommentDTO } from '../dtos/CommentDTO.js';
import CommentModel from '../models/CommentModel.js';
import { authenticateToken } from '../middlewares/auth.js';
import logger from '../utils/logger.js';
import { plainToInstance } from 'class-transformer';
import { CommentResponseDTO } from '../dtos/CommentDTO.js';

const router = express.Router();

router.post(
  '/:id',
  authenticateToken,
  async (req: Request<{ id: string }, {}, CreateCommentDTO>, res: Response): Promise<void> => {
    const { content, authorId } = req.body;

    if (!content || !authorId) {
      res.status(400).json({ error: 'Invalid request body' });
      logger.error(`Invalid request body`);
      return;
    }

    const articleId = parseInt(req.params.id, 10);

    if (isNaN(articleId)) {
      res.status(400).json({ error: 'Invalid article ID' });
      logger.error(`Invalid article ID`);
      return;
    }

    const comment = await CommentModel.createComment(articleId, authorId, content);
    logger.info(`Comment created: ${JSON.stringify(comment)}`);

    const response = plainToInstance(CommentResponseDTO, comment, {
      excludeExtraneousValues: true,
    });
    res.json(response);
  }
);


interface PaginationQuery {
  page?: string;
  limit?: string;
}

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const comments = await CommentModel.getComments(parseInt(req.params.id), { page: Number(page), limit: Number(limit) });
  logger.info(`Fetched comments for article ${req.params.id}`);

  const response = plainToInstance(CommentResponseDTO, comments, {
    excludeExtraneousValues: true,
  });
  res.json(response);
});

export default router;
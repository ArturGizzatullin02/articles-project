import express from 'express';
import ArticleModel from '../models/ArticleModel.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.js';
import { CreateArticleDTO, UpdateArticleDTO } from '../dtos/ArticleDTO.js';
import { Request, Response } from 'express';
import { validateDTO } from '../middlewares/ValidateDTO.js';
import logger from '../utils/logger.js';
import { plainToInstance } from 'class-transformer';
import { ArticleResponseDTO } from '../dtos/ArticleDTO.js';

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  validateDTO(CreateArticleDTO),
  async (req: Request<{}, {}, CreateArticleDTO>, res: Response): Promise<void> => {
    const { title, content, authorId } = req.body;
    const article = await ArticleModel.createArticle(title, content, authorId);
    logger.info(`Article created: ${JSON.stringify(article)}`);

    const response = plainToInstance(ArticleResponseDTO, article, {
      excludeExtraneousValues: true,
    });
    res.status(201).json(response);
  }
);

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  const { page = 1, limit = 10, author_id, keyword } = req.query;
  const filters = {
    authorId: author_id ? Number(author_id) : undefined,
    keyword: keyword as string | undefined,
  };
  const articles = await ArticleModel.getArticles({
    page: Number(page),
    limit: Number(limit),
    filters,
  });
  logger.info(`Fetched articles`);
  console.log('Raw data before plainToInstance:', articles);

  const response = plainToInstance(ArticleResponseDTO, articles, {
    excludeExtraneousValues: true,
  });
  res.json(response);
});

router.put(
  '/:id',
  authenticateToken,
  validateDTO(UpdateArticleDTO),
  async (req: Request<{ id: string }, {}, UpdateArticleDTO>, res: Response): Promise<void> => {
    const user = req.user;

    if (!user) {
      logger.warn(`Unauthorized update attempt by user ${user.id}`);
      res.sendStatus(401);
      return;
    }

    if (user.role !== 'admin' && user.id !== req.body.authorId) {
      logger.warn(`Forbidden update attempt by user ${user.id}`);
      res.sendStatus(403);
      return;
    }

    const article = await ArticleModel.updateArticle(parseInt(req.params.id, 10), req.body);

    logger.info(`Article updated: ${JSON.stringify(article)}`);

    const response = plainToInstance(ArticleResponseDTO, article, {
      excludeExtraneousValues: true,
    });
    res.json(response);
  }
);

router.delete(
  '/:id',
  authenticateToken,
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const user = req.user;
    const article = await ArticleModel.getArticleById(parseInt(req.params.id));

    if (!user) {
      logger.warn(`Unauthorized delete attempt by user ${user.id}`);
      res.sendStatus(401);
      return;
    }

    if (user.role !== 'admin' && article.authorId !== req.user.id) {
      logger.warn(`Forbidden delete attempt by user ${user.id}`);
      res.sendStatus(403);
      return;
    }

    const articleId = parseInt(req.params.id, 10);

    if (isNaN(articleId)) {
      res.status(400).json({ error: 'Invalid article ID' });
      logger.error(`Invalid article ID`);
      return;
    }

    await ArticleModel.deleteArticle(articleId);
    logger.info(`Article deleted: ${articleId}`);
    res.sendStatus(204);
  }
);

export default router;

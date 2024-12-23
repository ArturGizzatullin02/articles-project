import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import ArticleController from './controllers/ArticleController.js';
import CommentController from './controllers/CommentController.js';
import { authenticateToken, authorizeRole } from './middlewares/auth.js';
import logger from './utils/logger.js';

const app = express();
app.use(bodyParser.json());

app.use('/articles', ArticleController);
app.use('/comments', CommentController);

const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on PORT ${PORT}`);
});
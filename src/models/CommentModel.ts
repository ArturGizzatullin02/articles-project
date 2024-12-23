import pool from '../utils/db.js';

export default class CommentModel {
  static async createComment(articleId: number, authorId: number, content: string) {
    const result = await pool.query(
      'INSERT INTO comments (article_id, author_id, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [articleId, authorId, content]
    );
    return result.rows[0];
  }

  static async getComments(articleId: number, { page, limit }: { page: number; limit: number }) {
    const offset = (page - 1) * limit;
    const result = await pool.query(
      'SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [articleId, limit, offset]
    );
    return result.rows;
  }
}
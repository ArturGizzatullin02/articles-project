import pool from '../utils/db.js';

export default class ArticleModel {
  static async createArticle(title: string, content: string, authorId: number) {
    const result = await pool.query(
      'INSERT INTO articles (title, content, author_id, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
      [title, content, authorId]
    );
    return result.rows[0];
  }

  static async getArticles({ page, limit, filters }: { page: number; limit: number; filters: { authorId?: number; keyword?: string } }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values: any[] = [];

    if (filters.authorId) {
      conditions.push('author_id = $' + (values.length + 1));
      values.push(filters.authorId);
    }

    if (filters.keyword) {
      conditions.push('(title ILIKE $' + (values.length + 1) + ' OR content ILIKE $' + (values.length + 2) + ')');
      values.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT * FROM articles
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async updateArticle(id: number, data: any) {
    const result = await pool.query(
      'UPDATE articles SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [data.title, data.content, id]
    );
    return result.rows[0];
  }

  static async deleteArticle(id: number) {
    await pool.query('DELETE FROM articles WHERE id = $1', [id]);
  }

  static async getArticleById(id: number) {
    const result = await pool.query(
      'SELECT * FROM articles WHERE id = $1',
      [id]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
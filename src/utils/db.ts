import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'articles_db',
  password: 'postgres',
  port: 5432,
});

async function initializeDatabase() {
  const initSQLPath = path.join(__dirname, '../../src/init.sql');
  const initSQL = fs.readFileSync(initSQLPath, 'utf-8');
  
  try {
    await pool.query(initSQL);
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error(`Database initialization failed: ${error.message}`);
  }
}

initializeDatabase();

export default pool;
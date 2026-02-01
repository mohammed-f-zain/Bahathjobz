import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get database URL from environment or use default local path
const defaultDbPath = path.join(__dirname, '../data/bahath_jobz.db');
const databaseUrl = process.env.DATABASE_URL || `file:${defaultDbPath}`;

// Create database directory if using local file
if (databaseUrl.startsWith('file:')) {
  const dbDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

// Create database client
const db = createClient({
  url: databaseUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined
});

// Initialize database with schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// Split schema into individual statements and execute them
const statements = schema.split(';').filter(stmt => stmt.trim());
for (const statement of statements) {
  if (statement.trim()) {
    try {
      await db.execute(statement);
    } catch (error) {
      // Ignore table already exists errors
      if (!error.message.includes('already exists')) {
        console.error('Error executing statement:', statement);
        console.error(error);
      }
    }
  }
}

export default db;
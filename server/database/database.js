// server/database/database.js
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure database directory exists
const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'bahath_jobz.db');

// Create database client
const db = createClient({
  url: `file:${dbPath}`
});

// Initialize schema function
async function initSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');

  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      try {
        await db.execute(statement);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('Error executing statement:', statement);
          console.error(error);
        }
      }
    }
  }
}

// Run schema init
initSchema();

export default db;





import db from '../database/database.js';

console.log('Initializing database...');

try {
  // The database schema is already created in database.js
  // This script just ensures the database is properly initialized
  
  // Test the connection
  const result = db.prepare('SELECT COUNT(*) as count FROM users').get();
  console.log(`Database initialized successfully. Current user count: ${result.count}`);
  
  if (result.count === 0) {
    console.log('Database is empty. Run "npm run seed" to add sample data.');
  } else {
    console.log('Database contains data. Ready to use!');
  }
} catch (error) {
  console.error('Database initialization error:', error);
  process.exit(1);
}
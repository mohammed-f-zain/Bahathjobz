import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/bahath_jobz.db');
console.log('Database path:', dbPath);

const db = createClient({
    url: `file:${dbPath}`
});

async function checkDatabase() {
    try {
        // Get all tables
        const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
        console.log('\n📋 Tables in database:');
        tables.rows.forEach(row => console.log('  -', row.name));

        // Check each table count
        console.log('\n📊 Record counts:');
        for (const row of tables.rows) {
            const tableName = row.name;
            if (tableName.startsWith('sqlite_') || tableName.startsWith('_')) continue;
            try {
                const count = await db.execute(`SELECT COUNT(*) as count FROM "${tableName}"`);
                console.log(`  ${tableName}: ${count.rows[0].count} records`);
            } catch (e) {
                console.log(`  ${tableName}: Error - ${e.message}`);
            }
        }

        // Check users table structure
        console.log('\n👤 Sample users:');
        const users = await db.execute('SELECT id, email, first_name, last_name, role, is_active FROM users LIMIT 5');
        users.rows.forEach(user => {
            console.log(`  - ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role}, Active: ${user.is_active}`);
        });

        // Check jobs
        console.log('\n💼 Sample jobs:');
        const jobs = await db.execute('SELECT id, title, location, is_approved, is_active FROM jobs LIMIT 5');
        jobs.rows.forEach(job => {
            console.log(`  - ${job.title} @ ${job.location} - Approved: ${job.is_approved}, Active: ${job.is_active}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

checkDatabase();



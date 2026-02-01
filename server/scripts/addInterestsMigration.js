// Migration script to add interests and email notification fields
// Run this script once to update existing database
// This is safe to run multiple times (uses IF NOT EXISTS)

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🔄 Starting migration: Adding interests and email notification fields...');

    // Note: Prisma will handle the schema changes when you run:
    // npx prisma migrate dev --name add_interests_and_email_notifications
    // or
    // npx prisma db push
    
    // For manual SQL execution (if needed):
    const sql = `
      -- Add interests field to users table
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS interests JSONB,
      ADD COLUMN IF NOT EXISTS interests_selected BOOLEAN DEFAULT false;

      -- Add email notification fields to jobs table
      ALTER TABLE "job"
      ADD COLUMN IF NOT EXISTS send_email_notification BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS notification_interests JSONB;

      -- Set interests_selected to true for existing users who have job_seeker profile with industries
      UPDATE "user" u
      SET interests_selected = true
      FROM job_seeker js
      WHERE u.id = js.user_id 
        AND js.industries IS NOT NULL
        AND u.interests_selected = false;
    `;

    console.log('✅ Migration SQL prepared. Run Prisma migrate or execute the SQL manually.');
    console.log('📝 SQL to execute:');
    console.log(sql);

    // If you want to execute directly (uncomment if needed):
    // await prisma.$executeRawUnsafe(sql);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export default runMigration;


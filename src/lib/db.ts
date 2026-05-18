import { neon } from '@neondatabase/serverless';

// Retrieve the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

// Ensure DB client is initialized only if connection string is provided
export const sql = databaseUrl ? neon(databaseUrl) : null;

/**
 * Lazy-initializes the database tables.
 * Creates the student_submissions table if it does not already exist.
 */
export async function initDatabase() {
  if (!sql) {
    console.warn("Database connection string (DATABASE_URL) is not set. Database operations will be bypassed.");
    return false;
  }

  try {
    // Create student_submissions table with JSONB details and indexed key columns
    await sql`
      CREATE TABLE IF NOT EXISTS student_submissions (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        roll_number VARCHAR(100) NOT NULL,
        stream VARCHAR(100) NOT NULL,
        details JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create indexes for efficient searching/filtering in Admin Dashboard
    await sql`CREATE INDEX IF NOT EXISTS idx_student_submissions_roll ON student_submissions(roll_number);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_student_submissions_stream ON student_submissions(stream);`;
    
    return true;
  } catch (error) {
    console.error("Failed to initialize database schema:", error);
    return false;
  }
}

/**
 * Checks if a given email belongs to an administrator.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
  const adminEmails = adminEmailsEnv
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
    
  return adminEmails.includes(email.toLowerCase());
}

import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    // 1. If database connection is not configured, return a mock draft for dev bypass
    if (!sql) {
      console.warn("Neon Database connection not set. Bypassing fetch and returning mock draft details.");
      return NextResponse.json({
        record: {
          email,
          full_name: "Demo Student Account",
          roll_number: "13000223045",
          stream: "CSE-AIML",
          details: null // Let client load defaults first
        }
      });
    }

    // Initialize database tables if not existing
    await initDatabase();

    // 2. Query Neon DB for student submission by email
    const records = await sql`
      SELECT * FROM student_submissions 
      WHERE email = ${email} 
      LIMIT 1
    `;

    if (records && records.length > 0) {
      return NextResponse.json({ record: records[0] });
    }

    return NextResponse.json({ record: null });

  } catch (error: any) {
    console.error("Fetch student details API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch student profile" }, { status: 500 });
  }
}

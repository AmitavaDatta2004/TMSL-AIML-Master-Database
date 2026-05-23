import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // SECURITY: Verify the user is authenticated before returning any data
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Access Denied: You must be signed in to fetch profile data." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    // SECURITY: Enforce ownership — a student can only fetch their OWN record.
    // An admin may fetch any student's record.
    if (session.user.role !== 'admin' && session.user.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Access Denied: You are not authorised to view another student's profile." }, { status: 403 });
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

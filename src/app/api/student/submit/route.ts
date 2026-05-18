import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, full_name, roll_number, stream, details } = body;

    // Validate parameters
    if (!email || !full_name) {
      return NextResponse.json({ error: "Email and Student Full Name are required fields." }, { status: 400 });
    }

    // 1. If Neon DB is not configured, bypass saving and return mock success for local testing
    if (!sql) {
      console.warn("Neon Database connection not set. Bypassing save operation and simulating database success.");
      return NextResponse.json({ 
        success: true, 
        message: "Development Mode: Details mock-saved successfully!" 
      });
    }

    // Initialize database tables if not existing
    await initDatabase();

    // 2. Perform Native PG Upsert on Conflict of email
    await sql`
      INSERT INTO student_submissions (email, full_name, roll_number, stream, details, updated_at)
      VALUES (${email}, ${full_name}, ${roll_number || ''}, ${stream || 'CSE-AIML'}, ${JSON.stringify(details)}, CURRENT_TIMESTAMP)
      ON CONFLICT (email)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        roll_number = EXCLUDED.roll_number,
        stream = EXCLUDED.stream,
        details = EXCLUDED.details,
        updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true, message: "Student record upserted successfully in Neon DB!" });

  } catch (error: any) {
    console.error("Submit student details API error:", error);
    return NextResponse.json({ error: error.message || "Failed to save student details." }, { status: 500 });
  }
}

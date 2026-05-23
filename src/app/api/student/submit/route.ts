import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';

export async function POST(request: Request) {
  try {
    // SECURITY: Verify the user is authenticated before allowing any write
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Access Denied: You must be signed in to submit your profile." }, { status: 401 });
    }

    const body = await request.json();
    const { email, full_name, roll_number, stream, details } = body;

    // SECURITY: Validate required parameters
    if (!email || !full_name) {
      return NextResponse.json({ error: "Email and Student Full Name are required fields." }, { status: 400 });
    }

    // SECURITY: Enforce ownership — a student can only submit their OWN data.
    // An admin may submit on behalf of any student.
    if (session.user.role !== 'admin' && session.user.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Access Denied: You are not authorised to modify another student's record." }, { status: 403 });
    }

    // SECURITY: Basic input size guard — prevent oversized JSON payloads
    const detailsStr = JSON.stringify(details || {});
    if (detailsStr.length > 200_000) {
      return NextResponse.json({ error: "Payload too large. Your submitted data exceeds the maximum allowed size." }, { status: 413 });
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
      VALUES (${email}, ${full_name}, ${roll_number || ''}, ${stream || 'CSE-AIML'}, ${detailsStr}, CURRENT_TIMESTAMP)
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

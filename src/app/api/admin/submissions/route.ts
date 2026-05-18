import { NextResponse } from 'next/server';
import { sql, initDatabase, isAdminEmail } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Verify administrative authorization on the server
    const session = await getServerSession();
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Access Denied: Administrative credentials required." }, { status: 403 });
    }

    // 2. If database is not configured, return a robust set of mock student details for local development preview
    if (!sql) {
      console.warn("Neon Database connection not set. Bypassing fetch and returning mock student list.");
      return NextResponse.json({
        submissions: [
          {
            id: 1,
            email: "biswajit.tmsl27@gmail.com",
            full_name: "BISWAJIT DEBNATH",
            roll_number: "13000223045",
            stream: "CSE-AIML",
            created_at: new Date().toISOString(),
            details: {
              gender: "MALE",
              dob: "14-08-2005",
              blood_group: "O+",
              contact_operational_1: "9876543210",
              email_operational_gmail: "biswajit.tmsl27@gmail.com",
              linkedin_link: "https://linkedin.com/in/biswajit",
              github_link: "https://github.com/biswajit",
              class_x_school: "Salt Lake School",
              class_x_actual_pct: "85.4",
              class_x_math_pct: "92",
              class_xii_school: "Salt Lake School",
              class_xii_actual_pct: "82.2",
              class_xii_math_pct: "88",
              university_reg_no: "231300100456",
              sem_1_cgpa: "8.65",
              sem_2_cgpa: "8.42",
              sem_3_cgpa: "8.90",
              sem_4_cgpa: "8.81",
              sem_5_cgpa: "8.75",
              btech_avg_cgpa: "8.71",
              btech_backlog: "NO",
              father_name: "TAPAS DEBNATH",
              father_occupation: "BUSINESS",
              mother_name: "REKHA DEBNATH",
              mother_occupation: "HOUSEWIFE",
              perm_address: "59/379, North Masunda, New Barrackpur, 700131",
              perm_state: "WEST BENGAL",
              photo_pdf_link: "https://drive.google.com/file/d/photo-biswajit/view",
              physical_disability: "NO",
              study_gap: "NO",
              declaration_agree: "YES"
            }
          },
          {
            id: 2,
            email: "ananya.tmsl27@gmail.com",
            full_name: "ANANYA ROY",
            roll_number: "13000223012",
            stream: "CSE-AIML",
            created_at: new Date().toISOString(),
            details: {
              gender: "FEMALE",
              dob: "22-11-2005",
              blood_group: "B+",
              contact_operational_1: "9830219485",
              email_operational_gmail: "ananya.tmsl27@gmail.com",
              linkedin_link: "https://linkedin.com/in/ananya",
              github_link: "https://github.com/ananya",
              class_x_school: "Kolkata High School",
              class_x_actual_pct: "92.6",
              class_x_math_pct: "95",
              class_xii_school: "Kolkata High School",
              class_xii_actual_pct: "94.8",
              class_xii_math_pct: "96",
              university_reg_no: "231300100412",
              sem_1_cgpa: "9.21",
              sem_2_cgpa: "9.30",
              sem_3_cgpa: "9.12",
              sem_4_cgpa: "9.25",
              sem_5_cgpa: "9.41",
              btech_avg_cgpa: "9.26",
              btech_backlog: "NO",
              father_name: "DEBASISH ROY",
              father_occupation: "SERVICE",
              mother_name: "SUTAPA ROY",
              mother_occupation: "TEACHER",
              perm_address: "159/3, ABCD Lane, Kolkata, 700024",
              perm_state: "WEST BENGAL",
              photo_pdf_link: "https://drive.google.com/file/d/photo-ananya/view",
              physical_disability: "NO",
              study_gap: "NO",
              declaration_agree: "YES"
            }
          },
          {
            id: 3,
            email: "subhajit.tmsl27@gmail.com",
            full_name: "SUBHAJIT MUKHERJEE",
            roll_number: "13000223098",
            stream: "CSE-AIML",
            created_at: new Date().toISOString(),
            details: {
              gender: "MALE",
              dob: "03-05-2004",
              blood_group: "A+",
              contact_operational_1: "7003456789",
              email_operational_gmail: "subhajit.tmsl27@gmail.com",
              linkedin_link: "https://linkedin.com/in/subhajit",
              github_link: "https://github.com/subhajit",
              class_x_school: "Techno India School",
              class_x_actual_pct: "78.4",
              class_x_math_pct: "75",
              class_xii_school: "Techno India School",
              class_xii_actual_pct: "74.2",
              class_xii_math_pct: "68",
              university_reg_no: "231300100498",
              sem_1_cgpa: "7.15",
              sem_2_cgpa: "7.30",
              sem_3_cgpa: "6.90",
              sem_4_cgpa: "7.12",
              sem_5_cgpa: "7.22",
              btech_avg_cgpa: "7.14",
              btech_backlog: "YES",
              btech_backlog_count: "1",
              btech_backlog_subject_1: "PCC-CS502",
              father_name: "ALOK MUKHERJEE",
              father_occupation: "BUSINESS",
              mother_name: "SOMA MUKHERJEE",
              mother_occupation: "HOUSEWIFE",
              perm_address: "12, MG Road, Kolkata, 700001",
              perm_state: "WEST BENGAL",
              photo_pdf_link: "https://drive.google.com/file/d/photo-subhajit/view",
              physical_disability: "NO",
              study_gap: "YES",
              study_gap_years: "1",
              study_gap_period: "(2022-2023)",
              study_gap_reason: "MEDICAL HEALTH",
              declaration_agree: "YES"
            }
          }
        ]
      });
    }

    // Initialize database tables if not existing
    await initDatabase();

    // 3. Query all submissions from Neon DB
    const submissions = await sql`
      SELECT * FROM student_submissions 
      ORDER BY roll_number ASC
    `;

    return NextResponse.json({ submissions });

  } catch (error: any) {
    console.error("Submissions fetch API error:", error);
    return NextResponse.json({ error: error.message || "Failed to load database records." }, { status: 500 });
  }
}

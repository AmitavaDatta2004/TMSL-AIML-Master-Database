import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';
import ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';
import path from 'path';
import fs from 'fs';

// Helper to gracefully extract details field
const MOCK_LIST = [
  {
    full_name: "BISWAJIT DEBNATH",
    roll_number: "13000223045",
    stream: "CSE-AIML",
    email: "biswajit.tmsl27@gmail.com",
    details: {
      gender: "MALE",
      dob: "14-08-2005",
      blood_group: "O+",
      contact_operational_1: "9876543210",
      email_operational_gmail: "biswajit.tmsl27@gmail.com",
      linkedin_link: "https://linkedin.com/in/biswajit",
      github_link: "https://github.com/biswajit",
      class_x_exam_name: "WBBSE",
      class_x_pass_year: "2021",
      class_x_board: "WBBSE",
      class_x_school: "Salt Lake School",
      class_x_medium: "ENG",
      class_x_std_marks_pct: "85.4",
      class_x_actual_pct: "85.4",
      class_x_math_pct: "92",
      class_x_science_pct: "88",
      class_x_comp_app_pct: "96",
      class_xii_exam_name: "W.B.C.H.S.E",
      class_xii_pass_year: "2023",
      class_xii_board: "W.B.C.H.S.E",
      class_xii_school: "Salt Lake School",
      class_xii_medium: "ENG",
      class_xii_std_marks_pct: "82.2",
      class_xii_actual_pct: "82.2",
      class_xii_math_pct: "88",
      class_xii_physics_pct: "85",
      class_xii_chemistry_pct: "80",
      entrance_exam_name: "WBJEE",
      entrance_exam_rank: "12045",
      university_reg_no: "231300100456",
      btech_stream: "CSE-AIML",
      btech_course_duration: "2023-2027",
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
      perm_post_office: "NEW BARRACKPUR",
      perm_city: "NEW BARRACKPUR",
      perm_pin: "700131",
      perm_district: "NORTH 24 PARGANAS",
      perm_state: "WEST BENGAL",
      photo_pdf_link: "https://drive.google.com/file/d/photo-biswajit/view",
      physical_disability: "NO",
      study_gap: "NO",
      declaration_agree: "YES"
    }
  },
  {
    full_name: "ANANYA ROY",
    roll_number: "13000223012",
    stream: "CSE-AIML",
    email: "ananya.tmsl27@gmail.com",
    details: {
      gender: "FEMALE",
      dob: "22-11-2005",
      blood_group: "B+",
      contact_operational_1: "9830219485",
      email_operational_gmail: "ananya.tmsl27@gmail.com",
      linkedin_link: "https://linkedin.com/in/ananya",
      github_link: "https://github.com/ananya",
      class_x_exam_name: "CBSE",
      class_x_pass_year: "2021",
      class_x_board: "CBSE",
      class_x_school: "Kolkata High School",
      class_x_medium: "ENG",
      class_x_std_marks_pct: "92.6",
      class_x_actual_pct: "92.6",
      class_x_math_pct: "95",
      class_x_science_pct: "94",
      class_x_comp_app_pct: "98",
      class_xii_exam_name: "CBSE",
      class_xii_pass_year: "2023",
      class_xii_board: "CBSE",
      class_xii_school: "Kolkata High School",
      class_xii_medium: "ENG",
      class_xii_std_marks_pct: "94.8",
      class_xii_actual_pct: "94.8",
      class_xii_math_pct: "96",
      class_xii_physics_pct: "95",
      class_xii_chemistry_pct: "94",
      entrance_exam_name: "WBJEE",
      entrance_exam_rank: "4512",
      university_reg_no: "231300100412",
      btech_stream: "CSE-AIML",
      btech_course_duration: "2023-2027",
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
      perm_post_office: "KOLKATA",
      perm_city: "KOLKATA",
      perm_pin: "700024",
      perm_district: "KOLKATA",
      perm_state: "WEST BENGAL",
      photo_pdf_link: "https://drive.google.com/file/d/photo-ananya/view",
      physical_disability: "NO",
      study_gap: "NO",
      declaration_agree: "YES"
    }
  }
];

export async function GET() {
  try {
    // 1. Verify admin authorization
    const session = await getServerSession();
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Access Denied: Administrative credentials required." }, { status: 403 });
    }

    // 2. Locate master Excel template file in workspace root
    const templateFileName = "TMSL - B.Tech- (CSE,IT, CSE-AIML,CSBS,CSDS ,CSCS,ECE,ECS,CSE-IOT,EE,EIE,ME,CE,FT) -MASTER DATABASE FORMAT- 2027 pass out batch (1).xlsx";
    const templatePath = path.join(process.cwd(), templateFileName);

    if (!fs.existsSync(templatePath)) {
      console.error("Master Excel template file not found at path:", templatePath);
      return NextResponse.json({ error: "Master Excel Template file not found in workspace." }, { status: 500 });
    }

    // 3. Load Excel workbook using ExcelJS to preserve exact formatting, colors, and styles!
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const worksheet = workbook.worksheets[0]; // Get the first sheet

    // Remove empty/hint rows (row 4 and 5) so data starts right below headers (row 3)
    worksheet.spliceRows(4, 2);

    // Write title to the top row (A1) and format it
    const titleRow = worksheet.getRow(1);
    titleRow.height = 35; // Make the row taller for big text

    // Apply color to the entire top row
    for (let i = 1; i <= 86; i++) {
      const c = titleRow.getCell(i);
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } }; // Light blue
    }

    const titleCell = worksheet.getCell('A1');
    titleCell.value = "Department of CSE-AIML , TECHNO MAIN SALT LAKE  |  Batch 2023-27";
    titleCell.font = { bold: true, size: 22 };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    
    try {
      worksheet.mergeCells('A1:CH1'); // Merge across all 86 columns
    } catch (e) {
      // Ignore if already merged by template
    }

    // Center all headers in row 3 and set fixed height to prevent clipping
    const headerRow = worksheet.getRow(3);
    headerRow.height = 40; // Set to fixed height large enough for 3 lines
    headerRow.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    // Helper to parse numbers properly to avoid "Number Stored as Text" in Excel
    const parseExcelValue = (val: any) => {
      if (val === null || val === undefined || val === "") return "";
      if (typeof val === 'number') return val;
      const strVal = String(val).trim();
      // Allow negatives, decimals, but prevent losing leading zeros by avoiding conversion of strings like "09"
      if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(strVal)) {
        return Number(strVal);
      }
      return strVal;
    };

    // Helper to create clickabe hyperlinks
    const createHyperlink = (url: any) => {
      if (!url) return "";
      const strUrl = String(url).trim();
      // Ensure url has protocol for Excel hyperlink
      const validUrl = strUrl.startsWith('http') ? strUrl : `https://${strUrl}`;
      return { text: strUrl, hyperlink: validUrl, tooltip: strUrl };
    };

    // 4. Retrieve student submissions from Neon DB, or fallback to local MOCK_LIST
    let students = [];
    if (sql) {
      await initDatabase();
      students = await sql`
        SELECT * FROM student_submissions 
        ORDER BY roll_number ASC
      `;
    } else {
      console.warn("Neon Database connection not set. Bypassing and populating mock student records for export.");
      students = MOCK_LIST;
    }

    // 5. Construct rows and inject into ExcelJS worksheet
    students.forEach((student: any, idx: number) => {
      const details = student.details || {};
      
      const row = new Array(86).fill("");

      // General Details
      row[0] = idx + 1; // SL. NO.
      row[1] = student.stream || ""; // STREAM
      row[2] = parseExcelValue(student.roll_number); // B.TECH UNIVERSITY ROLL NUMBER
      row[3] = student.full_name || details.full_name || ""; // STUDENT'S FULL NAME
      row[4] = details.first_middle_name || ""; // FIRST & MIDDLE NAME
      row[5] = details.last_name || ""; // LAST NAME
      row[6] = createHyperlink(details.photo_pdf_link); // PHOTO PDF LINK
      row[7] = details.gender || ""; // GENDER
      row[8] = details.dob || ""; // DOB (DD-MM-YYYY)
      row[9] = details.blood_group || ""; // BLOOD GROUP
      row[10] = parseExcelValue(details.contact_residence); // CONTACT RESIDENCE
      row[11] = parseExcelValue(details.contact_operational_1); // OPERATIONAL CONTACT 1
      row[12] = parseExcelValue(details.contact_operational_2); // OPERATIONAL CONTACT 2
      row[13] = student.email || details.email_operational_gmail || ""; // EMAIL GMAIL
      row[14] = details.email_secondary || ""; // EMAIL SECONDARY
      row[15] = createHyperlink(details.linkedin_link); // LINKEDIN
      row[16] = createHyperlink(details.github_link); // GITHUB

      // Class X Details
      row[17] = details.class_x_exam_name || ""; // EXAM NAME
      row[18] = parseExcelValue(details.class_x_pass_year); // PASS YEAR
      row[19] = details.class_x_board || ""; // BOARD
      row[20] = details.class_x_school || ""; // SCHOOL NAME
      row[21] = details.class_x_medium || ""; // MEDIUM
      row[22] = parseExcelValue(details.class_x_std_marks_pct); // STANDARD MARKS %
      row[23] = parseExcelValue(details.class_x_actual_pct); // ACTUAL PERCENTAGE
      row[24] = parseExcelValue(details.class_x_math_pct); // MATHS %
      row[25] = parseExcelValue(details.class_x_science_pct); // SCIENCE GROUP %
      row[26] = parseExcelValue(details.class_x_comp_app_pct) || ""; // COMPUTER APPLICATION %

      // Class XII Details
      row[27] = details.class_xii_exam_name || ""; // EXAM NAME
      row[28] = parseExcelValue(details.class_xii_pass_year); // PASS YEAR
      row[29] = details.class_xii_board || ""; // BOARD
      row[30] = details.class_xii_school || ""; // SCHOOL NAME
      row[31] = details.class_xii_medium || ""; // MEDIUM
      row[32] = parseExcelValue(details.class_xii_std_marks_pct); // STANDARD MARKS %
      row[33] = parseExcelValue(details.class_xii_actual_pct); // ACTUAL PERCENTAGE
      row[34] = parseExcelValue(details.class_xii_math_pct); // MATHS %
      row[35] = parseExcelValue(details.class_xii_physics_pct); // PHYSICS %
      row[36] = parseExcelValue(details.class_xii_chemistry_pct); // CHEMISTRY %

      // Diploma Details
      row[37] = details.diploma_exam_name || "";
      row[38] = parseExcelValue(details.diploma_rank) || "";
      row[39] = details.diploma_stream || "";
      row[40] = parseExcelValue(details.diploma_pass_year) || "";
      row[41] = details.diploma_college || "";
      row[42] = details.diploma_university || "";
      row[43] = parseExcelValue(details.diploma_pct) || "";

      // Entrance Exam
      row[44] = details.entrance_exam_name || ""; // ENTRANCE EXAM NAME
      row[45] = parseExcelValue(details.entrance_exam_rank); // ENTRANCE EXAM RANK

      // B.Tech Graduation Details
      row[46] = details.university_reg_no || ""; // UNIVERSITY REGISTRATION NO
      row[47] = student.stream || details.btech_stream || ""; // STREAM
      row[48] = details.btech_course_duration || ""; // COURSE DURATION
      row[49] = parseExcelValue(details.sem_1_cgpa); // SEM 1
      row[50] = parseExcelValue(details.sem_2_cgpa); // SEM 2
      row[51] = parseExcelValue(details.sem_3_cgpa); // SEM 3
      row[52] = parseExcelValue(details.sem_4_cgpa); // SEM 4
      row[53] = parseExcelValue(details.sem_5_cgpa); // SEM 5
      row[54] = parseExcelValue(details.btech_avg_cgpa); // AVERAGE CGPA
      row[55] = details.btech_backlog || ""; // BACKLOG
      row[56] = parseExcelValue(details.btech_backlog_count) || ""; // BACKLOG COUNT
      row[57] = details.btech_backlog_subject_1 || ""; // BACKLOG SUB 1
      row[58] = details.btech_backlog_subject_2 || ""; // BACKLOG SUB 2

      // Family details
      row[59] = details.father_name || ""; // FATHER NAME
      row[60] = details.father_occupation || ""; // OCCUPATION
      row[61] = details.mother_name || ""; // MOTHER NAME
      row[62] = details.mother_occupation || ""; // OCCUPATION
      row[63] = details.guardian_name || ""; // GUARDIAN NAME
      row[64] = details.guardian_relation || ""; // GUARDIAN RELATION
      row[65] = details.guardian_occupation || ""; // OCCUPATION

      // Permanent Address
      row[66] = details.perm_address || ""; // COMPLETE ADDRESS
      row[67] = details.perm_post_office || ""; // POST OFFICE
      row[68] = details.perm_city || ""; // CITY
      row[69] = parseExcelValue(details.perm_pin); // PIN
      row[70] = details.perm_district || ""; // DISTRICT
      row[71] = details.perm_state || ""; // STATE

      // Present Address
      row[72] = details.pres_address || ""; // COMPLETE ADDRESS
      row[73] = details.pres_post_office || ""; // POST OFFICE
      row[74] = details.pres_city || ""; // CITY
      row[75] = parseExcelValue(details.pres_pin); // PIN
      row[76] = details.pres_district || ""; // DISTRICT
      row[77] = details.pres_state || ""; // STATE

      // Essential details
      row[78] = details.physical_disability || ""; // PHYSICAL DISABILITY
      row[79] = details.study_gap || ""; // STUDY GAP
      row[80] = parseExcelValue(details.study_gap_years) || ""; // GAP YEARS
      row[81] = details.study_gap_period || ""; // GAP PERIOD
      row[82] = details.study_gap_reason || ""; // GAP REASON
      row[83] = details.work_experience || ""; // WORK EXPERIENCE
      row[84] = details.work_experience_mention || ""; // WORK EXPERIENCE MENTION
      row[85] = "AGREE"; // DECLARATION

      // 6. Write student row into worksheet starting at row 4
      const excelRow = worksheet.getRow(4 + idx);
      
      // ExcelJS assigns array elements starting from Column A
      excelRow.values = row;
      
      // Auto-fit height
      // @ts-expect-error: exceljs types require number, but runtime allows undefined for auto-fit
      excelRow.height = undefined;

      // Center align all cells in this row and allow wrapping
      excelRow.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        // If the cell contains a hyperlink, style it as a clickable link
        if (cell.value && typeof cell.value === 'object' && 'hyperlink' in cell.value) {
          cell.font = { color: { argb: 'FF0000FF' }, underline: true };
        }
      });
      
      excelRow.commit();
    });

    // Auto-adjust column widths based on the content of the sheet (rows 3 and below)
    worksheet.columns.forEach((column) => {
      if (!column || typeof column.eachCell !== 'function') return;
      let maxLength = 8;
      column.eachCell({ includeEmpty: false }, (cell) => {
        if (Number(cell.row) >= 3) {
          const content = cell.value && typeof cell.value === 'object' && 'text' in cell.value 
            ? String((cell.value as any).text) 
            : cell.value ? String(cell.value) : "";
          const lines = content.split('\n');
          for (const line of lines) {
            if (line.length > maxLength) {
              maxLength = line.length;
            }
          }
        }
      });
      column.width = Math.min(maxLength + 2, 70); // Add padding, cap at 70 instead of 50 to allow longer headers to fit
    });

    // 7. Write workbook into memory buffer
    const outBuffer = await workbook.xlsx.writeBuffer();

    // 8. Stream buffer back to browser as dynamic attachment
    return new Response(outBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="TMSL_AIML_Master_Database_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });

  } catch (error: any) {
    console.error("Export master database API error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate Excel file export." }, { status: 500 });
  }
}

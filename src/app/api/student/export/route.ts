import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';
import ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    // 1. Verify student authorization
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Access Denied: Please log in first." }, { status: 403 });
    }

    const email = session.user.email;

    // 2. Locate master Excel template file in workspace root
    const templateFileName = "TMSL - B.Tech- (CSE,IT, CSE-AIML,CSBS,CSDS ,CSCS,ECE,ECS,CSE-IOT,EE,EIE,ME,CE,FT) -MASTER DATABASE FORMAT- 2027 pass out batch (1).xlsx";
    const templatePath = path.join(process.cwd(), templateFileName);

    if (!fs.existsSync(templatePath)) {
      console.error("Master Excel template file not found at path:", templatePath);
      return NextResponse.json({ error: "Master Excel Template file not found in workspace." }, { status: 500 });
    }

    // 3. Load Excel workbook using ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const worksheet = workbook.worksheets[0];

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

    // Center all headers in row 3 and allow height to expand
    const headerRow = worksheet.getRow(3);
    // @ts-expect-error: exceljs types require number, but runtime allows undefined for auto-fit
    headerRow.height = undefined; // Auto-fit height
    headerRow.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    // Helper to parse numbers properly
    const parseExcelValue = (val: any) => {
      if (val === null || val === undefined || val === "") return "";
      if (typeof val === 'number') return val;
      const strVal = String(val).trim();
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

    // 4. Retrieve student submission from Neon DB
    let student = null;
    if (sql) {
      await initDatabase();
      const records = await sql`
        SELECT * FROM student_submissions 
        WHERE email = ${email}
        LIMIT 1
      `;
      if (records.length > 0) {
        student = records[0];
      }
    }

    if (!student) {
      return NextResponse.json({ error: "No profile data found in database. Please fill your dossier first." }, { status: 404 });
    }

    // 5. Construct 1-Row Matrix
    const details = student.details || {};
    const row = new Array(86).fill("");

    // General Details
    row[0] = 1; // SL. NO.
    row[1] = student.stream || "CSE-AIML"; // STREAM
    row[2] = parseExcelValue(student.roll_number); // B.TECH UNIVERSITY ROLL NUMBER
    row[3] = student.full_name || details.full_name || ""; // STUDENT'S FULL NAME
    row[4] = details.first_middle_name || ""; // FIRST & MIDDLE NAME
    row[5] = details.last_name || ""; // LAST NAME
    row[6] = createHyperlink(details.photo_pdf_link); // PHOTO PDF LINK
    row[7] = details.gender || "MALE"; // GENDER
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
    row[21] = details.class_x_medium || "ENG"; // MEDIUM
    row[22] = parseExcelValue(details.class_x_std_marks_pct); // STANDARD MARKS %
    row[23] = parseExcelValue(details.class_x_actual_pct); // ACTUAL PERCENTAGE
    row[24] = parseExcelValue(details.class_x_math_pct); // MATHS %
    row[25] = parseExcelValue(details.class_x_science_pct); // SCIENCE GROUP %
    row[26] = parseExcelValue(details.class_x_comp_app_pct) || "N.A."; // COMPUTER APPLICATION %

    // Class XII Details
    row[27] = details.class_xii_exam_name || ""; // EXAM NAME
    row[28] = parseExcelValue(details.class_xii_pass_year); // PASS YEAR
    row[29] = details.class_xii_board || ""; // BOARD
    row[30] = details.class_xii_school || ""; // SCHOOL NAME
    row[31] = details.class_xii_medium || "ENG"; // MEDIUM
    row[32] = parseExcelValue(details.class_xii_std_marks_pct); // STANDARD MARKS %
    row[33] = parseExcelValue(details.class_xii_actual_pct); // ACTUAL PERCENTAGE
    row[34] = parseExcelValue(details.class_xii_math_pct); // MATHS %
    row[35] = parseExcelValue(details.class_xii_physics_pct); // PHYSICS %
    row[36] = parseExcelValue(details.class_xii_chemistry_pct); // CHEMISTRY %

    // Diploma Details
    row[37] = details.diploma_exam_name || "N.A.";
    row[38] = parseExcelValue(details.diploma_rank) || "N.A.";
    row[39] = details.diploma_stream || "N.A.";
    row[40] = parseExcelValue(details.diploma_pass_year) || "N.A.";
    row[41] = details.diploma_college || "N.A.";
    row[42] = details.diploma_university || "N.A.";
    row[43] = parseExcelValue(details.diploma_pct) || "N.A.";

    // Entrance Exam
    row[44] = details.entrance_exam_name || "WBJEE"; // ENTRANCE EXAM NAME
    row[45] = parseExcelValue(details.entrance_exam_rank); // ENTRANCE EXAM RANK

    // B.Tech Graduation Details
    row[46] = details.university_reg_no || ""; // UNIVERSITY REGISTRATION NO
    row[47] = student.stream || details.btech_stream || "CSE-AIML"; // STREAM
    row[48] = details.btech_course_duration || "2023-2027"; // COURSE DURATION
    row[49] = parseExcelValue(details.sem_1_cgpa); // SEM 1
    row[50] = parseExcelValue(details.sem_2_cgpa); // SEM 2
    row[51] = parseExcelValue(details.sem_3_cgpa); // SEM 3
    row[52] = parseExcelValue(details.sem_4_cgpa); // SEM 4
    row[53] = parseExcelValue(details.sem_5_cgpa); // SEM 5
    row[54] = parseExcelValue(details.btech_avg_cgpa); // AVERAGE CGPA
    row[55] = details.btech_backlog || "NO"; // BACKLOG
    row[56] = parseExcelValue(details.btech_backlog_count) || 0; // BACKLOG COUNT
    row[57] = details.btech_backlog_subject_1 || "N.A."; // BACKLOG SUB 1
    row[58] = details.btech_backlog_subject_2 || "N.A."; // BACKLOG SUB 2

    // Family details
    row[59] = details.father_name || ""; // FATHER NAME
    row[60] = details.father_occupation || ""; // OCCUPATION
    row[61] = details.mother_name || ""; // MOTHER NAME
    row[62] = details.mother_occupation || ""; // OCCUPATION
    row[63] = details.guardian_name || "N.A."; // GUARDIAN NAME
    row[64] = details.guardian_relation || "N.A."; // GUARDIAN RELATION
    row[65] = details.guardian_occupation || "N.A."; // OCCUPATION

    // Permanent Address
    row[66] = details.perm_address || ""; // COMPLETE ADDRESS
    row[67] = details.perm_post_office || ""; // POST OFFICE
    row[68] = details.perm_city || ""; // CITY
    row[69] = parseExcelValue(details.perm_pin); // PIN
    row[70] = details.perm_district || ""; // DISTRICT
    row[71] = details.perm_state || "WEST BENGAL"; // STATE

    // Present Address
    row[72] = details.pres_address || ""; // COMPLETE ADDRESS
    row[73] = details.pres_post_office || ""; // POST OFFICE
    row[74] = details.pres_city || ""; // CITY
    row[75] = parseExcelValue(details.pres_pin); // PIN
    row[76] = details.pres_district || ""; // DISTRICT
    row[77] = details.pres_state || "WEST BENGAL"; // STATE

    // Essential details
    row[78] = details.physical_disability || "NO"; // PHYSICAL DISABILITY
    row[79] = details.study_gap || "NO"; // STUDY GAP
    row[80] = parseExcelValue(details.study_gap_years) || 0; // GAP YEARS
    row[81] = details.study_gap_period || "N.A."; // GAP PERIOD
    row[82] = details.study_gap_reason || "N.A."; // GAP REASON
    row[83] = details.work_experience || "NO"; // WORK EXPERIENCE
    row[84] = details.work_experience_mention || "N.A."; // WORK EXPERIENCE MENTION
    row[85] = "AGREE"; // DECLARATION

    // 6. Write student row into worksheet starting at row 4
    const excelRow = worksheet.getRow(4);
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
        'Content-Disposition': `attachment; filename="My_Dossier_${student.roll_number || student.full_name || 'Export'}.xlsx"`,
      },
    });

  } catch (error: any) {
    console.error("Export personal dossier API error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate Excel file export." }, { status: 500 });
  }
}

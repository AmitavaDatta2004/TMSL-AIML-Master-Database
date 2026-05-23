import React from 'react';
import { X, ExternalLink } from 'lucide-react';

const EXCEL_COLUMNS = [
  { header: "SL. NO.", key: "sl_no", sticky: true },
  { header: "STREAM", key: "stream", sticky: true },
  { header: "B.TECH UNIVERSITY ROLL NUMBER", key: "roll_number", sticky: true },
  { header: "STUDENT'S FULL NAME", key: "full_name", sticky: true },
  { header: "FIRST & MIDDLE NAME", key: "details.first_middle_name" },
  { header: "LAST NAME", key: "details.last_name" },
  { header: "PHOTO PDF LINK", key: "details.photo_pdf_link", type: 'link' },
  { header: "GENDER", key: "details.gender" },
  { header: "DOB (DD-MM-YYYY)", key: "details.dob" },
  { header: "BLOOD GROUP", key: "details.blood_group" },
  { header: "CONTACT RESIDENCE", key: "details.contact_residence" },
  { header: "OPERATIONAL CONTACT 1", key: "details.contact_operational_1" },
  { header: "OPERATIONAL CONTACT 2", key: "details.contact_operational_2" },
  { header: "EMAIL GMAIL", key: "email" },
  { header: "EMAIL SECONDARY", key: "details.email_secondary" },
  { header: "LINKEDIN", key: "details.linkedin_link", type: 'link' },
  { header: "GITHUB", key: "details.github_link", type: 'link' },
  { header: "EXAM NAME (X)", key: "details.class_x_exam_name" },
  { header: "PASS YEAR (X)", key: "details.class_x_pass_year" },
  { header: "BOARD (X)", key: "details.class_x_board" },
  { header: "SCHOOL NAME (X)", key: "details.class_x_school" },
  { header: "MEDIUM (X)", key: "details.class_x_medium" },
  { header: "STANDARD MARKS % (X)", key: "details.class_x_std_marks_pct" },
  { header: "ACTUAL PERCENTAGE (X)", key: "details.class_x_actual_pct" },
  { header: "MATHS % (X)", key: "details.class_x_math_pct" },
  { header: "SCIENCE GROUP % (X)", key: "details.class_x_science_pct" },
  { header: "COMPUTER APPLICATION % (X)", key: "details.class_x_comp_app_pct" },
  { header: "EXAM NAME (XII)", key: "details.class_xii_exam_name" },
  { header: "PASS YEAR (XII)", key: "details.class_xii_pass_year" },
  { header: "BOARD (XII)", key: "details.class_xii_board" },
  { header: "SCHOOL NAME (XII)", key: "details.class_xii_school" },
  { header: "MEDIUM (XII)", key: "details.class_xii_medium" },
  { header: "STANDARD MARKS % (XII)", key: "details.class_xii_std_marks_pct" },
  { header: "ACTUAL PERCENTAGE (XII)", key: "details.class_xii_actual_pct" },
  { header: "MATHS % (XII)", key: "details.class_xii_math_pct" },
  { header: "PHYSICS % (XII)", key: "details.class_xii_physics_pct" },
  { header: "CHEMISTRY % (XII)", key: "details.class_xii_chemistry_pct" },
  { header: "EXAM NAME (DIP)", key: "details.diploma_exam_name" },
  { header: "RANK (DIP)", key: "details.diploma_rank" },
  { header: "STREAM (DIP)", key: "details.diploma_stream" },
  { header: "PASS YEAR (DIP)", key: "details.diploma_pass_year" },
  { header: "COLLEGE (DIP)", key: "details.diploma_college" },
  { header: "UNIVERSITY (DIP)", key: "details.diploma_university" },
  { header: "PERCENTAGE (DIP)", key: "details.diploma_pct" },
  { header: "ENTRANCE EXAM NAME", key: "details.entrance_exam_name" },
  { header: "ENTRANCE EXAM RANK", key: "details.entrance_exam_rank" },
  { header: "UNIVERSITY REGISTRATION NO", key: "details.university_reg_no" },
  { header: "STREAM", key: "stream" },
  { header: "COURSE DURATION", key: "details.btech_course_duration" },
  { header: "SEM 1", key: "details.sem_1_cgpa" },
  { header: "SEM 2", key: "details.sem_2_cgpa" },
  { header: "SEM 3", key: "details.sem_3_cgpa" },
  { header: "SEM 4", key: "details.sem_4_cgpa" },
  { header: "SEM 5", key: "details.sem_5_cgpa" },
  { header: "AVERAGE CGPA", key: "details.btech_avg_cgpa" },
  { header: "BACKLOG", key: "details.btech_backlog" },
  { header: "BACKLOG COUNT", key: "details.btech_backlog_count" },
  { header: "BACKLOG SUB 1", key: "details.btech_backlog_subject_1" },
  { header: "BACKLOG SUB 2", key: "details.btech_backlog_subject_2" },
  { header: "FATHER NAME", key: "details.father_name" },
  { header: "OCCUPATION", key: "details.father_occupation" },
  { header: "MOTHER NAME", key: "details.mother_name" },
  { header: "OCCUPATION", key: "details.mother_occupation" },
  { header: "GUARDIAN NAME", key: "details.guardian_name" },
  { header: "GUARDIAN RELATION", key: "details.guardian_relation" },
  { header: "OCCUPATION", key: "details.guardian_occupation" },
  { header: "COMPLETE ADDRESS (PERM)", key: "details.perm_address" },
  { header: "POST OFFICE (PERM)", key: "details.perm_post_office" },
  { header: "CITY (PERM)", key: "details.perm_city" },
  { header: "PIN (PERM)", key: "details.perm_pin" },
  { header: "DISTRICT (PERM)", key: "details.perm_district" },
  { header: "STATE (PERM)", key: "details.perm_state" },
  { header: "COMPLETE ADDRESS (PRES)", key: "details.pres_address" },
  { header: "POST OFFICE (PRES)", key: "details.pres_post_office" },
  { header: "CITY (PRES)", key: "details.pres_city" },
  { header: "PIN (PRES)", key: "details.pres_pin" },
  { header: "DISTRICT (PRES)", key: "details.pres_district" },
  { header: "STATE (PRES)", key: "details.pres_state" },
  { header: "PHYSICAL DISABILITY", key: "details.physical_disability" },
  { header: "STUDY GAP", key: "details.study_gap" },
  { header: "GAP YEARS", key: "details.study_gap_years" },
  { header: "GAP PERIOD", key: "details.study_gap_period" },
  { header: "GAP REASON", key: "details.study_gap_reason" },
  { header: "WORK EXPERIENCE", key: "details.work_experience" },
  { header: "WORK EXPERIENCE MENTION", key: "details.work_experience_mention" },
  { header: "DECLARATION", key: "agree" }
];

export default function GridModeOverlay({ submissions, onClose }: { submissions: any[], onClose: () => void }) {
  
  // Helper to extract nested values safely
  const getValue = (obj: any, path: string) => {
    if (path === 'sl_no') return ''; // handled in map
    if (path === 'agree') return 'AGREE';
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return '';
      current = current[part];
    }
    return current;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col w-full h-full">
      {/* Top Bar */}
      <div className="bg-black text-white px-4 py-2 flex justify-between items-center shrink-0 border-b-4 border-[var(--ink-pink)]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold bg-[var(--ink-pink)] text-black px-2 py-0.5">MASTER GRID MODE</span>
          <span className="font-bold uppercase text-xs">Viewing {submissions.length} Records • 86 Columns</span>
        </div>
        <button 
          onClick={onClose}
          className="flex items-center gap-1 bg-white text-black font-bold uppercase px-3 py-1 text-xs border-2 border-white hover:bg-[var(--ink-yellow)] hover:border-[var(--ink-yellow)] transition-colors"
        >
          <X className="w-4 h-4" /> CLOSE GRID
        </button>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <table className="w-max border-collapse font-mono text-[11px]">
          <thead className="sticky top-0 z-50">
            <tr>
              {EXCEL_COLUMNS.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`
                    bg-[var(--ink-blue)] text-white border border-gray-400 p-2 text-center uppercase whitespace-pre-wrap min-w-[120px]
                    ${col.sticky ? 'sticky left-0 z-50 outline outline-1 outline-gray-400' : ''}
                  `}
                  style={col.sticky ? { left: idx === 0 ? 0 : idx === 1 ? '60px' : idx === 2 ? '160px' : '310px' } : {}}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {submissions.map((student, sIdx) => (
              <tr key={sIdx} className="hover:bg-yellow-50 bg-white">
                {EXCEL_COLUMNS.map((col, cIdx) => {
                  let val = getValue(student, col.key);
                  if (col.key === 'sl_no') val = sIdx + 1;
                  
                  // Handle empty state explicitly to avoid "NA" if not wanted
                  const displayVal = (val === null || val === undefined || val === '') ? '' : val;

                  return (
                    <td 
                      key={cIdx} 
                      className={`
                        border border-gray-300 p-2 align-middle text-center break-words
                        ${col.sticky ? 'sticky left-0 z-40 bg-gray-50 font-bold border-r-gray-400' : ''}
                      `}
                      style={col.sticky ? { left: cIdx === 0 ? 0 : cIdx === 1 ? '60px' : cIdx === 2 ? '160px' : '310px' } : {}}
                    >
                      {col.type === 'link' && displayVal ? (
                        <a 
                          href={displayVal.toString().startsWith('http') ? displayVal : `https://${displayVal}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="text-blue-600 underline flex items-center justify-center gap-1 hover:text-pink-600"
                        >
                          Link <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        displayVal
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={EXCEL_COLUMNS.length} className="text-center py-8 font-bold text-gray-500">
                  NO DATA FOUND
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ShieldAlert, FileText, CheckSquare, 
  HelpCircle, UserCheck, Eye, Compass, Award, AlertOctagon 
} from 'lucide-react';

export default function RulesPage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full gap-6 relative overflow-hidden">
      
      {/* Blueprint Grid Lines Background Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#12121206_1px,transparent_1px),linear-gradient(to_bottom,#12121206_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

      {/* Header Banner */}
      <div className="border-[var(--border-width)] border-[var(--ink-black)] bg-[var(--ink-pink)] text-white shadow-[5px_5px_0px_var(--ink-black)] flex flex-col md:flex-row justify-between items-center gap-6 p-6 relative">
        <div className="flex flex-col gap-1 z-10 text-center md:text-left">
          <span className="riso-badge riso-badge-yellow text-[var(--ink-black)] font-black border-2 shadow-[2px_2px_0px_#121212] uppercase text-[10px]">
            Official Placement Bulletin
          </span>
          <h1 className="text-3xl font-black tracking-tight leading-none uppercase mt-2">
            Placement Rules & Regulations
          </h1>
          <p className="font-mono text-[10px] opacity-90 uppercase tracking-wider font-bold">
            CSE-AIML Passing Batch of 2027 • Techno Main Salt Lake
          </p>
        </div>
        <button 
          onClick={() => router.back()}
          className="riso-btn riso-btn-secondary text-xs py-2 px-4 shadow-[2px_2px_0px_#121212] flex items-center gap-1 z-10 font-bold hover:bg-gray-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      {/* Critical Alert Warning */}
      <div className="bg-red-50 border-2 border-red-500 text-red-700 p-4 flex gap-3 shadow-[4px_4px_0px_#ef4444]">
        <AlertOctagon className="w-6 h-6 flex-shrink-0 text-red-600 mt-0.5" />
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-black uppercase tracking-wider">
            CRITICAL DISCIPLINARY COMPLIANCE
          </h3>
          <p className="text-xs font-semibold leading-relaxed">
            All students are bound by these rules. Any violation of the double-placement restrictions or official protocols will result in the immediate holding of your degree or revocation of college placement support.
          </p>
        </div>
      </div>

      {/* Rules Sections */}
      <div className="flex flex-col gap-6">

        {/* Section 1: Double Placement & Selection Rules */}
        <div className="riso-card flex flex-col gap-4 bg-white">
          <h2 className="text-lg font-black text-[var(--ink-blue)] flex items-center gap-2 border-b-2 border-dashed border-gray-200 pb-2">
            <ShieldAlert className="w-5 h-5 text-[var(--ink-pink)]" /> 1. Double Placement & Selection Protocol
          </h2>
          <ul className="text-xs font-semibold text-gray-700 flex flex-col gap-3 leading-relaxed">
            <li className="flex items-start gap-2 bg-yellow-50 p-2.5 border border-dashed border-amber-300">
              <span className="text-[var(--ink-pink)] font-black text-sm">A.</span>
              <span>
                <strong>The Selection Rule:</strong> The moment you receive a positive result (you are selected for a company), <strong>you are strictly prohibited from sitting for any subsequent company interviews.</strong> You must inform the placement coordinator immediately to withdraw from other active processes.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-pink)] font-black text-sm">B.</span>
              <span>
                <strong>Violation Penalty:</strong> If you break the double-placement rules (e.g. secretly sitting for a second interview after being selected), <strong>you will not receive your B.Tech Degree</strong> from the college.
              </span>
            </li>
            <li className="flex items-start gap-2 bg-blue-50 p-2.5 border border-dashed border-blue-300">
              <span className="text-[var(--ink-blue)] font-black text-sm">C.</span>
              <span>
                <strong>The Ongoing Interview Exception:</strong> An exception is granted only if your interview with the second company has <strong>already started</strong> (e.g. began at 10 AM) before you received the official selection result of the first company.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-pink)] font-black text-sm">D.</span>
              <span>
                <strong>Dream Slot Policy:</strong> Sometimes, the college may declare a specific drive as a "Dream Slot". Only in this scenario are selected candidates permitted to apply. Unless clearly specified as a Dream Slot by placement coordinators, standard rules apply.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-pink)] font-black text-sm">E.</span>
              <span>
                <strong>Patience Compliance:</strong> Interview processes are governed by the companies. Candidates must be prepared to wait. It is common to be called at 10:00 AM and have the interview happen at 8:00 PM.
              </span>
            </li>
          </ul>
        </div>

        {/* Section 2: Registration, Mail Format & Data Standards */}
        <div className="riso-card flex flex-col gap-4 bg-white shadow-[5px_5px_0px_var(--ink-yellow)]">
          <h2 className="text-lg font-black text-[var(--ink-blue)] flex items-center gap-2 border-b-2 border-dashed border-gray-200 pb-2">
            <FileText className="w-5 h-5 text-[var(--ink-yellow)]" /> 2. Registration & Data Standards
          </h2>
          <ul className="text-xs font-semibold text-gray-700 flex flex-col gap-3 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-pink)] font-black text-sm">A.</span>
              <span>
                <strong>Official Email Format (Roll then Name):</strong> All students must register using the format: <br />
                <code className="font-mono text-xs font-black text-[var(--ink-pink)] bg-pink-50 border border-dashed border-[var(--ink-pink)] px-2 py-0.5 inline-block mt-1">
                  tmsl.aiml27.&lt;last_3_digits_of_roll&gt;&lt;firstname&gt;@gmail.com
                </code><br />
                <span className="text-[10px] text-gray-500 font-mono block mt-1">
                  Example: tmsl.aiml27.001firstname@gmail.com
                </span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-pink)] font-black text-sm">B.</span>
              <span>
                <strong>Strict Academic Percentages:</strong> Absolutely <strong>NO rounding off</strong> is allowed. E.g., a score of 59.99% must be entered exactly as 59.99% and is not equal to 60.00%.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-pink)] font-black text-sm">C.</span>
              <span>
                <strong>Academic Definitions Explained:</strong>
                <ul className="list-disc pl-4 mt-2 flex flex-col gap-2.5 text-[11px]">
                  <li>
                    <strong>Actual Marks (Strict Math Aggregate):</strong> 
                    <span className="block text-gray-500 mt-0.5">
                      This must include <strong>all subjects/papers</strong> you took, without excluding any optional, elective, or extra papers. 
                      <br />
                      <em>Formula:</em> <code>(Sum of obtained marks in all papers) &divide; (Total maximum marks of all papers combined) &times; 100</code>.
                      <br />
                      <em>Example:</em> If you took 6 papers of 100 marks each (total 600) and scored 500 in total, your Actual Marks is <code>(500 &divide; 600) &times; 100 = 83.33%</code>.
                    </span>
                  </li>
                  <li>
                    <strong>Standard Marks (Board-Specific Percentages):</strong> 
                    <span className="block text-gray-500 mt-0.5">
                      This is the percentage aggregate calculated <strong>strictly according to your school board's official policy</strong> (e.g. ICSE, CBSE, WBCHSE) for ranking or final marksheet aggregates.
                      <br />
                      <em>Example (Best of 5):</em> If your board calculates your final class XII percentage using the <strong>"Best of 5"</strong> subjects, you must compute your Standard Marks using only those 5 subjects (e.g., if you obtained 450 out of 500 in your best 5 subjects, your Standard Marks is <code>(450 &divide; 500) &times; 100 = 90.00%</code>).
                    </span>
                  </li>
                </ul>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-pink)] font-black text-sm">D.</span>
              <span>
                <strong>Quota Admissions:</strong> Students admitted via Direct Admission or Management Quota must still provide their competitive ranks (e.g., WBJEE/JEE) during registration.
              </span>
            </li>
            <li className="flex items-start gap-2 bg-amber-50 p-2.5 border border-dashed border-amber-300">
              <span className="text-[var(--ink-pink)] font-black text-sm">E.</span>
              <span>
                <strong>Master Database Launch:</strong> The department will officially start collecting Placement Master Database entries in a few days. Please ensure all personal, school, and B.Tech data parameters are prepared.
              </span>
            </li>
          </ul>
        </div>

        {/* Section 3: Professional Building & Interview Grooming */}
        <div className="riso-card flex flex-col gap-4 bg-white">
          <h2 className="text-lg font-black text-[var(--ink-blue)] flex items-center gap-2 border-b-2 border-dashed border-gray-200 pb-2">
            <UserCheck className="w-5 h-5 text-[var(--ink-green)]" /> 3. CV Building & Interview Grooming
          </h2>
          <ul className="text-xs font-semibold text-gray-700 flex flex-col gap-3 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-pink)] font-black text-sm">A.</span>
              <span>
                <strong>Resume/CV Building:</strong> A professional CV must be created. For building, you can choose to use LaTeX templates on platforms like <strong>Overleaf.com</strong>, or other professional CV building tools.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-pink)] font-black text-sm">B.</span>
              <span>
                <strong>CV Keywords Shortlisting:</strong> Initial recruitment screening is highly automated. Recruiters filter candidates based on: 10th Marks, 12th Marks, B.Tech CGPA, and specific keywords matching the job description.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-pink)] font-black text-sm">C.</span>
              <span>
                <strong>Mandatory Formals Code:</strong> Candidates must attend interviews in full business formals. Grooming extends to proper, well-matched formal shoes. Improper footwear or casual items will result in immediate disqualification.
              </span>
            </li>
          </ul>
        </div>

        {/* Section 4: PPO, Internship & Post-Placement Policies */}
        <div className="riso-card flex flex-col gap-4 bg-white shadow-[5px_5px_0px_var(--ink-pink)]">
          <h2 className="text-lg font-black text-[var(--ink-blue)] flex items-center gap-2 border-b-2 border-dashed border-gray-200 pb-2">
            <Award className="w-5 h-5 text-[var(--ink-pink)]" /> 4. PPO, Internship & Post-Placement Policies
          </h2>
          <ul className="text-xs font-semibold text-gray-700 flex flex-col gap-3 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-pink)] font-black text-sm">A.</span>
              <span>
                <strong>Internship Exclusion:</strong> Candidates who receive internship-only offers (e.g. Amazon summer internships) will <strong>not</strong> be blocked from sitting in subsequent campus recruitment drives.
              </span>
            </li>
            <li className="flex items-start gap-2 bg-red-50 p-2 border border-dashed border-red-300 text-red-900">
              <span className="font-black text-sm">B.</span>
              <span>
                <strong>PPO Block Policy:</strong> Candidates who secure an Internship + Pre-Placement Offer (PPO) package, or a direct PPO with compensation <strong>greater than or equal to 3.0 LPA</strong>, will be blocked from future placement drives.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-pink)] font-black text-sm">C.</span>
              <span>
                <strong>Post-PPO Performance:</strong> If a student underperforms or shows poor academic commitment after securing a PPO, specific study/reference materials will be withheld. Continued negligence will result in the college reporting to the company, leading to offer revocation.
              </span>
            </li>
            <li className="flex items-start gap-2 bg-green-50 p-2 border border-dashed border-green-300 text-green-900">
              <span className="font-black text-sm">D.</span>
              <span>
                <strong>Graduated / Unplaced Support:</strong> If a student exits or passes out of college without receiving a placement offer and a company subsequently requests candidates from this batch, they will be actively notified and informed to appear for the recruitment process.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ink-pink)] font-black text-sm">E.</span>
              <span>
                <strong>Cooling Period Policy:</strong> Cooling periods are defined entirely by the recruiting company (different companies have different cooling period policies). During registration, all candidates must check if the company has a cooling period and verify their status.
              </span>
            </li>
          </ul>
        </div>

      </div>

      {/* Acknowledgment Footer Card */}
      <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#121212] flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-xs font-black uppercase text-gray-800">Department Coordinator Handshake</p>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5">CSE-AIML Placement Regulations System • Portal Version 3.2</p>
        </div>
        <button 
          onClick={() => router.back()}
          className="riso-btn riso-btn-pink text-xs font-black py-2.5 px-6 shadow-[3px_3px_0px_#121212] uppercase"
        >
          Acknowledge & Back
        </button>
      </div>

      {/* Footer Info */}
      <div className="text-center mt-2 pb-6">
        <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">
          © 2026 Techno Main Salt Lake • CSE AIML Department Placements
        </p>
      </div>

    </div>
  );
}

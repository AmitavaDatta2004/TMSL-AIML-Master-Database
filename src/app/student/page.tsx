'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers';
import { 
  User, BookOpen, GraduationCap, Users, MapPin, 
  AlertTriangle, Save, CheckCircle2, ChevronRight, 
  ChevronLeft, Sparkles, LogOut, ArrowLeft, FileText 
} from 'lucide-react';

// Default schema structure matching the 75 Excel columns exactly
const INITIAL_FORM_STATE = {
  // Section 1: General & Contact
  stream: 'CSE-AIML',
  roll_number: '',
  full_name: '',
  first_middle_name: '',
  last_name: '',
  photo_pdf_link: '',
  gender: 'MALE',
  dob: '',
  blood_group: '',
  contact_residence: '',
  contact_operational_1: '',
  contact_operational_2: '',
  email_operational_gmail: '',
  email_secondary: '',
  linkedin_link: '',
  github_link: '',

  // Section 2: Class X
  class_x_exam_name: 'WBBSE',
  class_x_pass_year: '',
  class_x_board: '',
  class_x_school: '',
  class_x_medium: 'ENG',
  class_x_std_marks_pct: '',
  class_x_actual_pct: '',
  class_x_math_pct: '',
  class_x_science_pct: '',
  class_x_comp_app_pct: 'N.A.',

  // Section 3: Class XII
  class_xii_exam_name: 'W.B.C.H.S.E',
  class_xii_pass_year: '',
  class_xii_board: '',
  class_xii_school: '',
  class_xii_medium: 'ENG',
  class_xii_std_marks_pct: '',
  class_xii_actual_pct: '',
  class_xii_math_pct: '',
  class_xii_physics_pct: '',
  class_xii_chemistry_pct: '',

  // Section 4: Diploma & Entrance
  diploma_exam_name: 'JELET',
  diploma_rank: 'N.A.',
  diploma_stream: 'N.A.',
  diploma_pass_year: 'N.A.',
  diploma_college: 'N.A.',
  diploma_university: 'N.A.',
  diploma_pct: 'N.A.',
  entrance_exam_name: 'WBJEE',
  entrance_exam_rank: '',

  // Section 5: B.Tech Details
  university_reg_no: '',
  btech_stream: 'CSE-AIML',
  btech_course_duration: '2023-2027',
  sem_1_cgpa: '',
  sem_2_cgpa: '',
  sem_3_cgpa: '',
  sem_4_cgpa: '',
  sem_5_cgpa: '',
  btech_avg_cgpa: '',
  btech_backlog: 'NO',
  btech_backlog_count: '0',
  btech_backlog_subject_1: 'N.A.',
  btech_backlog_subject_2: 'N.A.',

  // Section 6: Family Details
  father_name: '',
  father_occupation: '',
  mother_name: '',
  mother_occupation: '',
  guardian_name: 'N.A.',
  guardian_relation: 'N.A.',
  guardian_occupation: 'N.A.',

  // Section 7: Addresses
  perm_address: '',
  perm_post_office: '',
  perm_city: '',
  perm_pin: '',
  perm_district: '',
  perm_state: 'WEST BENGAL',
  
  pres_address: '',
  pres_post_office: '',
  pres_city: '',
  pres_pin: '',
  pres_district: '',
  pres_state: 'WEST BENGAL',

  // Section 8: Gaps & Declaration
  physical_disability: 'NO',
  study_gap: 'NO',
  study_gap_years: '0',
  study_gap_period: 'N.A.',
  study_gap_reason: 'N.A.',
  work_experience: 'NO',
  work_experience_mention: 'N.A.',
  declaration_agree: 'NO'
};

export default function StudentDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [dbLoading, setDbLoading] = useState(true);
  const [viewWizard, setViewWizard] = useState(false);

  // Redirect if unauthorized
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Load student draft record from DB on mount
  useEffect(() => {
    if (!user) return;
    const email = user.email;
    const name = user.name;
    
    async function fetchDraft() {
      try {
        const res = await fetch(`/api/student/fetch-details?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.record && data.record.details) {
            setFormState(prev => ({
              ...prev,
              ...data.record.details,
              // Force Google Email into the primary operational email field (read-only constraint)
              email_operational_gmail: email,
              full_name: data.record.full_name || prev.full_name,
              roll_number: data.record.roll_number || prev.roll_number,
              stream: data.record.stream || prev.stream,
            }));
          } else {
            // First time student: Pre-fill Google details
            setFormState(prev => ({
              ...prev,
              email_operational_gmail: email,
              full_name: name || '',
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load submission draft:", err);
      } finally {
        setDbLoading(false);
      }
    }
    fetchDraft();
  }, [user]);

  // Form value change handler
  const handleInputChange = (field: keyof typeof INITIAL_FORM_STATE, value: string) => {
    setFormState(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-compute Average CGPA if Semester CGPAs are modified
      if (
        field === 'sem_1_cgpa' || 
        field === 'sem_2_cgpa' || 
        field === 'sem_3_cgpa' || 
        field === 'sem_4_cgpa' || 
        field === 'sem_5_cgpa'
      ) {
        const cgpas = [
          parseFloat(updated.sem_1_cgpa),
          parseFloat(updated.sem_2_cgpa),
          parseFloat(updated.sem_3_cgpa),
          parseFloat(updated.sem_4_cgpa),
          parseFloat(updated.sem_5_cgpa)
        ].filter(v => !isNaN(v));
        
        if (cgpas.length > 0) {
          const avg = (cgpas.reduce((a, b) => a + b, 0) / cgpas.length).toFixed(2);
          updated.btech_avg_cgpa = avg;
        } else {
          updated.btech_avg_cgpa = '';
        }
      }
      
      return updated;
    });
  };

  // Helper to copy Permanent Address to Present Address
  const copyPermanentAddress = () => {
    setFormState(prev => ({
      ...prev,
      pres_address: prev.perm_address,
      pres_post_office: prev.perm_post_office,
      pres_city: prev.perm_city,
      pres_pin: prev.perm_pin,
      pres_district: prev.perm_district,
      pres_state: prev.perm_state,
    }));
  };

  // Form Submission/Save Draft handler
  const handleSaveForm = async (isFinalSubmit: boolean = false) => {
    if (!user) return;
    
    // Validations for Final Submission
    if (isFinalSubmit) {
      if (!formState.roll_number.trim()) {
        alert("University Roll Number is required!");
        return;
      }
      if (!formState.full_name.trim()) {
        alert("Student's Full Name is required!");
        return;
      }
      if (!formState.photo_pdf_link.trim()) {
        alert("Formal Photo PDF Upload Link is required!");
        return;
      }
      if (formState.declaration_agree !== 'YES') {
        alert("You must agree to the Declaration to submit final details.");
        return;
      }
    }

    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/student/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          full_name: formState.full_name,
          roll_number: formState.roll_number,
          stream: formState.stream,
          details: formState,
          is_final: isFinalSubmit
        }),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const errData = await response.json();
        throw new Error(errData.error || "Submission failed");
      }
    } catch (err: any) {
      console.error("Save failed:", err);
      setSaveStatus('error');
      setErrorMessage(err.message || "Failed to persist database record.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { label: "1. Identity", icon: User },
    { label: "2. Schooling", icon: BookOpen },
    { label: "3. Diploma & Entrance", icon: GraduationCap },
    { label: "4. B.Tech Perf.", icon: GraduationCap },
    { label: "5. Address Blocks", icon: MapPin },
    { label: "6. Family Detail", icon: Users },
    { label: "7. Gaps & Decl.", icon: AlertTriangle }
  ];

  if (authLoading || dbLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--bg-paper)]">
        <div className="riso-card riso-card-blue bg-white flex flex-col items-center gap-4 py-8 px-12">
          <div className="w-8 h-8 border-4 border-t-[var(--ink-blue)] border-black rounded-full animate-spin"></div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--ink-blue)]">
            RETRIEVING PROFILE SCHEMA...
          </span>
        </div>
      </div>
    );
  }

  if (!viewWizard) {
    return (
      <div className="flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full gap-6">
        {/* A. Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-[var(--ink-black)] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="riso-badge riso-badge-blue text-white font-bold">STUDENT CONSOLE</span>
              <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">
                Academic Master Database
              </span>
            </div>
            <h2 className="text-4xl font-black text-[var(--ink-black)] mt-2 uppercase tracking-tight">
              STUDENT PROFILE DOSSIER
            </h2>
          </div>
          
          <div className="flex gap-2">
            <a 
              href="/rules"
              className="riso-btn riso-btn-yellow text-xs shadow-[2px_2px_0px_#121212] flex items-center gap-1.5 font-bold"
            >
              <FileText className="w-3.5 h-3.5" /> PLACEMENT RULES
            </a>
            <button 
              onClick={logout}
              className="riso-btn riso-btn-danger text-xs shadow-[2px_2px_0px_#121212] flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> SIGN OUT
            </button>
          </div>
        </div>

        {/* B. Overview Stats & Submission status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Submission Status Card */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Status Alert Banner */}
            {formState.declaration_agree === 'YES' ? (
              <div className="riso-card bg-green-50 border-[var(--ink-green)] text-[var(--ink-green)] flex flex-col gap-3 shadow-[4px_4px_0px_var(--ink-green)]">
                <div className="flex items-center gap-2.5">
                  <div className="bg-[var(--ink-green)] text-white p-1 border border-black">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    SUBMISSION STATUS: FINALIZED & LOCKED
                  </h3>
                </div>
                <p className="text-xs font-semibold text-gray-700 leading-relaxed">
                  Your Master Database entry has been successfully locked and submitted to the department. Your details are frozen for placement sheet generation. If you need to revise any data, please contact your department coordinator.
                </p>
              </div>
            ) : (
              <div className="riso-card bg-amber-50 border-amber-500 text-amber-600 flex flex-col gap-3 shadow-[4px_4px_0px_#d97706]">
                <div className="flex items-center gap-2.5">
                  <div className="bg-amber-500 text-white p-1 border border-black">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    SUBMISSION STATUS: DRAFT (PENDING ACTION)
                  </h3>
                </div>
                <p className="text-xs font-semibold text-gray-700 leading-relaxed">
                  Your placement profile is currently in **Draft** state. You have not submitted the final declaration yet. Please click the button below to fill out the 86 required academic and personal parameters before the final lock.
                </p>
              </div>
            )}

            {/* Dossier Information Card */}
            <div className="riso-card flex flex-col gap-4">
              <h3 className="font-black text-sm uppercase text-[var(--ink-blue)] flex items-center gap-2">
                <User className="w-4 h-4" /> Account Credentials
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-[var(--ink-black)] border-dashed p-3">
                  <p className="font-mono text-[9px] uppercase text-gray-400 font-bold">Registered Student Name</p>
                  <p className="text-sm font-black uppercase text-[var(--ink-black)] mt-0.5">
                    {formState.full_name || user?.name || "Pending Entry"}
                  </p>
                </div>
                
                <div className="border border-[var(--ink-black)] border-dashed p-3">
                  <p className="font-mono text-[9px] uppercase text-gray-400 font-bold">Authenticated Google Email</p>
                  <p className="text-sm font-black text-gray-700 mt-0.5 flex items-center gap-1.5">
                    {user?.email} <span className="text-[10px] riso-badge riso-badge-blue text-white scale-90 py-0 px-1 font-mono">SECURE</span>
                  </p>
                </div>

                <div className="border border-[var(--ink-black)] border-dashed p-3">
                  <p className="font-mono text-[9px] uppercase text-gray-400 font-bold">University Roll Number</p>
                  <p className="text-sm font-black uppercase mt-0.5">
                    {formState.roll_number ? (
                      <span className="text-[var(--ink-black)]">{formState.roll_number}</span>
                    ) : (
                      <span className="text-[var(--ink-pink)] bg-pink-50 px-1.5 border border-dashed border-[var(--ink-pink)] text-xs font-bold font-mono">[ ENTRY PENDING ]</span>
                    )}
                  </p>
                </div>

                <div className="border border-[var(--ink-black)] border-dashed p-3">
                  <p className="font-mono text-[9px] uppercase text-gray-400 font-bold">Academic Stream</p>
                  <p className="text-sm font-black uppercase text-[var(--ink-black)] mt-0.5">
                    {formState.stream || "CSE-AIML"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => setViewWizard(true)}
                  className="riso-btn riso-btn-pink w-full justify-center py-3 text-sm font-black shadow-[3px_3px_0px_#121212]"
                >
                  {formState.declaration_agree === 'YES' ? "VIEW / EDIT MY DATA DETAILS" : "ENTER DATABASE WIZARD FORM"}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Official Guidelines */}
          <div className="flex flex-col gap-6">
            
            {/* Quick Metrics */}
            <div className="riso-card riso-card-pink flex flex-col gap-3">
              <h3 className="font-black text-xs uppercase text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--ink-yellow)]" /> Academic Snapshot
              </h3>
              
              <div className="bg-white text-[var(--ink-black)] p-3 border border-black shadow-[2px_2px_0px_#121212] flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs font-semibold border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 uppercase font-mono text-[10px]">Average CGPA</span>
                  <span className="font-bold">{formState.btech_avg_cgpa || "N.A."}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 uppercase font-mono text-[10px]">Class X Pct</span>
                  <span className="font-bold">{formState.class_x_actual_pct || "N.A."}%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 uppercase font-mono text-[10px]">Class XII Pct</span>
                  <span className="font-bold">{formState.class_xii_actual_pct || "N.A."}%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 uppercase font-mono text-[10px]">Backlog Active</span>
                  <span className={`font-mono font-bold text-[10px] px-1 border border-black ${formState.btech_backlog === 'YES' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {formState.btech_backlog}
                  </span>
                </div>
              </div>
            </div>

            {/* Instruction Checklist */}
            <div className="riso-card riso-card-yellow flex flex-col gap-3">
              <h3 className="font-black text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[var(--ink-blue)]" /> OFFICIAL GUIDELINES
              </h3>
              <ul className="text-[10px] font-semibold text-gray-700 flex flex-col gap-2.5 leading-snug">
                <li className="flex items-start gap-1.5">
                  <span className="text-[var(--ink-pink)] font-bold font-mono">1.</span>
                  Ensure you possess the PDF link of your updated formal passport-sized photograph.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[var(--ink-pink)] font-bold font-mono">2.</span>
                  Enter accurate semester-wise CGPA up to the 5th semester exactly as per results.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[var(--ink-pink)] font-bold font-mono">3.</span>
                  Provide standard marks percentages (Class X & XII) without inserting the "%" sign.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[var(--ink-pink)] font-bold font-mono">4.</span>
                  Review backlogs carefully. Enter YES and detail the subject codes if active.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 border-t border-dashed border-gray-300 pt-6">
          <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">
            Techno Main Salt Lake • CSE AIML Department placement database
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full gap-6">
      
      {/* A. Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-[var(--ink-black)] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="riso-badge riso-badge-blue text-white">STUDENT SECTION</span>
            <span className="riso-badge riso-badge-yellow text-black font-mono">
              {formState.declaration_agree === 'YES' ? "SUBMITTED" : "DRAFT STATE"}
            </span>
          </div>
          <h2 className="text-3xl font-black text-[var(--ink-black)] mt-2 uppercase tracking-tight">
            PLACEMENT DATABASE RECORD WIZARD
          </h2>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-1">
            Student: <span className="font-bold text-black">{user?.name}</span> • Connected: <span className="font-bold text-black">{user?.email}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setViewWizard(false)}
            className="riso-btn riso-btn-secondary text-xs shadow-[2px_2px_0px_#121212] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> BACK TO DOSSIER
          </button>
          <button 
            onClick={() => handleSaveForm(false)}
            disabled={isSaving}
            className="riso-btn riso-btn-secondary text-xs shadow-[2px_2px_0px_#121212] hover:shadow-[1px_1px_0px_#121212]"
          >
            <Save className="w-4 h-4" /> {isSaving ? "SAVING..." : "SAVE DRAFT"}
          </button>
          <button 
            onClick={logout}
            className="riso-btn riso-btn-danger text-xs shadow-[2px_2px_0px_#121212] flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> SIGN OUT
          </button>
        </div>
      </div>

      {/* Save Draft Action Toast */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border-2 border-[var(--ink-green)] text-[var(--ink-green)] p-3 text-xs font-bold font-mono shadow-[3px_3px_0px_var(--ink-green)] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> SUCCESS: DRAFT PERSISTED SECURELY IN NEON DATABASE!
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="bg-red-50 border-2 border-red-500 text-red-700 p-3 text-xs font-bold font-mono shadow-[3px_3px_0px_red]">
          ⚠️ ERROR: {errorMessage}
        </div>
      )}

      {/* B. Dense Wizard Tabs Navigation */}
      <div className="flex overflow-x-auto border-b-2 border-[var(--ink-black)] gap-1 scrollbar-thin">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-2 riso-step-tab whitespace-nowrap text-xs font-bold py-2.5 px-4 border-b-0 ${
                activeTab === idx ? 'active' : ''
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* C. Dense Form Area */}
      <div className="riso-card bg-white p-6 md:p-8 flex flex-col gap-6">
        
        {/* TAB 1: IDENTITY & CONTACT */}
        {activeTab === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <h3 className="md:col-span-3 font-black text-lg text-[var(--ink-pink)] border-b pb-2 mb-2 uppercase tracking-wide">
              SECTION 1: PERSONAL IDENTITY & CONTACT
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Academic Stream *</label>
              <select 
                value={formState.stream} 
                onChange={(e) => handleInputChange('stream', e.target.value)}
                className="riso-select"
              >
                <option value="CSE-AIML">CSE-AIML (B.TECH)</option>
                <option value="CSE">CSE (B.TECH)</option>
                <option value="IT">IT (B.TECH)</option>
                <option value="CSBS">CSBS (B.TECH)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">University Roll Number (11-digit) *</label>
              <input 
                type="text" 
                maxLength={11}
                value={formState.roll_number} 
                onChange={(e) => handleInputChange('roll_number', e.target.value)}
                className="riso-input"
                placeholder="Ex: 13000223045"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Full Student Name (As per University) *</label>
              <input 
                type="text" 
                value={formState.full_name} 
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="riso-input"
                placeholder="Ex: BISWAJIT DEBNATH"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">First & Middle Name *</label>
              <input 
                type="text" 
                value={formState.first_middle_name} 
                onChange={(e) => handleInputChange('first_middle_name', e.target.value)}
                className="riso-input"
                placeholder="Ex: BISWAJIT"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Last Name *</label>
              <input 
                type="text" 
                value={formState.last_name} 
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="riso-input"
                placeholder="Ex: DEBNATH"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Formal Photo PDF Upload Link *</label>
              <input 
                type="url" 
                value={formState.photo_pdf_link} 
                onChange={(e) => handleInputChange('photo_pdf_link', e.target.value)}
                className="riso-input"
                placeholder="G-Drive / Cloud PDF URL Link"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Gender *</label>
              <select 
                value={formState.gender} 
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="riso-select"
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Date of Birth (DD-MM-YYYY) *</label>
              <input 
                type="text" 
                value={formState.dob} 
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className="riso-input"
                placeholder="Ex: 14-08-2005"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Blood Group *</label>
              <input 
                type="text" 
                value={formState.blood_group} 
                onChange={(e) => handleInputChange('blood_group', e.target.value)}
                className="riso-input"
                placeholder="Ex: O+ / AB-"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Contact Operational 1 (Unalterable) *</label>
              <input 
                type="text" 
                maxLength={10}
                value={formState.contact_operational_1} 
                onChange={(e) => handleInputChange('contact_operational_1', e.target.value)}
                className="riso-input"
                placeholder="10 DIGIT MOB"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Contact Operational 2 (Optional)</label>
              <input 
                type="text" 
                maxLength={10}
                value={formState.contact_operational_2} 
                onChange={(e) => handleInputChange('contact_operational_2', e.target.value)}
                className="riso-input"
                placeholder="10 DIGIT SECONDARY MOB"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Contact Residence (Landline/Mob)</label>
              <input 
                type="text" 
                value={formState.contact_residence} 
                onChange={(e) => handleInputChange('contact_residence', e.target.value)}
                className="riso-input"
                placeholder="Residence Number"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Primary Email (Google Auth Bound) *</label>
              <input 
                type="email" 
                value={formState.email_operational_gmail} 
                disabled
                className="riso-input bg-gray-100 cursor-not-allowed opacity-80"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Secondary Email Address</label>
              <input 
                type="email" 
                value={formState.email_secondary} 
                onChange={(e) => handleInputChange('email_secondary', e.target.value)}
                className="riso-input"
                placeholder="Ex: abc@gmail.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">LinkedIn Profile URL *</label>
              <input 
                type="url" 
                value={formState.linkedin_link} 
                onChange={(e) => handleInputChange('linkedin_link', e.target.value)}
                className="riso-input"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">GitHub Account URL *</label>
              <input 
                type="url" 
                value={formState.github_link} 
                onChange={(e) => handleInputChange('github_link', e.target.value)}
                className="riso-input"
                placeholder="https://github.com/username"
              />
            </div>
          </div>
        )}

        {/* TAB 2: SCHOOLING */}
        {activeTab === 1 && (
          <div className="flex flex-col gap-8">
            {/* Class X */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <h3 className="md:col-span-3 font-black text-lg text-[var(--ink-blue)] border-b pb-2 mb-2 uppercase tracking-wide">
                SECTION 2: CLASS X ACADEMICS
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Name of Examination *</label>
                <input 
                  type="text" 
                  value={formState.class_x_exam_name} 
                  onChange={(e) => handleInputChange('class_x_exam_name', e.target.value)}
                  className="riso-input"
                  placeholder="Ex: WBBSE / CBSE / ICSE"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Year of Pass Out *</label>
                <input 
                  type="text" 
                  value={formState.class_x_pass_year} 
                  onChange={(e) => handleInputChange('class_x_pass_year', e.target.value)}
                  className="riso-input"
                  placeholder="Ex: 2021"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Board / Council Name (Abbreviated) *</label>
                <input 
                  type="text" 
                  value={formState.class_x_board} 
                  onChange={(e) => handleInputChange('class_x_board', e.target.value)}
                  className="riso-input"
                  placeholder="Ex: WBBSE / CBSE"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">School Name *</label>
                <input 
                  type="text" 
                  value={formState.class_x_school} 
                  onChange={(e) => handleInputChange('class_x_school', e.target.value)}
                  className="riso-input"
                  placeholder="Full School Name"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Medium of Study *</label>
                <select 
                  value={formState.class_x_medium} 
                  onChange={(e) => handleInputChange('class_x_medium', e.target.value)}
                  className="riso-select"
                >
                  <option value="ENG">ENGLISH</option>
                  <option value="BENG">BENGALI</option>
                  <option value="HINDI">HINDI</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Standard Marks % (No % Sign) *</label>
                <input 
                  type="text" 
                  value={formState.class_x_std_marks_pct} 
                  onChange={(e) => handleInputChange('class_x_std_marks_pct', e.target.value)}
                  className="riso-input"
                  placeholder="Ex: 85.5"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Actual Percentage (Total Marks Calc) *</label>
                <input 
                  type="text" 
                  value={formState.class_x_actual_pct} 
                  onChange={(e) => handleInputChange('class_x_actual_pct', e.target.value)}
                  className="riso-input"
                  placeholder="Ex: 85.43"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Maths Marks % (No % Sign) *</label>
                <input 
                  type="text" 
                  value={formState.class_x_math_pct} 
                  onChange={(e) => handleInputChange('class_x_math_pct', e.target.value)}
                  className="riso-input"
                  placeholder="Ex: 92"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Science Group (Phy+Chem+Bio) % *</label>
                <input 
                  type="text" 
                  value={formState.class_x_science_pct} 
                  onChange={(e) => handleInputChange('class_x_science_pct', e.target.value)}
                  className="riso-input"
                  placeholder="Ex: 88"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Computer Application % (If Any)</label>
                <input 
                  type="text" 
                  value={formState.class_x_comp_app_pct} 
                  onChange={(e) => handleInputChange('class_x_comp_app_pct', e.target.value)}
                  className="riso-input"
                  placeholder="Ex: 96 or N.A."
                />
              </div>
            </div>

            {/* Class XII */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-dashed border-black pt-6">
              <h3 className="md:col-span-3 font-black text-lg text-[var(--ink-blue)] pb-2 mb-2 uppercase tracking-wide">
                SECTION 3: CLASS XII ACADEMICS
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Name of Examination *</label>
                <input 
                  type="text" 
                  value={formState.class_xii_exam_name} 
                  onChange={(e) => handleInputChange('class_xii_exam_name', e.target.value)}
                  className="riso-input"
                  placeholder="Ex: WBCHSE / CBSE / ISC"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Year of Pass Out *</label>
                <input 
                  type="text" 
                  value={formState.class_xii_pass_year} 
                  onChange={(e) => handleInputChange('class_xii_pass_year', e.target.value)}
                  className="riso-input"
                  placeholder="Ex: 2023"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Board / Council Name (Abbreviated) *</label>
                <input 
                  type="text" 
                  value={formState.class_xii_board} 
                  onChange={(e) => handleInputChange('class_xii_board', e.target.value)}
                  className="riso-input"
                  placeholder="Ex: W.B.C.H.S.E / CBSE"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">School Name *</label>
                <input 
                  type="text" 
                  value={formState.class_xii_school} 
                  onChange={(e) => handleInputChange('class_xii_school', e.target.value)}
                  className="riso-input"
                  placeholder="Full School Name"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Medium of Study *</label>
                <select 
                  value={formState.class_xii_medium} 
                  onChange={(e) => handleInputChange('class_xii_medium', e.target.value)}
                  className="riso-select"
                >
                  <option value="ENG">ENGLISH</option>
                  <option value="BENG">BENGALI</option>
                  <option value="HINDI">HINDI</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Standard Marks % (No % Sign) *</label>
                <input 
                  type="text" 
                  value={formState.class_xii_std_marks_pct} 
                  onChange={(e) => handleInputChange('class_xii_std_marks_pct', e.target.value)}
                  className="riso-input"
                  placeholder="Ex: 82.2"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Actual Percentage (Total Marks Calc) *</label>
                <input 
                  type="text" 
                  value={formState.class_xii_actual_pct} 
                  onChange={(e) => handleInputChange('class_xii_actual_pct', e.target.value)}
                  className="riso-input"
                  placeholder="Ex: 82.20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Maths Marks % *</label>
                <input 
                  type="text" 
                  value={formState.class_xii_math_pct} 
                  onChange={(e) => handleInputChange('class_xii_math_pct', e.target.value)}
                  className="riso-input"
                  placeholder="Maths Marks"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Physics Marks % *</label>
                <input 
                  type="text" 
                  value={formState.class_xii_physics_pct} 
                  onChange={(e) => handleInputChange('class_xii_physics_pct', e.target.value)}
                  className="riso-input"
                  placeholder="Physics Marks"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Chemistry Marks % *</label>
                <input 
                  type="text" 
                  value={formState.class_xii_chemistry_pct} 
                  onChange={(e) => handleInputChange('class_xii_chemistry_pct', e.target.value)}
                  className="riso-input"
                  placeholder="Chemistry Marks"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DIPLOMA & ENTRANCE */}
        {activeTab === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <h3 className="md:col-span-3 font-black text-lg text-[var(--ink-green)] border-b pb-2 mb-2 uppercase tracking-wide">
              SECTION 4: DIPLOMA & ENTRANCE DETAILS
            </h3>

            <div className="md:col-span-3 bg-yellow-50 border-2 border-[var(--ink-yellow)] p-4 text-xs font-semibold leading-relaxed">
              ⚠️ Note: If you entered B.Tech directly via WBJEE/JEE Mains, fill in the Entrance Exam section and type "N.A." or "0" in the Diploma fields as pre-filled.
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Entrance Exam Name (B.Tech Intake) *</label>
              <input 
                type="text" 
                value={formState.entrance_exam_name} 
                onChange={(e) => handleInputChange('entrance_exam_name', e.target.value)}
                className="riso-input"
                placeholder="Ex: WBJEE / JEE MAIN"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Entrance Exam Rank *</label>
              <input 
                type="text" 
                value={formState.entrance_exam_rank} 
                onChange={(e) => handleInputChange('entrance_exam_rank', e.target.value)}
                className="riso-input"
                placeholder="Ex: 12045"
              />
            </div>

            <div className="md:col-span-3 border-t border-dashed border-black my-2"></div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Diploma Entrance Test Name</label>
              <input 
                type="text" 
                value={formState.diploma_exam_name} 
                onChange={(e) => handleInputChange('diploma_exam_name', e.target.value)}
                className="riso-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Diploma Rank</label>
              <input 
                type="text" 
                value={formState.diploma_rank} 
                onChange={(e) => handleInputChange('diploma_rank', e.target.value)}
                className="riso-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Diploma Stream (Abbreviated)</label>
              <input 
                type="text" 
                value={formState.diploma_stream} 
                onChange={(e) => handleInputChange('diploma_stream', e.target.value)}
                className="riso-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Diploma Year of Passing</label>
              <input 
                type="text" 
                value={formState.diploma_pass_year} 
                onChange={(e) => handleInputChange('diploma_pass_year', e.target.value)}
                className="riso-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Diploma College Name</label>
              <input 
                type="text" 
                value={formState.diploma_college} 
                onChange={(e) => handleInputChange('diploma_college', e.target.value)}
                className="riso-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Diploma University Name</label>
              <input 
                type="text" 
                value={formState.diploma_university} 
                onChange={(e) => handleInputChange('diploma_university', e.target.value)}
                className="riso-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Diploma Final Percentage</label>
              <input 
                type="text" 
                value={formState.diploma_pct} 
                onChange={(e) => handleInputChange('diploma_pct', e.target.value)}
                className="riso-input"
              />
            </div>
          </div>
        )}

        {/* TAB 4: B.TECH PERFORMANCE */}
        {activeTab === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <h3 className="md:col-span-3 font-black text-lg text-[var(--ink-pink)] border-b pb-2 mb-2 uppercase tracking-wide">
              SECTION 5: GRADUATION (B.TECH PERFORMANCE)
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">University Registration No. *</label>
              <input 
                type="text" 
                value={formState.university_reg_no} 
                onChange={(e) => handleInputChange('university_reg_no', e.target.value)}
                className="riso-input"
                placeholder="Ex: 231300100456"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">B.Tech Stream (Exact) *</label>
              <input 
                type="text" 
                value={formState.btech_stream} 
                disabled
                className="riso-input bg-gray-100 cursor-not-allowed opacity-80"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Course Duration Period *</label>
              <input 
                type="text" 
                value={formState.btech_course_duration} 
                onChange={(e) => handleInputChange('btech_course_duration', e.target.value)}
                className="riso-input"
                placeholder="Ex: 2023-2027"
              />
            </div>

            <div className="md:col-span-3 border-t border-dashed border-black my-2"></div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Semester 1 CGPA *</label>
              <input 
                type="text" 
                value={formState.sem_1_cgpa} 
                onChange={(e) => handleInputChange('sem_1_cgpa', e.target.value)}
                className="riso-input"
                placeholder="Ex: 8.65"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Semester 2 CGPA *</label>
              <input 
                type="text" 
                value={formState.sem_2_cgpa} 
                onChange={(e) => handleInputChange('sem_2_cgpa', e.target.value)}
                className="riso-input"
                placeholder="Ex: 8.42"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Semester 3 CGPA *</label>
              <input 
                type="text" 
                value={formState.sem_3_cgpa} 
                onChange={(e) => handleInputChange('sem_3_cgpa', e.target.value)}
                className="riso-input"
                placeholder="Ex: 8.90"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Semester 4 CGPA *</label>
              <input 
                type="text" 
                value={formState.sem_4_cgpa} 
                onChange={(e) => handleInputChange('sem_4_cgpa', e.target.value)}
                className="riso-input"
                placeholder="Ex: 8.81"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Semester 5 CGPA *</label>
              <input 
                type="text" 
                value={formState.sem_5_cgpa} 
                onChange={(e) => handleInputChange('sem_5_cgpa', e.target.value)}
                className="riso-input"
                placeholder="Ex: 8.75"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Average CGPA (Auto-calculated) *</label>
              <input 
                type="text" 
                value={formState.btech_avg_cgpa} 
                disabled
                className="riso-input bg-gray-100 cursor-not-allowed font-bold"
                placeholder="Average of sem 1-5"
              />
            </div>

            <div className="md:col-span-3 border-t border-dashed border-black my-2"></div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Any Backlog Till Date? *</label>
              <select 
                value={formState.btech_backlog} 
                onChange={(e) => handleInputChange('btech_backlog', e.target.value)}
                className="riso-select"
              >
                <option value="NO">NO</option>
                <option value="YES">YES</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Number of Backlogs (If YES)</label>
              <input 
                type="text" 
                value={formState.btech_backlog_count} 
                onChange={(e) => handleInputChange('btech_backlog_count', e.target.value)}
                className="riso-input"
                placeholder="Ex: 0 or 2"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Backlog Subject Code 1</label>
              <input 
                type="text" 
                value={formState.btech_backlog_subject_1} 
                onChange={(e) => handleInputChange('btech_backlog_subject_1', e.target.value)}
                className="riso-input"
                placeholder="Ex: PCC-CS501 or N.A."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Backlog Subject Code 2</label>
              <input 
                type="text" 
                value={formState.btech_backlog_subject_2} 
                onChange={(e) => handleInputChange('btech_backlog_subject_2', e.target.value)}
                className="riso-input"
                placeholder="Subject code or N.A."
              />
            </div>
          </div>
        )}

        {/* TAB 5: ADDRESSES */}
        {activeTab === 4 && (
          <div className="flex flex-col gap-8">
            {/* Permanent Address */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <h3 className="md:col-span-3 font-black text-lg text-[var(--ink-blue)] border-b pb-2 mb-2 uppercase tracking-wide">
                SECTION 6: PERMANENT ADDRESS DETAILS
              </h3>

              <div className="md:col-span-3 flex flex-col gap-1.5">
                <label className="tech-label">Complete Permanent Address *</label>
                <textarea 
                  value={formState.perm_address} 
                  onChange={(e) => handleInputChange('perm_address', e.target.value)}
                  className="riso-input h-20 resize-none"
                  placeholder="Building No, Road/Street, Lane, Pin, District etc."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Post Office *</label>
                <input 
                  type="text" 
                  value={formState.perm_post_office} 
                  onChange={(e) => handleInputChange('perm_post_office', e.target.value)}
                  className="riso-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Village / City *</label>
                <input 
                  type="text" 
                  value={formState.perm_city} 
                  onChange={(e) => handleInputChange('perm_city', e.target.value)}
                  className="riso-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Pin Number *</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={formState.perm_pin} 
                  onChange={(e) => handleInputChange('perm_pin', e.target.value)}
                  className="riso-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">District *</label>
                <input 
                  type="text" 
                  value={formState.perm_district} 
                  onChange={(e) => handleInputChange('perm_district', e.target.value)}
                  className="riso-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">State *</label>
                <input 
                  type="text" 
                  value={formState.perm_state} 
                  onChange={(e) => handleInputChange('perm_state', e.target.value)}
                  className="riso-input"
                />
              </div>
            </div>

            {/* Present Address */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-dashed border-black pt-6">
              <div className="md:col-span-3 flex justify-between items-center border-b pb-2 mb-2">
                <h3 className="font-black text-lg text-[var(--ink-blue)] uppercase tracking-wide">
                  SECTION 7: PRESENT ADDRESS DETAILS
                </h3>
                <button
                  type="button"
                  onClick={copyPermanentAddress}
                  className="riso-btn riso-btn-secondary text-[10px] py-1 px-3 shadow-[1.5px_1.5px_0px_#121212]"
                >
                  COPY PERMANENT ADDRESS
                </button>
              </div>

              <div className="md:col-span-3 flex flex-col gap-1.5">
                <label className="tech-label">Complete Present Address *</label>
                <textarea 
                  value={formState.pres_address} 
                  onChange={(e) => handleInputChange('pres_address', e.target.value)}
                  className="riso-input h-20 resize-none"
                  placeholder="Building No, Road/Street, Lane, Pin, District etc."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Post Office *</label>
                <input 
                  type="text" 
                  value={formState.pres_post_office} 
                  onChange={(e) => handleInputChange('pres_post_office', e.target.value)}
                  className="riso-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Village / City *</label>
                <input 
                  type="text" 
                  value={formState.pres_city} 
                  onChange={(e) => handleInputChange('pres_city', e.target.value)}
                  className="riso-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">Pin Number *</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={formState.pres_pin} 
                  onChange={(e) => handleInputChange('pres_pin', e.target.value)}
                  className="riso-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">District *</label>
                <input 
                  type="text" 
                  value={formState.pres_district} 
                  onChange={(e) => handleInputChange('pres_district', e.target.value)}
                  className="riso-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="tech-label">State *</label>
                <input 
                  type="text" 
                  value={formState.pres_state} 
                  onChange={(e) => handleInputChange('pres_state', e.target.value)}
                  className="riso-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: FAMILY DETAILS */}
        {activeTab === 5 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <h3 className="md:col-span-3 font-black text-lg text-[var(--ink-green)] border-b pb-2 mb-2 uppercase tracking-wide">
              SECTION 8: FAMILY & GUARDIAN DETAILS
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Father's Name *</label>
              <input 
                type="text" 
                value={formState.father_name} 
                onChange={(e) => handleInputChange('father_name', e.target.value)}
                className="riso-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Father's Occupation *</label>
              <input 
                type="text" 
                value={formState.father_occupation} 
                onChange={(e) => handleInputChange('father_occupation', e.target.value)}
                className="riso-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              {/* Empty Column spacing */}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Mother's Name *</label>
              <input 
                type="text" 
                value={formState.mother_name} 
                onChange={(e) => handleInputChange('mother_name', e.target.value)}
                className="riso-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Mother's Occupation *</label>
              <input 
                type="text" 
                value={formState.mother_occupation} 
                onChange={(e) => handleInputChange('mother_occupation', e.target.value)}
                className="riso-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              {/* Empty Column spacing */}
            </div>

            <div className="md:col-span-3 border-t border-dashed border-black my-2"></div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Guardian's Name (If Applicable)</label>
              <input 
                type="text" 
                value={formState.guardian_name} 
                onChange={(e) => handleInputChange('guardian_name', e.target.value)}
                className="riso-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Relation with Guardian</label>
              <input 
                type="text" 
                value={formState.guardian_relation} 
                onChange={(e) => handleInputChange('guardian_relation', e.target.value)}
                className="riso-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Guardian's Occupation</label>
              <input 
                type="text" 
                value={formState.guardian_occupation} 
                onChange={(e) => handleInputChange('guardian_occupation', e.target.value)}
                className="riso-input"
              />
            </div>
          </div>
        )}

        {/* TAB 7: STUDY GAP & DECLARATION */}
        {activeTab === 6 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <h3 className="md:col-span-3 font-black text-lg text-[var(--ink-pink)] border-b pb-2 mb-2 uppercase tracking-wide">
              SECTION 9: ESSENTIAL DISABILITY, STUDY GAP & DECLARATION
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Physical Disability (YES/NO) *</label>
              <select 
                value={formState.physical_disability} 
                onChange={(e) => handleInputChange('physical_disability', e.target.value)}
                className="riso-select"
              >
                <option value="NO">NO</option>
                <option value="YES">YES</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Any Study Gap? (Class X to present) *</label>
              <select 
                value={formState.study_gap} 
                onChange={(e) => handleInputChange('study_gap', e.target.value)}
                className="riso-select"
              >
                <option value="NO">NO</option>
                <option value="YES">YES</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Number of Study Gap Years (If YES)</label>
              <input 
                type="text" 
                value={formState.study_gap_years} 
                onChange={(e) => handleInputChange('study_gap_years', e.target.value)}
                className="riso-input"
                placeholder="Ex: 0 or 1"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Specify Period of Study Gap</label>
              <input 
                type="text" 
                value={formState.study_gap_period} 
                onChange={(e) => handleInputChange('study_gap_period', e.target.value)}
                className="riso-input"
                placeholder="Ex: (2021-2022) or N.A."
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="tech-label">Reason of Study Gap</label>
              <input 
                type="text" 
                value={formState.study_gap_reason} 
                onChange={(e) => handleInputChange('study_gap_reason', e.target.value)}
                className="riso-input"
                placeholder="Describe reason or N.A."
              />
            </div>

            <div className="md:col-span-3 border-t border-dashed border-black my-2"></div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Any Work Experience? *</label>
              <select 
                value={formState.work_experience} 
                onChange={(e) => handleInputChange('work_experience', e.target.value)}
                className="riso-select"
              >
                <option value="NO">NO</option>
                <option value="YES">YES</option>
              </select>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="tech-label">Specify Work Experience (Details)</label>
              <input 
                type="text" 
                value={formState.work_experience_mention} 
                onChange={(e) => handleInputChange('work_experience_mention', e.target.value)}
                className="riso-input"
                placeholder="Company Name, Role, Tenure or N.A."
              />
            </div>

            <div className="md:col-span-3 border-t-2 border-[var(--ink-black)] my-4 pt-4">
              <div className="riso-card riso-card-yellow bg-[#fffce6] flex flex-col gap-4 p-5">
                <h4 className="font-black text-sm uppercase text-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-[var(--ink-blue)]" /> LEGAL DECLARATION
                </h4>
                <p className="text-xs font-semibold leading-relaxed text-gray-800">
                  I HEREBY DECLARE THAT THE INFORMATION PROVIDED ABOVE ARE TRUE AND ACCURATE TO THE BEST OF MY KNOWLEDGE & BELIEF. I UNDERSTAND THAT ANY DISCREPANCIES OR MISREPRESENTATION DISCOVERED AT A LATER DATE WILL RESULT IN PLACEMENT ELIGIBILITY DISQUALIFICATION.
                </p>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="declare-check"
                    checked={formState.declaration_agree === 'YES'}
                    onChange={(e) => handleInputChange('declaration_agree', e.target.checked ? 'YES' : 'NO')}
                    className="w-4 h-4 border-2 border-black rounded-none cursor-pointer accent-[var(--ink-blue)]"
                  />
                  <label htmlFor="declare-check" className="text-xs font-black text-black cursor-pointer select-none">
                    I AGREE TO THE PLACEMENT DECLARATION
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* D. Bottom Wizard Controls */}
        <div className="flex justify-between items-center border-t border-dashed border-black pt-6 mt-4">
          <button
            type="button"
            disabled={activeTab === 0}
            onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}
            className="riso-btn riso-btn-secondary text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#121212]"
          >
            <ChevronLeft className="w-4 h-4" /> PREVIOUS
          </button>

          <span className="font-mono text-xs font-black tracking-widest text-gray-500">
            SECTION {activeTab + 1} OF 7
          </span>

          {activeTab < tabs.length - 1 ? (
            <button
              type="button"
              onClick={() => setActiveTab(prev => Math.min(tabs.length - 1, prev + 1))}
              className="riso-btn text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#121212]"
            >
              NEXT SECTION <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSaveForm(true)}
              disabled={isSaving}
              className="riso-btn riso-btn-pink text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#121212]"
            >
              <CheckCircle2 className="w-4 h-4" /> {isSaving ? "SUBMITTING..." : "SUBMIT FINAL RECORD"}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers';
import { 
  User, BookOpen, GraduationCap, Users, MapPin, 
  AlertTriangle, Save, CheckCircle2, ChevronRight, 
  ChevronLeft, Sparkles, LogOut, ArrowLeft, FileText,
  Calendar, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Default schema structure matching the 75 Excel columns exactly
const INITIAL_FORM_STATE = {
  // Section 1: General & Contact
  stream: '',
  roll_number: '',
  full_name: '',
  first_middle_name: '',
  last_name: '',
  photo_pdf_link: '',
  gender: '',
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
  class_x_exam_name: '',
  class_x_pass_year: '',
  class_x_board: '',
  class_x_school: '',
  class_x_medium: '',
  class_x_std_marks_pct: '',
  class_x_actual_pct: '',
  class_x_math_pct: '',
  class_x_science_pct: '',
  class_x_comp_app_pct: '',

  // Section 3: Class XII
  class_xii_exam_name: '',
  class_xii_pass_year: '',
  class_xii_board: '',
  class_xii_school: '',
  class_xii_medium: '',
  class_xii_std_marks_pct: '',
  class_xii_actual_pct: '',
  class_xii_math_pct: '',
  class_xii_physics_pct: '',
  class_xii_chemistry_pct: '',

  // Section 4: Diploma & Entrance
  has_diploma: '',
  diploma_exam_name: '',
  diploma_rank: '',
  diploma_stream: '',
  diploma_pass_year: '',
  diploma_college: '',
  diploma_university: '',
  diploma_pct: '',
  has_class_xii: '',
  entrance_exam_name: '',
  entrance_exam_rank: '',

  // Section 5: B.Tech Details
  university_reg_no: '',
  btech_stream: '',
  btech_course_duration: '2023-2027',
  sem_1_cgpa: '',
  sem_2_cgpa: '',
  sem_3_cgpa: '',
  sem_4_cgpa: '',
  sem_5_cgpa: '',
  btech_avg_cgpa: '',
  btech_backlog: '',
  btech_backlog_count: '',
  btech_backlog_subject_1: '',
  btech_backlog_subject_2: '',

  // Section 6: Family Details
  father_name: '',
  father_occupation: '',
  mother_name: '',
  mother_occupation: '',
  guardian_name: '',
  guardian_relation: '',
  guardian_occupation: '',

  // Section 7: Addresses
  perm_address: '',
  perm_post_office: '',
  perm_city: '',
  perm_pin: '',
  perm_district: '',
  perm_state: '',
  
  pres_address: '',
  pres_post_office: '',
  pres_city: '',
  pres_pin: '',
  pres_district: '',
  pres_state: '',

  // Section 8: Gaps & Declaration
  physical_disability: '',
  study_gap: '',
  study_gap_years: '',
  study_gap_period: '',
  study_gap_reason: '',
  work_experience: '',
  work_experience_mention: '',
  declaration_agree: ''
};

// Helper functions to convert DOB formats between stored DD-MM-YYYY and HTML5 date picker YYYY-MM-DD
const convertDDMMYYYYToYYYYMMDD = (dateStr: string): string => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      return `${year}-${month}-${day}`;
    }
  }
  return '';
};

const convertYYYYMMDDToDDMMYYYY = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (year.length === 4 && month.length === 2 && day.length === 2) {
      return `${day}-${month}-${year}`;
    }
  }
  return dateStr;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper functions for profile progress calculations
const getRequiredFieldsForTab = (tabIndex: number, formState: any) => {
  switch (tabIndex) {
    case 0:
      return [
        'roll_number', 'full_name', 'first_middle_name', 'photo_pdf_link', 
        'gender', 'dob', 'blood_group', 'contact_operational_1', 
        'email_operational_gmail', 'linkedin_link', 'github_link'
      ];
    case 1: // Class 10
      return [
        'class_x_exam_name', 'class_x_pass_year', 'class_x_board', 'class_x_school',
        'class_x_medium', 'class_x_std_marks_pct', 'class_x_actual_pct', 'class_x_math_pct',
        'class_x_science_pct'
      ];
    case 2: // Class 12
      if (formState.has_class_xii === 'YES') {
        return [
          'has_class_xii', 'class_xii_exam_name', 'class_xii_pass_year', 'class_xii_board',
          'class_xii_school', 'class_xii_medium', 'class_xii_std_marks_pct', 'class_xii_actual_pct',
          'class_xii_math_pct', 'class_xii_physics_pct', 'class_xii_chemistry_pct'
        ];
      } else if (formState.has_class_xii === 'NO') {
        return ['has_class_xii'];
      } else {
        return ['has_class_xii'];
      }
    case 3: // Diploma
      if (formState.has_diploma === 'YES') {
        return [
          'has_diploma', 'diploma_exam_name', 'diploma_rank', 'diploma_stream', 'diploma_pass_year',
          'diploma_college', 'diploma_university', 'diploma_pct'
        ];
      } else if (formState.has_diploma === 'NO') {
        return ['has_diploma'];
      } else {
        return ['has_diploma'];
      }
    case 4: // Entrance Exam
      return ['entrance_exam_name', 'entrance_exam_rank'];
    case 5: // B.Tech Performance
      const btechReqs = [
        'university_reg_no', 'btech_stream', 'btech_course_duration', 
        'sem_1_cgpa', 'sem_2_cgpa', 'sem_3_cgpa', 'sem_4_cgpa', 'sem_5_cgpa', 
        'btech_avg_cgpa', 'btech_backlog'
      ];
      if (formState.btech_backlog === 'YES') {
        btechReqs.push('btech_backlog_count', 'btech_backlog_subject_1');
      }
      return btechReqs;
    case 6: // Addresses
      return [
        'perm_address', 'perm_post_office', 'perm_city', 'perm_pin', 'perm_district', 'perm_state',
        'pres_address', 'pres_post_office', 'pres_city', 'pres_pin', 'pres_district', 'pres_state'
      ];
    case 7: // Family
      return ['father_name', 'father_occupation', 'mother_name', 'mother_occupation'];
    case 8: // Gaps & Declaration
      const gapReqs = ['physical_disability', 'study_gap', 'work_experience', 'declaration_agree'];
      if (formState.study_gap === 'YES') {
        gapReqs.push('study_gap_years', 'study_gap_period', 'study_gap_reason');
      }
      if (formState.work_experience === 'YES') {
        gapReqs.push('work_experience_mention');
      }
      return gapReqs;
    default:
      return [];
  }
};

const getTabProgress = (tabIndex: number, formState: any) => {
  const fields = getRequiredFieldsForTab(tabIndex, formState);
  if (fields.length === 0) return { filled: 0, total: 0, pct: 100, isComplete: true };
  
  let filledCount = 0;
  fields.forEach(field => {
    const val = formState[field];
    if (val !== undefined && val !== null && val.toString().trim() !== '' && val.toString().trim() !== 'NA') {
      if (field === 'declaration_agree') {
        if (val === 'YES') {
          filledCount++;
        }
      } else {
        filledCount++;
      }
    }
  });
  
  return {
    filled: filledCount,
    total: fields.length,
    pct: Math.round((filledCount / fields.length) * 100),
    isComplete: filledCount === fields.length
  };
};

interface BrutalistDatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const parseDDMMYYYY = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month - 1, day);
    }
  }
  return null;
};

const formatDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const BrutalistDatePicker: React.FC<BrutalistDatePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedDate = React.useMemo(() => parseDDMMYYYY(value), [value]);

  const defaultYear = new Date().getFullYear() - 18;
  const [viewDate, setViewDate] = useState<Date>(() => {
    return selectedDate || new Date(defaultYear, 4, 1);
  });

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDate, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    return Array.from({ length: 61 }, (_, i) => currentYear - 5 - i);
  }, [currentYear]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setViewDate(new Date(year, parseInt(e.target.value, 10), 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setViewDate(new Date(parseInt(e.target.value, 10), month, 1));
  };

  const handleDaySelect = (dayNum: number) => {
    const newDate = new Date(year, month, dayNum);
    onChange(formatDDMMYYYY(newDate));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(formatDDMMYYYY(today));
    setViewDate(today);
    setIsOpen(false);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const gridCells = React.useMemo(() => {
    const cells = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        dayNum: daysInPrevMonth - i,
        isCurrentMonth: false,
        key: `prev-${i}`
      });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        dayNum: i,
        isCurrentMonth: true,
        key: `curr-${i}`
      });
    }
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        dayNum: i,
        isCurrentMonth: false,
        key: `next-${i}`
      });
    }
    return cells;
  }, [year, month, daysInMonth, startDayOfWeek, daysInPrevMonth]);

  const isToday = (dayNum: number) => {
    const today = new Date();
    return today.getDate() === dayNum && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (dayNum: number) => {
    return selectedDate && selectedDate.getDate() === dayNum && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="riso-input flex items-center justify-between cursor-pointer select-none bg-white font-mono text-sm"
        style={{ minHeight: '43.5px' }}
      >
        <span className={value ? 'text-[var(--ink-black)] font-bold' : 'text-gray-400'}>
          {value || 'DD-MM-YYYY'}
        </span>
        <Calendar className="w-4 h-4 text-[var(--ink-black)]" />
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-2 bg-white border-[2.5px] border-black p-4 z-50 shadow-[6px_6px_0px_#121212] w-[320px] select-none text-black">
          <div className="flex items-center justify-between gap-1.5 mb-4">
            <select 
              value={month} 
              onChange={handleMonthChange}
              className="border-2 border-black font-mono font-bold text-xs p-1 bg-white cursor-pointer outline-none flex-1"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i} value={i}>{name.toUpperCase()}</option>
              ))}
            </select>

            <select 
              value={year} 
              onChange={handleYearChange}
              className="border-2 border-black font-mono font-bold text-xs p-1 bg-white cursor-pointer outline-none w-[80px]"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <button 
                type="button"
                onClick={handlePrevMonth}
                className="border-2 border-black p-1 hover:bg-[var(--ink-pink)] hover:text-white bg-white active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-[2px_2px_0px_#121212] flex items-center justify-center h-[28px] w-[28px]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={handleNextMonth}
                className="border-2 border-black p-1 hover:bg-[var(--ink-pink)] hover:text-white bg-white active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-[2px_2px_0px_#121212] flex items-center justify-center h-[28px] w-[28px]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-mono font-bold text-[10px] text-gray-500 mb-2 border-b border-black pb-1">
            <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {gridCells.map((cell) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div 
                    key={cell.key} 
                    className="aspect-square flex items-center justify-center font-mono text-xs text-gray-300 pointer-events-none"
                  >
                    {cell.dayNum}
                  </div>
                );
              }
              
              const daySelected = isSelected(cell.dayNum);
              const dayToday = isToday(cell.dayNum);

              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => handleDaySelect(cell.dayNum)}
                  className={`aspect-square flex items-center justify-center font-mono text-xs font-bold border transition-all cursor-pointer select-none
                    ${daySelected 
                      ? 'bg-[var(--ink-yellow)] text-black border-2 border-black shadow-[2px_2px_0px_#121212] scale-105 z-10' 
                      : dayToday 
                        ? 'border-2 border-dashed border-[var(--ink-blue)] text-[var(--ink-blue)] hover:bg-[var(--ink-pink)] hover:text-white hover:border-black' 
                        : 'border-transparent hover:border-black hover:bg-[var(--ink-pink)] hover:text-white'
                    }`}
                >
                  {cell.dayNum}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-dashed border-gray-300">
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 font-mono font-bold text-[10px] border-2 border-black shadow-[2px_2px_0px_#121212] bg-white hover:bg-[var(--ink-pink)] hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 font-mono font-bold text-[10px] border-2 border-black shadow-[2px_2px_0px_#121212] bg-white hover:bg-[var(--ink-pink)] hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              TODAY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const getEmbeddableDriveUrl = (url: string) => {
  if (!url) return '';
  try {
    const driveRegExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegExp);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    const openRegExp = /[?&]id=([a-zA-Z0-9_-]+)/;
    const matchOpen = url.match(openRegExp);
    if (matchOpen && matchOpen[1]) {
      return `https://drive.google.com/file/d/${matchOpen[1]}/preview`;
    }
  } catch (e) {
    // Ignore
  }
  return url;
};

export default function StudentDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasChanged, setHasChanged] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dbLoading, setDbLoading] = useState(true);
  const [viewWizard, setViewWizard] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);

  const [hasDbRecord, setHasDbRecord] = useState<boolean | null>(null);

  const exportToExcel = () => {
    // Redirect to the API route which will serve the fully formatted master template
    window.location.href = '/api/student/export';
  };

  // Block background scroll when modal is open
  useEffect(() => {
    if (showPhotoPreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPhotoPreview]);

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
          if (data.record) {
            setHasDbRecord(true);
            setFormState(prev => ({
              ...prev,
              ...(data.record.details || {}),
              // Force authenticated Email into the primary operational email field (read-only constraint)
              email_operational_gmail: email,
              full_name: data.record.full_name || prev.full_name,
              roll_number: data.record.roll_number || prev.roll_number,
              stream: data.record.stream || prev.stream,
            }));
          } else {
            setHasDbRecord(false);
            // First time student: Pre-fill authenticated details
            setFormState(prev => ({
              ...prev,
              email_operational_gmail: email,
              full_name: name || '',
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load submission draft:", err);
        setHasDbRecord(false);
      } finally {
        setDbLoading(false);
      }
    }
    fetchDraft();
  }, [user]);

  // Auto-save draft function
  const autoSaveDraft = async () => {
    if (!user) return;
    setSyncStatus('saving');
    try {
      const response = await fetch('/api/student/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          full_name: formState.full_name,
          roll_number: formState.roll_number,
          stream: formState.stream,
          details: {
            ...formState,
            ...(formState.has_class_xii !== 'YES' ? {
              class_xii_exam_name: 'NA',
              class_xii_pass_year: 'NA',
              class_xii_board: 'NA',
              class_xii_school: 'NA',
              class_xii_medium: 'NA',
              class_xii_std_marks_pct: 'NA',
              class_xii_actual_pct: 'NA',
              class_xii_math_pct: 'NA',
              class_xii_physics_pct: 'NA',
              class_xii_chemistry_pct: 'NA',
            } : {}),
            ...(formState.has_diploma !== 'YES' ? {
              diploma_exam_name: 'NA',
              diploma_rank: 'NA',
              diploma_stream: 'NA',
              diploma_pass_year: 'NA',
              diploma_college: 'NA',
              diploma_university: 'NA',
              diploma_pct: 'NA',
            } : {}),
            ...(formState.btech_backlog !== 'YES' ? {
              btech_backlog_count: '0',
              btech_backlog_subject_1: 'NA',
              btech_backlog_subject_2: 'NA',
            } : {}),
            ...(formState.study_gap !== 'YES' ? {
              study_gap_years: '0',
              study_gap_period: 'NA',
              study_gap_reason: 'NA',
            } : {}),
            ...(formState.work_experience !== 'YES' ? {
              work_experience_mention: 'NA',
            } : {})
          },
          is_final: false
        }),
      });

      if (response.ok) {
        setSyncStatus('saved');
        setHasChanged(false);
      } else {
        throw new Error("Failed to save draft automatically.");
      }
    } catch (err) {
      console.error("Auto-save failed:", err);
      setSyncStatus('error');
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (!hasChanged || !user) return;

    const delayDebounceFn = setTimeout(() => {
      autoSaveDraft();
    }, 1500); // 1.5 seconds debounce

    return () => clearTimeout(delayDebounceFn);
  }, [formState, hasChanged, user]);

  // Form value change handler
  const handleInputChange = (field: keyof typeof INITIAL_FORM_STATE, value: string) => {
    // Normalize any variation of "NA" (na, n.a., N.A, n.a, n/a, N/A etc) to exactly "NA"
    const normalizedValue = /^n[./]?a\.?$/i.test(value.trim()) ? 'NA' : value;

    setHasChanged(true);
    setSyncStatus('idle');
    setFormState(prev => {
      const updated = { ...prev, [field]: normalizedValue };
      
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
    setHasChanged(true);
    setSyncStatus('idle');
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
      const rollTrimmed = formState.roll_number.trim();
      if (!rollTrimmed) {
        alert("University Roll Number is required!");
        return;
      }
      if (!/^\d{11}$/.test(rollTrimmed)) {
        alert("University Roll Number must be exactly 11 digits!");
        return;
      }
      if (!/^130308(23|24)\d{3}$/.test(rollTrimmed)) {
        alert("Invalid University Roll Number! Must be exactly 11 digits starting with 130308. Regular entries must contain 23 and lateral entries must contain 24 at positions 7-8 (e.g. 13030823XXX or 13030824XXX).");
        return;
      }
      
      // Extract last 3 digits and first name from email (e.g. tmsl.aiml27.001biswajit@gmail.com)
      const emailMatch = user.email.toLowerCase().match(/^tmsl\.aiml27\.(\d{3})([a-z]+)@gmail\.com$/);
      if (emailMatch) {
        const email3Digits = emailMatch[1];
        const emailFirstName = emailMatch[2];
        const rollLast3 = rollTrimmed.slice(-3);
        const enteredFirstName = formState.full_name.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');

        if (email3Digits !== rollLast3) {
          alert(`Roll Number mismatch! The last 3 digits of your roll number in your email is "${email3Digits}", but your entered roll number ends with "${rollLast3}". Please ensure they match.`);
          return;
        }

        if (enteredFirstName && emailFirstName !== enteredFirstName) {
          alert(`First Name mismatch! The first name in your email is "${emailFirstName}", but your entered name's first name is "${enteredFirstName}". Please ensure they match.`);
          return;
        }
      }

      if (!formState.full_name.trim()) {
        alert("Student's Full Name is required!");
        return;
      }

      const contact1 = formState.contact_operational_1.trim();
      if (!contact1) {
        alert("Contact Operational 1 is required!");
        return;
      }
      if (!/^\d{10}$/.test(contact1)) {
        alert("Contact Operational 1 must be exactly 10 digits!");
        return;
      }

      const contact2 = formState.contact_operational_2.trim();
      if (contact2 && !/^\d{10}$/.test(contact2)) {
        alert("Contact Operational 2 must be exactly 10 digits if provided!");
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
          details: {
            ...formState,
            ...(formState.has_class_xii !== 'YES' ? {
              class_xii_exam_name: 'NA',
              class_xii_pass_year: 'NA',
              class_xii_board: 'NA',
              class_xii_school: 'NA',
              class_xii_medium: 'NA',
              class_xii_std_marks_pct: 'NA',
              class_xii_actual_pct: 'NA',
              class_xii_math_pct: 'NA',
              class_xii_physics_pct: 'NA',
              class_xii_chemistry_pct: 'NA',
            } : {}),
            ...(formState.has_diploma !== 'YES' ? {
              diploma_exam_name: 'NA',
              diploma_rank: 'NA',
              diploma_stream: 'NA',
              diploma_pass_year: 'NA',
              diploma_college: 'NA',
              diploma_university: 'NA',
              diploma_pct: 'NA',
            } : {}),
            ...(formState.btech_backlog !== 'YES' ? {
              btech_backlog_count: '0',
              btech_backlog_subject_1: 'NA',
              btech_backlog_subject_2: 'NA',
            } : {}),
            ...(formState.study_gap !== 'YES' ? {
              study_gap_years: '0',
              study_gap_period: 'NA',
              study_gap_reason: 'NA',
            } : {}),
            ...(formState.work_experience !== 'YES' ? {
              work_experience_mention: 'NA',
            } : {})
          },
          is_final: isFinalSubmit
        }),
      });

      if (response.ok) {
        setSaveStatus('success');
        setHasChanged(false);
        setSyncStatus('saved');
        if (isFinalSubmit) {
          setViewWizard(false);
        }
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
    { label: "2. Class X", icon: BookOpen },
    { label: "3. Class XII", icon: BookOpen },
    { label: "4. Diploma", icon: GraduationCap },
    { label: "5. Entrance Exam", icon: GraduationCap },
    { label: "6. B.Tech Perf.", icon: GraduationCap },
    { label: "7. Address Blocks", icon: MapPin },
    { label: "8. Family Detail", icon: Users },
    { label: "9. Gaps & Decl.", icon: AlertTriangle }
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

  // If user is a pending admin (role not 'admin' AND they don't have a student DB record)
  // We wait for dbLoading to finish so hasDbRecord is not null.
  if (!dbLoading && user && user.role !== 'admin' && hasDbRecord === false) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-[var(--bg-paper)] font-mono animate-fadeIn">
        <div className="bg-white border-[3px] border-black p-8 max-w-md w-full shadow-[8px_8px_0px_var(--ink-pink)] text-center relative">
          <div className="absolute top-0 right-0 bg-[var(--ink-pink)] text-white text-[10px] font-black px-3 py-1.5 uppercase border-l-[3px] border-b-[3px] border-black">
            ACCOUNT PENDING
          </div>
          <AlertTriangle className="w-14 h-14 text-[var(--ink-pink)] mx-auto mb-5 drop-shadow-[2px_2px_0px_#121212]" />
          <h2 className="text-xl font-black mb-3 uppercase text-black">Verification Required</h2>
          <div className="bg-pink-50 border-2 border-[var(--ink-pink)] p-4 text-sm text-gray-800 mb-6 font-semibold leading-relaxed shadow-[3px_3px_0px_var(--ink-pink)]">
            Your administrative account ({user.email}) has been created but is currently awaiting database verification. 
            <br/><br/>
            You cannot access the student dossier or admin terminal until your role is explicitly granted by the system owner.
          </div>
          <button
            onClick={logout}
            className="bg-black hover:bg-[var(--ink-pink)] text-white px-6 py-3.5 text-sm font-black transition-colors w-full uppercase border-2 border-black hover:border-[var(--ink-pink)] shadow-[4px_4px_0px_#121212] flex justify-center items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (!viewWizard) {
    return (
      <div className="flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full gap-6">
        {saveStatus === 'success' && (
          <div className="bg-green-50 border-2 border-[var(--ink-green)] text-[var(--ink-green)] p-3 text-xs font-bold font-mono shadow-[3px_3px_0px_var(--ink-green)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> SUCCESS: PROFILE RECORD SAVED SECURELY IN NEON DATABASE!
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="bg-red-50 border-2 border-red-500 text-red-700 p-3 text-xs font-bold font-mono shadow-[3px_3px_0px_red]">
            ⚠️ ERROR: {errorMessage}
          </div>
        )}
        
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
            
            {/* Status Alert Banner / Profile Completion Progress */}
            {(() => {
              const tabProgresses = tabs.map((_, idx) => getTabProgress(idx, formState));
              const totalFilled = tabProgresses.reduce((sum, p) => sum + p.filled, 0);
              const totalRequired = tabProgresses.reduce((sum, p) => sum + p.total, 0);
              const overallPct = totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 0;
              const isProfileComplete = overallPct === 100;

              return (
                <div className={`riso-card flex flex-col gap-4 border-2 border-black shadow-[4px_4px_0px_#121212] ${
                  isProfileComplete ? 'bg-green-50/50 border-[var(--ink-green)] text-[var(--ink-green)]' : 'bg-amber-50 text-amber-600'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1 border border-black text-white ${
                      isProfileComplete ? 'bg-[var(--ink-green)]' : 'bg-amber-500'
                    }`}>
                      {isProfileComplete ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-black">
                      PROFILE COMPLETION STATUS: {overallPct}% COMPLETE
                    </h3>
                  </div>

                  <div className="w-full bg-white border-2 border-black h-6 relative shadow-[2px_2px_0px_#121212] overflow-hidden">
                    <div 
                      className={`h-full border-r-2 border-black transition-all duration-300 ${
                        isProfileComplete ? 'bg-[var(--ink-green)]' : 'bg-[var(--ink-yellow)]'
                      }`}
                      style={{ width: `${overallPct}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-[10px] text-black">
                      {overallPct}% FILLED ({totalFilled}/{totalRequired} FIELDS)
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-gray-700 leading-relaxed">
                    Your placement profile is always editable. Ensure your details are 100% complete before placement sheet generation. Below is the section-wise status checklist:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                    {tabs.map((tab, idx) => {
                      const progress = tabProgresses[idx];
                      return (
                        <div key={idx} className="flex items-center gap-2 border border-black p-2 bg-white text-black shadow-[2px_2px_0px_#121212]">
                          <div className={`w-4 h-4 border border-black flex items-center justify-center text-[10px] font-bold ${
                            progress.isComplete ? 'bg-[var(--ink-green)] text-white' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {progress.isComplete ? '✓' : '•'}
                          </div>
                          <div className="font-bold flex-1 truncate">{tab.label.replace(/^\d+\.\s+/, '')}</div>
                          <div className="text-gray-500 text-[10px]">
                            {progress.filled}/{progress.total}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

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

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <button 
                  onClick={() => setViewWizard(true)}
                  className="riso-btn riso-btn-pink w-full justify-center py-3 text-sm font-black shadow-[3px_3px_0px_#121212]"
                >
                  ENTER / EDIT DATABASE WIZARD FORM
                </button>
                <button 
                  onClick={exportToExcel}
                  className="riso-btn bg-white border-2 border-black hover:bg-[var(--ink-green)] hover:text-white text-black w-full justify-center py-3 text-sm font-black shadow-[3px_3px_0px_#121212] flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> EXPORT MY DETAILS
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
                  <span className="font-bold">{formState.btech_avg_cgpa || "NA"}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 uppercase font-mono text-[10px]">Class X Pct</span>
                  <span className="font-bold">{formState.class_x_actual_pct || "NA"}%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 uppercase font-mono text-[10px]">Class XII Pct</span>
                  <span className="font-bold">{formState.class_xii_actual_pct || "NA"}%</span>
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="riso-badge riso-badge-blue text-white">STUDENT SECTION</span>
            {(() => {
              const tabProgresses = tabs.map((_, idx) => getTabProgress(idx, formState));
              const totalFilled = tabProgresses.reduce((sum, p) => sum + p.filled, 0);
              const totalRequired = tabProgresses.reduce((sum, p) => sum + p.total, 0);
              const overallPct = totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 0;
              return (
                <span className={`riso-badge font-mono text-black ${
                  overallPct === 100 ? 'bg-[var(--ink-green)] text-white font-bold' : 'bg-[var(--ink-yellow)] text-black'
                }`}>
                  {overallPct === 100 ? "PROFILE COMPLETED" : "PROFILE INCOMPLETE"}
                </span>
              );
            })()}
            <span className={`font-mono text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border-2 border-black flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_#121212] ${
              syncStatus === 'saving' ? 'bg-amber-100 text-amber-700 border-amber-500' :
              syncStatus === 'saved' ? 'bg-green-100 text-green-700 border-green-500' :
              syncStatus === 'error' ? 'bg-red-100 text-red-700 border-red-500' :
              'bg-gray-100 text-gray-600 border-gray-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                syncStatus === 'saving' ? 'bg-amber-500 animate-ping' :
                syncStatus === 'saved' ? 'bg-green-500' :
                syncStatus === 'error' ? 'bg-red-500' :
                'bg-gray-400'
              }`}></span>
              {syncStatus === 'saving' ? 'Auto-saving...' :
               syncStatus === 'saved' ? 'Draft Saved' :
               syncStatus === 'error' ? 'Sync Error' :
               'Changes pending'}
            </span>
          </div>
          <h2 className="text-3xl font-black text-[var(--ink-black)] mt-2 uppercase tracking-tight">
            PLACEMENT DATABASE RECORD WIZARD
          </h2>
          <p className="text-xs font-mono text-gray-500 tracking-widest mt-1">
            Student: <span className="font-bold text-black">{user?.name}</span> • Connected: <span className="font-bold text-black">{user?.email}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => {
              if (hasChanged) {
                handleSaveForm(false);
              }
              setViewWizard(false);
            }}
            className="riso-btn riso-btn-secondary text-xs shadow-[2px_2px_0px_#121212] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> BACK TO PROFILE
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

      {/* Save Action Toast */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border-2 border-[var(--ink-green)] text-[var(--ink-green)] p-3 text-xs font-bold font-mono shadow-[3px_3px_0px_var(--ink-green)] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> SUCCESS: PROFILE RECORD SAVED SECURELY IN NEON DATABASE!
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="bg-red-50 border-2 border-red-500 text-red-700 p-3 text-xs font-bold font-mono shadow-[3px_3px_0px_red]">
          ⚠️ ERROR: {errorMessage}
        </div>
      )}

      {/* B. Dense Wizard Tabs Navigation */}
      <div className="flex flex-wrap border-b-2 border-[var(--ink-black)] gap-1 pb-1">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const progress = getTabProgress(idx, formState);
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-2.5 riso-step-tab whitespace-nowrap text-xs font-bold py-2.5 px-4 border-b-0 ${
                activeTab === idx ? 'active' : ''
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`inline-flex items-center justify-center font-mono text-[9px] h-[18px] min-w-[18px] px-1 border border-black font-black leading-none ${
                progress.isComplete 
                  ? 'bg-[var(--ink-green)] text-white' 
                  : 'bg-[var(--ink-yellow)] text-black'
              }`}>
                {progress.isComplete ? '✓' : `${progress.filled}/${progress.total}`}
              </span>
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
                <option value="">Select Stream</option>
                <option value="CSE-AIML">CSE-AIML (B.TECH)</option>
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
                placeholder="Ex: 13030823XXX (or 13030824XXX for lateral)"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Full Student Name (As per University) *</label>
              <input 
                type="text" 
                value={formState.full_name} 
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="riso-input"
                placeholder="Ex: RAHUL SHARMA"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">First & Middle Name *</label>
              <input 
                type="text" 
                value={formState.first_middle_name} 
                onChange={(e) => handleInputChange('first_middle_name', e.target.value)}
                className="riso-input"
                placeholder="Ex: RAHUL"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Last Name</label>
              <input 
                type="text" 
                value={formState.last_name} 
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="riso-input"
                placeholder="Ex: DEBNATH (leave blank if none)"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Formal Photo PDF Upload Link *</label>
              <input 
                type="url" 
                value={formState.photo_pdf_link} 
                onChange={(e) => handleInputChange('photo_pdf_link', e.target.value)}
                className="riso-input"
                placeholder="Write Google Drive Link (Link must be public)"
              />
              {formState.photo_pdf_link && /^https?:\/\/.+/.test(formState.photo_pdf_link) && (
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <a 
                      href={formState.photo_pdf_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 font-mono font-bold text-[10px] border-2 border-black shadow-[2px_2px_0px_#121212] bg-white hover:bg-[var(--ink-pink)] hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1"
                    >
                      <span>🔗</span> OPEN LINK
                    </a>
                    <button 
                      type="button"
                      onClick={() => setShowPhotoPreview(true)}
                      className="px-2.5 py-1 font-mono font-bold text-[10px] border-2 border-black shadow-[2px_2px_0px_#121212] bg-[var(--ink-yellow)] hover:bg-[var(--ink-black)] hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1"
                    >
                      <span>👁</span> PREVIEW DOCUMENT
                    </button>
                  </div>
                  {showPhotoPreview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
                      <div className="relative w-full max-w-4xl max-h-[95vh] bg-white border-4 border-black shadow-[8px_8px_0px_#121212] flex flex-col">
                        <div className="bg-[var(--ink-pink)] text-white p-3 flex justify-between items-center border-b-4 border-black">
                          <div className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                            <span>👁</span> PREVIEW MODE
                          </div>
                          <button 
                            onClick={() => setShowPhotoPreview(false)}
                            className="bg-white text-black px-3 py-1 text-xs font-black hover:bg-black hover:text-white border-2 border-black transition-colors"
                          >
                            CLOSE ✕
                          </button>
                        </div>
                        <div className="p-3 flex-grow overflow-hidden bg-gray-50 relative">
                          <div className="text-[10px] font-mono bg-black text-white p-1 mb-2 flex justify-between items-center">
                            <span>LIVE GOOGLE DRIVE / CLOUD PREVIEW</span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase hidden sm:block">(MUST BE PUBLIC LINK)</span>
                          </div>
                          <iframe 
                            src={getEmbeddableDriveUrl(formState.photo_pdf_link)} 
                            className="w-full h-[65vh] sm:h-[75vh] border-2 border-black bg-white" 
                            allow="autoplay"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Gender *</label>
              <select 
                value={formState.gender} 
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="riso-select"
              >
                <option value="">Select Gender</option>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Date of Birth *</label>
              <BrutalistDatePicker 
                value={formState.dob} 
                onChange={(val) => handleInputChange('dob', val)} 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Blood Group *</label>
              <select 
                value={formState.blood_group} 
                onChange={(e) => handleInputChange('blood_group', e.target.value)}
                className="riso-select"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Contact Operational 1 *</label>
              <input 
                type="text" 
                maxLength={10}
                value={formState.contact_operational_1} 
                onChange={(e) => handleInputChange('contact_operational_1', e.target.value.replace(/\D/g, ''))}
                className="riso-input"
                placeholder="10 DIGIT MOB"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Contact Operational 2</label>
              <input 
                type="text" 
                maxLength={10}
                value={formState.contact_operational_2} 
                onChange={(e) => handleInputChange('contact_operational_2', e.target.value.replace(/\D/g, ''))}
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
              <label className="tech-label">Primary Email (Registered Account) *</label>
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

        {/* TAB 2: CLASS X */}
        {activeTab === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <h3 className="md:col-span-3 font-black text-lg text-[var(--ink-blue)] border-b pb-2 mb-2 uppercase tracking-wide">
              SECTION 2: CLASS X ACADEMICS
            </h3>

            <div className="md:col-span-3 bg-blue-50 border-2 border-[var(--ink-blue)] p-4 text-xs font-semibold text-gray-700 leading-relaxed shadow-[3px_3px_0px_#121212]">
              <p className="font-black text-[var(--ink-blue)] uppercase mb-1">💡 Understanding Class X Marks:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Standard Marks %:</strong> Enter the percentage calculated according to your board/council rules (e.g., best of 5/6 subjects as reported on your official marksheet). Do not insert the "%" sign.</li>
                <li><strong>Actual Percentage:</strong> Strictly calculate as: <code className="bg-gray-100 px-1 border border-black font-mono font-bold text-[10px]">(Total Marks Obtained ÷ Total Marks Appeared) × 100</code>. Include all subjects you appeared for. Do not round off (e.g., if 85.43%, enter 85.43).</li>
              </ul>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Name of Examination *</label>
              <input type="text" value={formState.class_x_exam_name} onChange={(e) => handleInputChange('class_x_exam_name', e.target.value)} className="riso-input" placeholder="Ex: WBBSE / CBSE / ICSE" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Year of Pass Out *</label>
              <input type="text" value={formState.class_x_pass_year} onChange={(e) => handleInputChange('class_x_pass_year', e.target.value)} className="riso-input" placeholder="Ex: 2021" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Board / Council Name (Abbreviated) *</label>
              <input type="text" value={formState.class_x_board} onChange={(e) => handleInputChange('class_x_board', e.target.value)} className="riso-input" placeholder="Ex: WBBSE / CBSE" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="tech-label">School Name *</label>
              <input type="text" value={formState.class_x_school} onChange={(e) => handleInputChange('class_x_school', e.target.value)} className="riso-input" placeholder="Full School Name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Medium of Study *</label>
              <select value={formState.class_x_medium} onChange={(e) => handleInputChange('class_x_medium', e.target.value)} className="riso-select">
                <option value="">Select Medium</option>
                <option value="ENG">ENGLISH</option>
                <option value="BENG">BENGALI</option>
                <option value="HINDI">HINDI</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Standard Marks % (No % Sign) *</label>
              <input type="text" value={formState.class_x_std_marks_pct} onChange={(e) => handleInputChange('class_x_std_marks_pct', e.target.value)} className="riso-input" placeholder="Ex: 85.5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Actual Percentage (Total Marks Calc) *</label>
              <input type="text" value={formState.class_x_actual_pct} onChange={(e) => handleInputChange('class_x_actual_pct', e.target.value)} className="riso-input" placeholder="Ex: 85.43" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Maths Marks % (No % Sign) *</label>
              <input type="text" value={formState.class_x_math_pct} onChange={(e) => handleInputChange('class_x_math_pct', e.target.value)} className="riso-input" placeholder="Ex: 92" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Science Group (Phy+Chem+Bio) % *</label>
              <input type="text" value={formState.class_x_science_pct} onChange={(e) => handleInputChange('class_x_science_pct', e.target.value)} className="riso-input" placeholder="Ex: 88" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Computer Application % (If Any)</label>
              <input type="text" value={formState.class_x_comp_app_pct} onChange={(e) => handleInputChange('class_x_comp_app_pct', e.target.value)} className="riso-input" placeholder="Ex: 96 or NA" />
            </div>
          </div>
        )}

        {/* TAB 3: CLASS XII */}
        {activeTab === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <h3 className="md:col-span-3 font-black text-lg text-[var(--ink-blue)] border-b pb-2 mb-2 uppercase tracking-wide">
              SECTION 3: CLASS XII ACADEMICS
            </h3>

            <div className="md:col-span-3 bg-yellow-50 border-2 border-[var(--ink-yellow)] p-4 text-xs font-mono leading-relaxed text-black shadow-[3px_3px_0px_#121212]">
              <div className="font-black text-sm mb-2 flex items-center gap-1.5 text-amber-800">
                <span>⚠️</span> NOTE:
              </div>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><span className="font-bold text-[var(--ink-pink)]">If you appeared for Class XII (Higher Secondary):</span> Select <span className="bg-white px-1 border border-black font-bold">YES</span> — fill in your Class XII details below.</li>
                <li><span className="font-bold text-[var(--ink-pink)]">If you went directly to Diploma after Class X (did not appear for Class XII):</span> Select <span className="bg-white px-1 border border-black font-bold">NO</span> — you can skip to the next section.</li>
              </ul>
            </div>

            {/* Gateway */}
            <div className="md:col-span-3 flex flex-col gap-1.5">
              <label className="tech-label">Did you appear for Class XII (Higher Secondary)? *</label>
              <select value={formState.has_class_xii} onChange={(e) => handleInputChange('has_class_xii', e.target.value)} className="riso-select">
                <option value="">Select YES or NO</option>
                <option value="YES">YES — I completed Class XII / Higher Secondary</option>
                <option value="NO">NO — I went directly to Diploma after Class X</option>
              </select>
            </div>

            {formState.has_class_xii === 'YES' && (
              <>
                <div className="md:col-span-3 border-t-2 border-dashed border-[var(--ink-blue)] my-2 flex items-center gap-2">
                  <span className="bg-[var(--ink-blue)] text-white text-[10px] font-black px-2 py-0.5 font-mono whitespace-nowrap">CLASS XII DETAILS</span>
                </div>

                <div className="md:col-span-3 bg-blue-50 border-2 border-[var(--ink-blue)] p-4 text-xs font-semibold text-gray-700 leading-relaxed shadow-[3px_3px_0px_#121212]">
                  <p className="font-black text-[var(--ink-blue)] uppercase mb-1">💡 Understanding Class XII Marks:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Standard Marks %:</strong> Enter the percentage calculated according to your board/council rules (e.g., best of 4/5 subjects as reported on your official marksheet). Do not insert the "%" sign.</li>
                    <li><strong>Actual Percentage:</strong> Strictly calculate as: <code className="bg-gray-100 px-1 border border-black font-mono font-bold text-[10px]">(Total Marks Obtained ÷ Total Marks Appeared) × 100</code>. Include all subjects you appeared for. Do not round off (e.g., if 82.20%, enter 82.20).</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Name of Examination *</label>
                  <input type="text" value={formState.class_xii_exam_name} onChange={(e) => handleInputChange('class_xii_exam_name', e.target.value)} className="riso-input" placeholder="Ex: WBCHSE / CBSE / ISC" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Year of Pass Out *</label>
                  <input type="text" value={formState.class_xii_pass_year} onChange={(e) => handleInputChange('class_xii_pass_year', e.target.value)} className="riso-input" placeholder="Ex: 2023" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Board / Council Name (Abbreviated) *</label>
                  <input type="text" value={formState.class_xii_board} onChange={(e) => handleInputChange('class_xii_board', e.target.value)} className="riso-input" placeholder="Ex: WBCHSE / CBSE" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">School Name *</label>
                  <input type="text" value={formState.class_xii_school} onChange={(e) => handleInputChange('class_xii_school', e.target.value)} className="riso-input" placeholder="Full School Name" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Medium of Study *</label>
                  <select value={formState.class_xii_medium} onChange={(e) => handleInputChange('class_xii_medium', e.target.value)} className="riso-select">
                    <option value="">Select Medium</option>
                    <option value="ENG">ENGLISH</option>
                    <option value="BENG">BENGALI</option>
                    <option value="HINDI">HINDI</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Standard Marks % (No % Sign) *</label>
                  <input type="text" value={formState.class_xii_std_marks_pct} onChange={(e) => handleInputChange('class_xii_std_marks_pct', e.target.value)} className="riso-input" placeholder="Ex: 82.2" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Actual Percentage (Total Marks Calc) *</label>
                  <input type="text" value={formState.class_xii_actual_pct} onChange={(e) => handleInputChange('class_xii_actual_pct', e.target.value)} className="riso-input" placeholder="Ex: 82.20" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Maths Marks % *</label>
                  <input type="text" value={formState.class_xii_math_pct} onChange={(e) => handleInputChange('class_xii_math_pct', e.target.value)} className="riso-input" placeholder="Maths Marks" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Physics Marks % *</label>
                  <input type="text" value={formState.class_xii_physics_pct} onChange={(e) => handleInputChange('class_xii_physics_pct', e.target.value)} className="riso-input" placeholder="Physics Marks" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Chemistry Marks % *</label>
                  <input type="text" value={formState.class_xii_chemistry_pct} onChange={(e) => handleInputChange('class_xii_chemistry_pct', e.target.value)} className="riso-input" placeholder="Chemistry Marks" />
                </div>
              </>
            )}

            {formState.has_class_xii === 'NO' && (
              <div className="md:col-span-3 bg-green-50 border-2 border-[var(--ink-green)] p-4 text-xs font-mono text-black shadow-[3px_3px_0px_#121212]">
                <span className="font-black text-[var(--ink-green)]">✓ Noted.</span> Class XII fields will be recorded as <span className="bg-white px-1 border border-black">NA</span> in your profile. You can proceed to the next section.
              </div>
            )}
          </div>
        )}


        {/* TAB 4: DIPLOMA */}
        {activeTab === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <h3 className="md:col-span-3 font-black text-lg text-[var(--ink-green)] border-b pb-2 mb-2 uppercase tracking-wide">
              SECTION 4: DIPLOMA DETAILS
            </h3>

            <div className="md:col-span-3 bg-yellow-50 border-2 border-[var(--ink-yellow)] p-4 text-xs font-mono leading-relaxed text-black shadow-[3px_3px_0px_#121212]">
              <div className="font-black text-sm mb-2 flex items-center gap-1.5 text-amber-800">
                <span>⚠️</span> NOTE:
              </div>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><span className="font-bold text-[var(--ink-pink)]">If you completed a Diploma (Lateral / JELET entry):</span> Select <span className="bg-white px-1 border border-black font-bold">YES</span> — fill in all the diploma fields below.</li>
                <li><span className="font-bold text-[var(--ink-pink)]">If you did NOT do a Diploma (came via Class 12 / Management Quota):</span> Select <span className="bg-white px-1 border border-black font-bold">NO</span> — diploma fields will be skipped automatically.</li>
              </ul>
            </div>

            {/* Gateway */}
            <div className="md:col-span-3 flex flex-col gap-1.5">
              <label className="tech-label">Did you complete a Diploma before joining B.Tech? *</label>
              <select value={formState.has_diploma} onChange={(e) => handleInputChange('has_diploma', e.target.value)} className="riso-select">
                <option value="">Select YES or NO</option>
                <option value="YES">YES — I have a Diploma (Lateral / JELET entry)</option>
                <option value="NO">NO — I did not complete a Diploma</option>
              </select>
            </div>

            {formState.has_diploma === 'YES' && (
              <>
                <div className="md:col-span-3 border-t-2 border-dashed border-[var(--ink-green)] my-2 flex items-center gap-2">
                  <span className="bg-[var(--ink-green)] text-white text-[10px] font-black px-2 py-0.5 font-mono whitespace-nowrap">DIPLOMA DETAILS</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Diploma Entrance Test Name *</label>
                  <input type="text" value={formState.diploma_exam_name} onChange={(e) => handleInputChange('diploma_exam_name', e.target.value)} className="riso-input" placeholder="Ex: JELET" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Diploma Rank *</label>
                  <input type="text" value={formState.diploma_rank} onChange={(e) => handleInputChange('diploma_rank', e.target.value)} className="riso-input" placeholder="Ex: 4521" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Diploma Stream (Abbreviated) *</label>
                  <input type="text" value={formState.diploma_stream} onChange={(e) => handleInputChange('diploma_stream', e.target.value)} className="riso-input" placeholder="Ex: CE / EE / CSE" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Diploma Year of Passing *</label>
                  <input type="text" value={formState.diploma_pass_year} onChange={(e) => handleInputChange('diploma_pass_year', e.target.value)} className="riso-input" placeholder="Ex: 2023" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Diploma College Name *</label>
                  <input type="text" value={formState.diploma_college} onChange={(e) => handleInputChange('diploma_college', e.target.value)} className="riso-input" placeholder="Ex: Govt. Polytechnic Kolkata" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Diploma University Name *</label>
                  <input type="text" value={formState.diploma_university} onChange={(e) => handleInputChange('diploma_university', e.target.value)} className="riso-input" placeholder="Ex: WBSCTE" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Diploma Final Percentage *</label>
                  <input type="text" value={formState.diploma_pct} onChange={(e) => handleInputChange('diploma_pct', e.target.value)} className="riso-input" placeholder="Ex: 76.40" />
                </div>
              </>
            )}

            {formState.has_diploma === 'NO' && (
              <div className="md:col-span-3 bg-green-50 border-2 border-[var(--ink-green)] p-4 text-xs font-mono text-black shadow-[3px_3px_0px_#121212]">
                <span className="font-black text-[var(--ink-green)]">✓ Noted.</span> Diploma fields will be recorded as <span className="bg-white px-1 border border-black">NA</span> in your profile. Proceed to the next section.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ENTRANCE EXAM */}
        {activeTab === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <h3 className="md:col-span-3 font-black text-lg text-[var(--ink-green)] border-b pb-2 mb-2 uppercase tracking-wide">
              SECTION 5: B.TECH INTAKE ENTRANCE EXAM
            </h3>

            <div className="md:col-span-3 bg-yellow-50 border-2 border-[var(--ink-yellow)] p-4 text-xs font-mono leading-relaxed text-black shadow-[3px_3px_0px_#121212]">
              <div className="font-black text-sm mb-2 flex items-center gap-1.5 text-amber-800">
                <span>⚠️</span> HOW TO FILL:
              </div>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><span className="font-bold text-[var(--ink-pink)]">Via Diploma (JELET):</span> Write the entrance exam you took for your Diploma (e.g., <span className="bg-white px-1 border border-black">JELET</span>) and your rank.</li>
                <li><span className="font-bold text-[var(--ink-pink)]">Via Class 12 (WBJEE / JEE Main):</span> Write the entrance exam name and your rank.</li>
                <li><span className="font-bold text-[var(--ink-pink)]">Via Management Quota:</span> If you took an entrance exam, write its name and rank. If you did not take any entrance exam, write <span className="bg-white px-1 border border-black">Management Quota</span> as the exam name and <span className="bg-white px-1 border border-black">NA</span> as the rank.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Entrance Exam Name *</label>
              <input type="text" value={formState.entrance_exam_name} onChange={(e) => handleInputChange('entrance_exam_name', e.target.value)} className="riso-input" placeholder="Ex: WBJEE / JEE MAIN / JELET / Management Quota" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Entrance Exam Rank *</label>
              <input type="text" value={formState.entrance_exam_rank} onChange={(e) => handleInputChange('entrance_exam_rank', e.target.value)} className="riso-input" placeholder="Ex: 12045 (write NA if no entrance exam)" />
            </div>
          </div>
        )}

        {/* TAB 6: B.TECH PERFORMANCE */}
        {activeTab === 5 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <h3 className="md:col-span-3 font-black text-lg text-[var(--ink-pink)] border-b pb-2 mb-2 uppercase tracking-wide">
              SECTION 6: GRADUATION (B.TECH PERFORMANCE)
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
              <div className="flex items-center gap-3">
                <select
                  value={formState.btech_course_duration?.split('-')[0] || '2023'}
                  onChange={(e) => handleInputChange('btech_course_duration', `${e.target.value}-2027`)}
                  className="riso-select w-40"
                >
                  <option value="2023">2023</option>
                  <option value="2024">2024 (Lateral)</option>
                </select>
                <div className="font-bold font-mono text-xl">-</div>
                <input 
                  type="text" 
                  value="2027" 
                  disabled
                  className="riso-input w-40 bg-gray-100 cursor-not-allowed opacity-80"
                />
              </div>
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
                <option value="">Select Option</option>
                <option value="NO">NO</option>
                <option value="YES">YES</option>
              </select>
            </div>

            {formState.btech_backlog === 'YES' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Number of Backlogs *</label>
                  <input 
                    type="text" 
                    value={formState.btech_backlog_count} 
                    onChange={(e) => handleInputChange('btech_backlog_count', e.target.value)}
                    className="riso-input"
                    placeholder="Ex: 2"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Backlog Subject Code 1 *</label>
                  <input 
                    type="text" 
                    value={formState.btech_backlog_subject_1} 
                    onChange={(e) => handleInputChange('btech_backlog_subject_1', e.target.value)}
                    className="riso-input"
                    placeholder="Ex: PCC-CS501"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Backlog Subject Code 2</label>
                  <input 
                    type="text" 
                    value={formState.btech_backlog_subject_2} 
                    onChange={(e) => handleInputChange('btech_backlog_subject_2', e.target.value)}
                    className="riso-input"
                    placeholder="Subject code (leave blank if none)"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 7: ADDRESSES */}
        {activeTab === 6 && (
          <div className="flex flex-col gap-8">
            {/* Permanent Address */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <h3 className="md:col-span-3 font-black text-lg text-[var(--ink-blue)] border-b pb-2 mb-2 uppercase tracking-wide">
                SECTION 7: PERMANENT ADDRESS DETAILS
              </h3>

              <div className="md:col-span-3 bg-yellow-50 border-2 border-[var(--ink-yellow)] p-4 text-xs font-mono leading-relaxed text-black shadow-[3px_3px_0px_#121212]">
                <div className="font-black text-sm mb-2 flex items-center gap-1.5 text-amber-800">
                  <span>📝</span> COMPLETE ADDRESS NOTE:
                </div>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Please provide your <span className="font-bold text-[var(--ink-pink)]">Full Complete Address</span> exactly as it appears in your official documents (Aadhar, Passport, etc).</li>
                  <li>Ensure you include your <strong>House No/Name, Street Name, Locality, Landmark, and Police Station (P.S.)</strong>.</li>
                </ul>
              </div>

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
                <select 
                  value={formState.perm_state} 
                  onChange={(e) => handleInputChange('perm_state', e.target.value)}
                  className="riso-select"
                >
                  <option value="">Select State</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Others">Others</option>
                </select>
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
                <select 
                  value={formState.pres_state} 
                  onChange={(e) => handleInputChange('pres_state', e.target.value)}
                  className="riso-select"
                >
                  <option value="">Select State</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: FAMILY DETAILS */}
        {activeTab === 7 && (
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

        {/* TAB 9: STUDY GAP & DECLARATION */}
        {activeTab === 8 && (
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
                <option value="">Select Option</option>
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
                <option value="">Select Option</option>
                <option value="NO">NO</option>
                <option value="YES">YES</option>
              </select>
            </div>

            {formState.study_gap === 'YES' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Number of Study Gap Years *</label>
                  <input 
                    type="text" 
                    value={formState.study_gap_years} 
                    onChange={(e) => handleInputChange('study_gap_years', e.target.value)}
                    className="riso-input"
                    placeholder="Ex: 1, 2, or 3"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="tech-label">Specify Period of Study Gap *</label>
                  <input 
                    type="text" 
                    value={formState.study_gap_period} 
                    onChange={(e) => handleInputChange('study_gap_period', e.target.value)}
                    className="riso-input"
                    placeholder="Ex: 2021-2022"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="tech-label">Reason of Study Gap *</label>
                  <input 
                    type="text" 
                    value={formState.study_gap_reason} 
                    onChange={(e) => handleInputChange('study_gap_reason', e.target.value)}
                    className="riso-input"
                    placeholder="Describe reason"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-3 border-t border-dashed border-black my-2"></div>

            <div className="flex flex-col gap-1.5">
              <label className="tech-label">Any Work Experience? *</label>
              <select 
                value={formState.work_experience} 
                onChange={(e) => handleInputChange('work_experience', e.target.value)}
                className="riso-select"
              >
                <option value="">Select Option</option>
                <option value="NO">NO</option>
                <option value="YES">YES</option>
              </select>
            </div>

            {formState.work_experience === 'YES' && (
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="tech-label">Specify Work Experience (Details) *</label>
                <input 
                  type="text" 
                  value={formState.work_experience_mention} 
                  onChange={(e) => handleInputChange('work_experience_mention', e.target.value)}
                  className="riso-input"
                  placeholder="Company Name, Role, Tenure"
                />
              </div>
            )}

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
              <CheckCircle2 className="w-4 h-4" /> {isSaving ? "SAVING..." : "FINISH & SAVE PROFILE"}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}

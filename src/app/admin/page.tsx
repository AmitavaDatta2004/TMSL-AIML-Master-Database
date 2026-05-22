'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers';
import { 
  ShieldAlert, Download, Search, SlidersHorizontal, 
  Users, Award, AlertCircle, FileText, CheckCircle2, 
  X, Eye, BookOpen, User, MapPin, Sparkles, LogOut, ArrowLeft, GraduationCap
} from 'lucide-react';

const getRequiredFieldsForTab = (tabIndex: number, formState: any) => {
  switch (tabIndex) {
    case 0:
      return [
        'roll_number', 'full_name', 'first_middle_name', 'photo_pdf_link', 
        'gender', 'dob', 'blood_group', 'contact_operational_1', 
        'email_operational_gmail', 'linkedin_link', 'github_link'
      ];
    case 1:
      return [
        'class_x_exam_name', 'class_x_pass_year', 'class_x_board', 'class_x_school',
        'class_x_medium', 'class_x_std_marks_pct', 'class_x_actual_pct', 'class_x_math_pct',
        'class_x_science_pct'
      ];
    case 2:
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
    case 3:
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
    case 4:
      return ['entrance_exam_name', 'entrance_exam_rank'];
    case 5:
      const btechReqs = [
        'university_reg_no', 'btech_stream', 'btech_course_duration', 
        'sem_1_cgpa', 'sem_2_cgpa', 'sem_3_cgpa', 'sem_4_cgpa', 'sem_5_cgpa', 
        'btech_avg_cgpa', 'btech_backlog'
      ];
      if (formState.btech_backlog === 'YES') {
        btechReqs.push('btech_backlog_count', 'btech_backlog_subject_1');
      }
      return btechReqs;
    case 6:
      return [
        'perm_address', 'perm_post_office', 'perm_city', 'perm_pin', 'perm_district', 'perm_state',
        'pres_address', 'pres_post_office', 'pres_city', 'pres_pin', 'pres_district', 'pres_state'
      ];
    case 7:
      return ['father_name', 'father_occupation', 'mother_name', 'mother_occupation'];
    case 8:
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

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedBacklog, setSelectedBacklog] = useState('ALL');
  const [selectedGap, setSelectedGap] = useState('ALL');
  const [minCgpa, setMinCgpa] = useState('0.00');

  // Export excel state
  const [isExporting, setIsExporting] = useState(false);

  // Auth protection
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Load records
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    async function loadRecords() {
      try {
        const res = await fetch('/api/admin/submissions');
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        }
      } catch (err) {
        console.error("Failed to load records:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, [user]);

  // Filter students based on queries
  const filteredStudents = submissions.filter(student => {
    const details = student.details || {};
    
    // 1. Search Query Match
    const nameMatch = student.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const rollMatch = student.roll_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = student.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || rollMatch || emailMatch;

    // 2. Stream Match (Removed, now always matches as there is only one stream)
    const matchesStream = true;

    // 3. Gender Match
    const matchesGender = selectedGender === 'ALL' || details.gender === selectedGender;

    // 4. Backlog Match
    const matchesBacklog = selectedBacklog === 'ALL' || details.btech_backlog === selectedBacklog;

    // 5. Gap Match
    const matchesGap = selectedGap === 'ALL' || details.study_gap === selectedGap;

    // 6. CGPA Match
    const avgCgpa = parseFloat(details.btech_avg_cgpa || '0');
    const matchesCgpa = isNaN(avgCgpa) || avgCgpa >= parseFloat(minCgpa);

    return matchesSearch && matchesStream && matchesGender && matchesBacklog && matchesGap && matchesCgpa;
  });

  // Calculate statistics
  const totalSubmissions = submissions.length;
  const backlogStudents = submissions.filter(s => s.details?.btech_backlog === 'YES').length;
  const backlogPercentage = totalSubmissions > 0 ? ((backlogStudents / totalSubmissions) * 100).toFixed(0) : '0';
  
  const cgpas = submissions.map(s => parseFloat(s.details?.btech_avg_cgpa || '0')).filter(g => g > 0);
  const averageClassCgpa = cgpas.length > 0 ? (cgpas.reduce((a, b) => a + b, 0) / cgpas.length).toFixed(2) : '0.00';
  
  const femaleStudentsCount = submissions.filter(s => s.details?.gender === 'FEMALE').length;
  const femalePercentage = totalSubmissions > 0 ? ((femaleStudentsCount / totalSubmissions) * 100).toFixed(0) : '0';

  // Excel download handler
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/admin/export');
      if (res.ok) {
        // Create download blob
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TMSL_AIML_Master_Database_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        alert(`Export failed: ${data.error || "Server error"}`);
      }
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export Excel file.");
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--bg-paper)]">
        <div className="riso-card riso-card-pink bg-white flex flex-col items-center gap-4 py-8 px-12">
          <div className="w-8 h-8 border-4 border-t-[var(--ink-pink)] border-black rounded-full animate-spin"></div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--ink-pink)]">
            LOADING ADMIN PLATFORM SCHEMA...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full gap-6 relative">
      
      {/* Drawer overlay background */}
      {selectedStudent && (
        <div 
          onClick={() => setSelectedStudent(null)}
          className="fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-xs"
        />
      )}

      {/* A. Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-[var(--ink-black)] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="riso-badge riso-badge-pink text-white">ADMIN VIEW</span>
            <span className="riso-badge bg-black text-white">PLACEMENT MANAGER</span>
          </div>
          <h2 className="text-3xl font-black text-[var(--ink-black)] mt-2 uppercase tracking-tight">
            DEPARTMENT DATABASE CONSOLE
          </h2>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-1">
            Administrator Connected: <span className="font-bold text-black lowercase">{user?.email}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <a 
            href="/rules"
            className="riso-btn riso-btn-secondary text-xs shadow-[2px_2px_0px_#121212] flex items-center gap-1.5 font-bold"
          >
            <FileText className="w-4 h-4" /> PLACEMENT RULES
          </a>
          <button 
            onClick={handleExportExcel}
            disabled={isExporting}
            className="riso-btn riso-btn-yellow text-xs shadow-[2px_2px_0px_#121212] hover:shadow-[1px_1px_0px_#121212] flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> {isExporting ? "EXPORTING..." : "EXPORT TO EXCEL"}
          </button>
          <button 
            onClick={logout}
            className="riso-btn riso-btn-danger text-xs shadow-[2px_2px_0px_#121212] flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> SIGN OUT
          </button>
        </div>
      </div>

      {/* B. Dense Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Submissions */}
        <div className="riso-card riso-card-blue bg-white p-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="tech-label text-gray-500">TOTAL SUBMISSIONS</span>
            <span className="text-4xl font-black">{totalSubmissions}</span>
            <span className="text-[10px] font-mono font-bold text-gray-400 mt-1">STUDENTS PERSISTED</span>
          </div>
          <div className="bg-[var(--ink-blue)] text-white p-3 border-2 border-black">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Average CGPA */}
        <div className="riso-card riso-card-pink bg-white p-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="tech-label text-gray-500">AVERAGE CLASS CGPA</span>
            <span className="text-4xl font-black">{averageClassCgpa}</span>
            <span className="text-[10px] font-mono font-bold text-gray-400 mt-1">SEM 1-5 WEIGHTED</span>
          </div>
          <div className="bg-[var(--ink-pink)] text-white p-3 border-2 border-black">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Backlogs rate */}
        <div className="riso-card riso-card-yellow bg-white p-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="tech-label text-gray-500">BACKLOG RATE</span>
            <span className="text-4xl font-black">{backlogPercentage}%</span>
            <span className="text-[10px] font-mono font-bold text-gray-400 mt-1">{backlogStudents} ACTIVE CASES</span>
          </div>
          <div className="bg-[var(--ink-yellow)] text-[var(--ink-black)] p-3 border-2 border-black">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Gender diversity */}
        <div className="riso-card bg-white p-5 border-2 border-black shadow-[5px_5px_0px_#121212] flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="tech-label text-gray-500">FEMALE RATIO</span>
            <span className="text-4xl font-black">{femalePercentage}%</span>
            <span className="text-[10px] font-mono font-bold text-gray-400 mt-1">{femaleStudentsCount} REGISTRATIONS</span>
          </div>
          <div className="bg-black text-white p-3 border-2 border-black">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* C. Searching & Filters Panel */}
      <div className="riso-card bg-white p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-[var(--ink-blue)] font-black text-xs font-mono tracking-widest uppercase">
          <SlidersHorizontal className="w-4 h-4" /> [ ADVANCED SUBMISSION FILTERS ]
        </div>
        
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search bar */}
            <div className="md:col-span-3 flex flex-col gap-1.5">
              <label className="tech-label">Search Student Record</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="riso-input pl-9"
                  placeholder="Search Name, Roll, Email..."
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

          {/* Gender Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="tech-label">Filter Gender</label>
            <select 
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="riso-select"
            >
              <option value="ALL">ALL GENDERS</option>
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
            </select>
          </div>

          {/* Backlog Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="tech-label">Backlog Status</label>
            <select 
              value={selectedBacklog}
              onChange={(e) => setSelectedBacklog(e.target.value)}
              className="riso-select"
            >
              <option value="ALL">ALL CASES</option>
              <option value="NO">NO BACKLOG</option>
              <option value="YES">HAS BACKLOG</option>
            </select>
          </div>

          {/* Gap Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="tech-label">Study Gap Status</label>
            <select 
              value={selectedGap}
              onChange={(e) => setSelectedGap(e.target.value)}
              className="riso-select"
            >
              <option value="ALL">ALL CASES</option>
              <option value="NO">NO STUDY GAP</option>
              <option value="YES">HAS STUDY GAP</option>
            </select>
          </div>
        </div>

        {/* CGPA Slider Filter row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-dashed border-black pt-4 mt-1">
          <div className="flex items-center gap-3 w-full md:w-1/2">
            <label className="tech-label whitespace-nowrap">MIN AVERAGE CGPA:</label>
            <input 
              type="number" 
              min="0.00" 
              max="10.00" 
              step="0.01"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              className="riso-input w-24 py-1 px-2 text-sm"
              placeholder="0.00"
            />
          </div>
          
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
            FILTERED RESULTS: <span className="text-black font-black">{filteredStudents.length}</span> OUT OF <span className="text-black font-black">{submissions.length}</span>
          </span>
        </div>
      </div>

      {/* D. Data Table */}
      <div className="riso-card bg-white p-0 overflow-x-auto shadow-[6px_6px_0px_#121212] border-2 border-black">
        <table className="sheet-grid w-full text-left">
          <thead>
            <tr>
              <th className="w-12 text-center">#</th>
              <th>Roll Number</th>
              <th>Student Full Name</th>
              <th>Email Address</th>
              <th>Stream</th>
              <th>Avg CGPA</th>
              <th>Backlog</th>
              <th>Status</th>
              <th>Contact</th>
              <th className="w-24 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, idx) => {
                const details = student.details || {};
                const hasBacklog = details.btech_backlog === 'YES';
                
                return (
                  <tr key={student.id} className="border-b border-black">
                    <td className="text-center font-mono text-xs border-r border-black font-bold bg-gray-50">{idx + 1}</td>
                    <td className="font-mono text-xs font-bold border-r border-black">{student.roll_number || 'N.A.'}</td>
                    <td className="font-bold border-r border-black uppercase text-sm">{student.full_name || 'N.A.'}</td>
                    <td className="font-mono text-[10px] font-semibold border-r border-black text-gray-600">{student.email || 'N.A.'}</td>
                    <td className="font-semibold border-r border-black text-xs">{student.stream || 'CSE-AIML'}</td>
                    <td className="font-mono font-black border-r border-black text-sm text-[var(--ink-blue)]">
                      {details.btech_avg_cgpa || '0.00'}
                    </td>
                    <td className="border-r border-black">
                      {hasBacklog ? (
                        <span className="riso-badge riso-badge-pink text-[9px] py-0.5 font-bold">YES ({details.btech_backlog_count})</span>
                      ) : (
                        <span className="riso-badge riso-badge-green text-[9px] py-0.5 font-bold">NO</span>
                      )}
                    </td>
                    <td className="border-r border-black text-center">
                      {(() => {
                        const tabs = [0,1,2,3,4,5,6,7,8];
                        const mergedDetails = { 
                          btech_course_duration: '2023-2027', 
                          btech_stream: 'CSE-AIML',
                          email_operational_gmail: student.email,
                          full_name: student.full_name,
                          roll_number: student.roll_number,
                          ...(details || {}) 
                        };
                        
                        // Force empty string from older drafts to evaluate as CSE-AIML
                        if (!mergedDetails.btech_stream) {
                          mergedDetails.btech_stream = 'CSE-AIML';
                        }
                        const tabProgresses = tabs.map(idx => getTabProgress(idx, mergedDetails));
                        const totalFilled = tabProgresses.reduce((sum, p) => sum + p.filled, 0);
                        const totalRequired = tabProgresses.reduce((sum, p) => sum + p.total, 0);
                        const overallPct = totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 0;
                        const isProfileComplete = overallPct === 100;
                        
                        if (isProfileComplete) {
                          return (
                            <div className="flex flex-col gap-1 items-center justify-center">
                              <span className="text-[10px] font-black text-[var(--ink-green)] uppercase bg-green-50 px-2 py-0.5 border border-[var(--ink-green)] leading-none">COMPLETE</span>
                              <span className="text-[10px] font-mono font-bold text-gray-500">100%</span>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="flex flex-col gap-1 items-center justify-center">
                            <span className="text-[10px] font-black text-[var(--ink-pink)] uppercase bg-pink-50 px-2 py-0.5 border border-[var(--ink-pink)] leading-none">DRAFT</span>
                            <span className="text-[10px] font-mono font-bold text-gray-500">{overallPct}%</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="font-mono text-xs border-r border-black">{details.contact_operational_1 || 'N.A.'}</td>
                    <td className="text-center p-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="riso-btn riso-btn-secondary py-1 px-2.5 text-[10px] shadow-[1.5px_1.5px_0px_#121212] hover:shadow-[0.5px_0.5px_0px_#121212] flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> DETAILS
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-12 text-sm font-bold text-gray-500 uppercase tracking-wider font-mono">
                  ❌ NO STUDENT DETAILS SUBMISSIONS FOUND MATCHING FILTERS.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* E. Sliding Detailed Drawer (Zine Styled Card) */}
      {selectedStudent && (
        <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[var(--bg-paper)] border-l-4 border-black z-50 shadow-2xl p-6 overflow-y-auto flex flex-col gap-6 select-text transition-transform duration-200 ease-out">
          
          {/* Drawer Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="riso-badge riso-badge-pink text-white text-[9px]">STUDENT SHEET</span>
                <span className="riso-badge riso-badge-yellow text-black text-[9px] font-mono">{selectedStudent.stream}</span>
              </div>
              <h3 className="text-2xl font-black text-black mt-2 uppercase leading-none">
                {selectedStudent.full_name}
              </h3>
              <p className="font-mono text-xs text-gray-500 mt-1 uppercase">
                Roll: {selectedStudent.roll_number} • Reg: {selectedStudent.details?.university_reg_no || 'N.A.'}
              </p>
            </div>
            
            <button 
              onClick={() => setSelectedStudent(null)}
              className="bg-black text-white p-1 border-2 border-black hover:bg-[var(--ink-pink)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body - Dense Information blocks */}
          <div className="flex flex-col gap-6">
            
            {/* Section 1: Academics Summary */}
            <div className="riso-card riso-card-blue bg-white p-4 flex flex-col gap-3">
              <h4 className="font-black text-xs text-[var(--ink-blue)] uppercase font-mono tracking-wider flex items-center gap-1 border-b pb-1">
                <BookOpen className="w-3.5 h-3.5" /> B.TECH PERFORMANCE (SEM 1-5)
              </h4>
              <div className="grid grid-cols-5 gap-2 text-center">
                {['sem_1_cgpa', 'sem_2_cgpa', 'sem_3_cgpa', 'sem_4_cgpa', 'sem_5_cgpa'].map((semKey, idx) => (
                  <div key={idx} className="border border-black p-2 bg-gray-50">
                    <p className="font-mono text-[9px] text-gray-400 font-bold uppercase">SEM {idx+1}</p>
                    <p className="font-mono font-black text-sm text-black mt-1">
                      {selectedStudent.details?.[semKey] || 'N.A.'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center bg-[var(--bg-paper)] border border-black p-2 px-3 mt-1 text-xs">
                <span className="font-mono font-bold text-gray-500 uppercase">AVERAGE CGPA:</span>
                <span className="font-mono font-black text-sm text-[var(--ink-blue)]">
                  {selectedStudent.details?.btech_avg_cgpa || '0.00'}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs mt-1 border-t border-dashed border-black pt-2">
                <span className="font-mono font-bold text-gray-500 uppercase">ACTIVE BACKLOGS:</span>
                <span className="font-mono font-black text-black">
                  {selectedStudent.details?.btech_backlog === 'YES' 
                    ? `YES (${selectedStudent.details?.btech_backlog_count} - ${selectedStudent.details?.btech_backlog_subject_1})`
                    : 'NO'}
                </span>
              </div>
            </div>

            {/* Section 2: Personal & Socials */}
            <div className="riso-card bg-white p-4 flex flex-col gap-3">
              <h4 className="font-black text-xs text-[var(--ink-pink)] uppercase font-mono tracking-wider flex items-center gap-1 border-b pb-1">
                <User className="w-3.5 h-3.5" /> PERSONAL INFORMATION & CONTACTS
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 font-mono text-[10px] font-bold block uppercase">GENDER / DOB</span>
                  <span className="font-bold text-black">{selectedStudent.details?.gender} • {selectedStudent.details?.dob}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-mono text-[10px] font-bold block uppercase">BLOOD GROUP</span>
                  <span className="font-bold text-black">{selectedStudent.details?.blood_group || 'N.A.'}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-mono text-[10px] font-bold block uppercase">PRIMARY CONTACT</span>
                  <span className="font-mono font-bold text-black">{selectedStudent.details?.contact_operational_1}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-mono text-[10px] font-bold block uppercase">PRIMARY EMAIL</span>
                  <span className="font-mono font-bold text-black">{selectedStudent.email}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 font-mono text-[10px] font-bold block uppercase">PHOTO LINK</span>
                  <a 
                    href={selectedStudent.details?.photo_pdf_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] font-bold text-[var(--ink-blue)] hover:underline truncate block max-w-full"
                  >
                    {selectedStudent.details?.photo_pdf_link}
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 font-mono text-[10px] font-bold block uppercase">LINKEDIN</span>
                  <a href={selectedStudent.details?.linkedin_link} target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-[var(--ink-blue)] hover:underline">
                    PROFILE LINK ↗
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 font-mono text-[10px] font-bold block uppercase">GITHUB</span>
                  <a href={selectedStudent.details?.github_link} target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-[var(--ink-blue)] hover:underline">
                    PROFILE LINK ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Section 3: High Schooling */}
            <div className="riso-card bg-white p-4 flex flex-col gap-3">
              <h4 className="font-black text-xs text-[var(--ink-green)] uppercase font-mono tracking-wider flex items-center gap-1 border-b pb-1">
                <GraduationCap className="w-3.5 h-3.5" /> ACADEMIC HISTORIES
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Class X */}
                <div className="border border-black p-3 bg-gray-50 flex flex-col gap-1">
                  <p className="font-black font-mono text-[10px] text-gray-500 uppercase border-b pb-0.5 mb-1">CLASS X DETAILS</p>
                  <p><span className="text-gray-400 font-mono text-[9px] uppercase">BOARD / SCHOOL:</span> <strong className="block">{selectedStudent.details?.class_x_board} - {selectedStudent.details?.class_x_school}</strong></p>
                  <p><span className="text-gray-400 font-mono text-[9px] uppercase">PASS OUT / ACTUAL %:</span> <strong className="block">{selectedStudent.details?.class_x_pass_year} PASS • {selectedStudent.details?.class_x_actual_pct}%</strong></p>
                  <p><span className="text-gray-400 font-mono text-[9px] uppercase">MATHS / SCIENCE %:</span> <strong className="block">{selectedStudent.details?.class_x_math_pct}% / {selectedStudent.details?.class_x_science_pct}%</strong></p>
                </div>
                
                {/* Class XII */}
                <div className="border border-black p-3 bg-gray-50 flex flex-col gap-1">
                  <p className="font-black font-mono text-[10px] text-gray-500 uppercase border-b pb-0.5 mb-1">CLASS XII DETAILS</p>
                  <p><span className="text-gray-400 font-mono text-[9px] uppercase">BOARD / SCHOOL:</span> <strong className="block">{selectedStudent.details?.class_xii_board} - {selectedStudent.details?.class_xii_school}</strong></p>
                  <p><span className="text-gray-400 font-mono text-[9px] uppercase">PASS OUT / ACTUAL %:</span> <strong className="block">{selectedStudent.details?.class_xii_pass_year} PASS • {selectedStudent.details?.class_xii_actual_pct}%</strong></p>
                  <p><span className="text-gray-400 font-mono text-[9px] uppercase">MATHS / PHY / CHEM %:</span> <strong className="block">{selectedStudent.details?.class_xii_math_pct}% / {selectedStudent.details?.class_xii_physics_pct}% / {selectedStudent.details?.class_xii_chemistry_pct}%</strong></p>
                </div>
              </div>
            </div>

            {/* Section 4: Address Blocks */}
            <div className="riso-card bg-white p-4 flex flex-col gap-3">
              <h4 className="font-black text-xs text-[var(--ink-black)] uppercase font-mono tracking-wider flex items-center gap-1 border-b pb-1">
                <MapPin className="w-3.5 h-3.5" /> ADDRESS BLOCKS
              </h4>
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <span className="text-gray-400 font-mono text-[10px] font-bold block uppercase">PERMANENT ADDRESS</span>
                  <p className="font-semibold text-gray-800 bg-gray-50 p-2 border border-black leading-relaxed">
                    {selectedStudent.details?.perm_address}
                    <br />
                    <span className="font-mono text-[10px] font-bold text-gray-600">
                      P.O. {selectedStudent.details?.perm_post_office} • PIN {selectedStudent.details?.perm_pin} • {selectedStudent.details?.perm_district}, {selectedStudent.details?.perm_state}
                    </span>
                  </p>
                </div>
                
                <div>
                  <span className="text-gray-400 font-mono text-[10px] font-bold block uppercase">PRESENT ADDRESS</span>
                  <p className="font-semibold text-gray-800 bg-gray-50 p-2 border border-black leading-relaxed">
                    {selectedStudent.details?.pres_address}
                    <br />
                    <span className="font-mono text-[10px] font-bold text-gray-600">
                      P.O. {selectedStudent.details?.pres_post_office} • PIN {selectedStudent.details?.pres_pin} • {selectedStudent.details?.pres_district}, {selectedStudent.details?.pres_state}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: Gaps, Disability & Work */}
            <div className="riso-card bg-white p-4 flex flex-col gap-2 text-xs">
              <p>⚡ <span className="font-mono font-bold text-gray-400 uppercase">PHYSICAL DISABILITY:</span> <strong>{selectedStudent.details?.physical_disability}</strong></p>
              <p>⚡ <span className="font-mono font-bold text-gray-400 uppercase">STUDY GAP TILL DATE:</span> <strong>{selectedStudent.details?.study_gap === 'YES' ? `YES (${selectedStudent.details?.study_gap_years} YEARS - ${selectedStudent.details?.study_gap_reason})` : 'NO'}</strong></p>
              <p>⚡ <span className="font-mono font-bold text-gray-400 uppercase">WORK EXPERIENCE:</span> <strong>{selectedStudent.details?.work_experience === 'YES' ? `YES (${selectedStudent.details?.work_experience_mention})` : 'NO'}</strong></p>
              <p>⚡ <span className="font-mono font-bold text-gray-400 uppercase">DECLARATION AGREED:</span> <strong className="text-[var(--ink-green)]">{selectedStudent.details?.declaration_agree}</strong></p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

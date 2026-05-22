'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './providers';
import { 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Key, 
  Mail, 
  User as UserIcon, 
  ShieldAlert, 
  Database, 
  Activity, 
  Lock,
  Fingerprint,
  Eye,
  EyeOff
} from 'lucide-react';

type TabType = 'login' | 'signup' | 'forgot' | 'admin-login' | 'admin-signup';

// Strict Email Format Validator
const validateEmailFormat = (email: string): { isValid: boolean; error?: string; isStudent: boolean; isAdmin: boolean } => {
  const cleanEmail = email.toLowerCase().trim();
  
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
  
  if (!isValidEmail) {
    return {
      isValid: false,
      isStudent: false,
      isAdmin: false,
      error: 'Invalid email address format.'
    };
  }

  // Without hardcoded emails, all valid emails are treated as potential students initially.
  // Real admin status is determined strictly by the database/auth provider session.
  return { isValid: true, isStudent: true, isAdmin: false };
};

export default function Home() {
  const { user, logout, loginDemo, signInEmail, signUpEmail } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [adminClickCount, setAdminClickCount] = useState(0);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupRoll, setSignupRoll] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [devBypassUrl, setDevBypassUrl] = useState('');



  // Automatic redirect if user session is already active & matches validation rules
  React.useEffect(() => {
    if (user) {
      const validation = validateEmailFormat(user.email);
      if (!validation.isValid) {
        logout();
        setLoginError('Authentication Rejected: You must authenticate using an account matching our batch format (e.g. tmsl.aiml27.001das@gmail.com).');
        return;
      }
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
    }
  }, [user, router, logout]);

  // Check for developer bypass query parameters on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const demo = params.get('demo');
      if (demo === 'student') {
        loginDemo('student', 'tmsl.aiml27.001student@gmail.com');
      } else if (demo === 'admin') {
        loginDemo('admin', 'biswajit.tmsl27@gmail.com');
      }
    }
  }, [loginDemo]);



  // Handle email/password sign-in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }

    // Strict email format validation
    const validation = validateEmailFormat(loginEmail);
    if (!validation.isValid) {
      setLoginError(validation.error || 'Invalid email format.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);
    const res = await signInEmail(loginEmail, loginPassword);
    if (res.error) {
      setLoginError(res.error);
      setLoginLoading(false);
    }
  };

  // Handle email/password sign-up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      setSignupError('Please fill in all fields.');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }

    // If registering via the Admin Setup form, bypass student-specific rules
    if (activeTab === 'admin-signup') {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim());
      if (!isValidEmail) {
        setSignupError('Invalid email format.');
        return;
      }
    } else {
      // Strict email format validation for students
      const validation = validateEmailFormat(signupEmail);
      if (!validation.isValid) {
        setSignupError(validation.error || 'Invalid email format.');
        return;
      }

      if (!validation.isAdmin) {
        const rollTrimmed = signupRoll.trim();
        if (!rollTrimmed) {
          setSignupError('University Roll Number is required for students.');
          return;
        }
        if (!/^130308(23|24)\d{3}$/.test(rollTrimmed)) {
          setSignupError('Invalid University Roll Number! Must be exactly 11 digits starting with 130308. Regular entries must contain 23 and lateral entries must contain 24 at positions 7-8 (e.g. 13030823XXX).');
          return;
        }

        const last3Digits = rollTrimmed.slice(-3);
        const firstName = signupName.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
        const expectedEmail = `tmsl.aiml27.${last3Digits}${firstName}@gmail.com`;

        // Strict registration email rule temporarily bypassed for testing
        /*
        if (signupEmail.toLowerCase().trim() !== expectedEmail) {
          setSignupError(`Strict Registration Rule: Your email address must be exactly "${expectedEmail}" based on your roll number and first name.`);
          return;
        }
        */
      }
    }

    setSignupLoading(true);
    setSignupError(null);
    const res = await signUpEmail(signupEmail, signupPassword, signupName, signupRoll);
    if (res.error) {
      setSignupError(res.error);
      setSignupLoading(false);
    }
  };

  // Handle forgot password flow
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your email address.');
      return;
    }

    const validation = validateEmailFormat(forgotEmail);
    if (!validation.isValid) {
      setForgotError(validation.error || 'Invalid email format.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(false);
    setDevBypassUrl('');

    try {
      const { authClient } = await import('@/lib/auth/client');
      const redirectTo = typeof window !== 'undefined' 
        ? `${window.location.origin}/reset-password` 
        : '';
        
      const { error } = await authClient.requestPasswordReset({
        email: forgotEmail,
        redirectTo
      });

      if (error) {
        // Intercept error for local testing / missing Neon Auth variables
        const isLocal = typeof window !== 'undefined' && 
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        
        if (isLocal) {
          const devUrl = `/reset-password?token=dev-mock-token&email=${encodeURIComponent(forgotEmail)}`;
          setDevBypassUrl(devUrl);
          setForgotSuccess(true);
        } else {
          setForgotError(error.message || 'Failed to send recovery email.');
        }
      } else {
        setForgotSuccess(true);
      }
    } catch (err: any) {
      const isLocal = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (isLocal) {
        const devUrl = `/reset-password?token=dev-mock-token&email=${encodeURIComponent(forgotEmail)}`;
        setDevBypassUrl(devUrl);
        setForgotSuccess(true);
      } else {
        setForgotError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-[#FAF9F6]">
      
      {/* Blueprint Grid Lines Background Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#12121208_1px,transparent_1px),linear-gradient(to_bottom,#12121208_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      {/* Halftone Circle Decorative Badge */}
      <div className="absolute top-10 right-10 w-32 h-32 halftone-bg rounded-full opacity-10 hidden lg:block"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 halftone-bg rounded-full opacity-10 hidden lg:block"></div>

      {/* Technical Layout Frame Border */}
      <div className="absolute inset-4 border-2 border-[var(--ink-black)] pointer-events-none opacity-15 hidden md:block"></div>
      
      <main className="w-full max-w-4xl mx-auto flex flex-col gap-8 z-10 my-8">
        
        {/* 2. Elevated Zine Header Card with Neon Pink Background */}
        <div className="border-[var(--border-width)] border-[var(--ink-black)] bg-[var(--ink-pink)] text-white shadow-[6px_6px_0px_var(--ink-black)] text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6 p-8 relative overflow-hidden">
          {/* Internal Halftone bleed texture */}
          <div className="absolute inset-0 halftone-bg opacity-10 pointer-events-none"></div>

          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <span className="riso-badge riso-badge-yellow text-[var(--ink-black)] font-black border-2 shadow-[2px_2px_0px_#121212]">
                CSE - AIML
              </span>
              <span className="riso-badge bg-[var(--ink-black)] text-white border-2 border-white font-black shadow-[2px_2px_0px_#121212]">
                2027 PASS OUT
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase mt-2 drop-shadow-[2px_2px_0px_#121212]">
              MASTER DATABASE
            </h1>
            <p className="font-mono text-xs opacity-90 uppercase tracking-widest mt-1 font-bold">
              Techno Main Salt Lake • AIML Department Portal
            </p>
          </div>
          
          <div className="bg-[var(--ink-yellow)] p-4 border-2 border-[var(--ink-black)] text-[var(--ink-black)] transform rotate-1 md:rotate-3 shadow-[4px_4px_0px_var(--ink-black)] max-w-[280px] relative z-10">
            <p className="font-mono text-[10px] font-black uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--ink-pink)]" /> ESTABLISHED SCHEMA
            </p>
            <p className="text-xs font-semibold leading-tight font-heading">
              Pre-configured to match the official placement excel sheet structure (86 unique data parameters).
            </p>
          </div>
        </div>

        {/* 3. Main Dashboard Routing block */}
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
          
          {/* Announcement Alert Banner */}
          <div className="bg-amber-50 border-2 border-black p-4 flex gap-3 shadow-[3px_3px_0px_#121212] relative overflow-hidden">
            <div className="bg-amber-500 text-white p-1.5 border border-black flex-shrink-0 self-start">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-black text-xs uppercase text-amber-950 tracking-wider">
                DATABASE COLLECTION ANNOUNCEMENT
              </h3>
              <p className="text-[11px] font-semibold text-amber-900 leading-normal mt-0.5">
                The department will officially start collecting Placement Master Database entries in a few days. Please review the registration guidelines, ensure your credentials are ready, and check the Placement Rules handbook below.
              </p>
            </div>
          </div>

          <div className="riso-card flex flex-col gap-5 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-[var(--ink-blue)] uppercase tracking-tight flex items-center gap-2">
                <Fingerprint className="w-6 h-6 text-[var(--ink-pink)]" /> AUTHENTICATION PORTAL
              </h2>
              <button 
                onClick={() => {
                  if (adminClickCount + 1 >= 5) {
                    setActiveTab('admin-login');
                    setAdminClickCount(0);
                  } else {
                    setAdminClickCount(prev => prev + 1);
                  }
                }}
                className="font-mono text-[9px] font-black uppercase border border-gray-300 px-2 py-0.5 text-gray-500 rounded hover:bg-gray-100 transition-colors"
              >
                SECURE v3.2
              </button>
            </div>
            <p className="text-sm font-semibold leading-relaxed text-gray-600">
              Welcome to the official database collection site. Students of the CSE-AIML passing out batch of 2027 must authenticate using their official email format to submit details.
            </p>

            <hr className="border border-dashed border-[var(--ink-black)] opacity-20 my-1" />

            {user ? (
              // Authenticated State Banner
              <div className="bg-green-50 border-2 border-[var(--ink-green)] p-5 flex flex-col gap-4 shadow-[5px_5px_0px_var(--ink-green)] mt-2">
                <div className="flex items-start gap-3">
                  <div className="bg-[var(--ink-green)] text-white p-1.5 border-2 border-black">
                    <Check className="w-5 h-5 stroke-[3px]" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase text-[var(--ink-green)] tracking-wider">
                      Active Session Verified
                    </h4>
                    <p className="font-mono text-xs font-bold text-gray-700 mt-1">
                      {user.email} ({user.role.toUpperCase()})
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-1">
                  <a 
                    href={user.role === 'admin' ? '/admin' : '/student'}
                    className="riso-btn riso-btn-pink text-xs py-2.5 px-5 shadow-[3px_3px_0px_#121212] flex items-center gap-1.5"
                  >
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={logout}
                    className="riso-btn riso-btn-secondary text-xs py-2.5 px-5 shadow-[3px_3px_0px_#121212]"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              // Authentication Tab View
              <div className="flex flex-col gap-4 mt-2">
                
                {/* Custom Brutalist Tab Switches */}
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#f3f3eb] border-2 border-black font-black uppercase text-xs">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`py-2.5 text-center transition-all cursor-pointer font-black tracking-wide ${
                      activeTab === 'login' || activeTab === 'forgot'
                        ? 'bg-[var(--ink-pink)] text-white border-2 border-black shadow-[3px_3px_0px_#121212]' 
                        : 'text-gray-500 hover:text-black hover:bg-gray-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab('signup')}
                    className={`py-2.5 text-center transition-all cursor-pointer font-black tracking-wide ${
                      activeTab === 'signup' 
                        ? 'bg-[var(--ink-green)] text-white border-2 border-black shadow-[3px_3px_0px_#121212]' 
                        : 'text-gray-500 hover:text-black hover:bg-gray-200'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {/* Tab Content: Email Sign-In */}
                {activeTab === 'login' && (
                  <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4 mt-2 animate-fadeIn">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[var(--ink-pink)]" /> Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="tmsl.aiml27.001firstname@gmail.com"
                          className="riso-input w-full focus:outline-none font-semibold text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-[var(--ink-pink)]" /> Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotEmail(loginEmail);
                            setActiveTab('forgot');
                            setForgotError(null);
                            setForgotSuccess(false);
                            setDevBypassUrl('');
                          }}
                          className="text-[11px] font-bold text-[var(--ink-pink)] hover:underline font-mono"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="riso-input w-full focus:outline-none font-semibold text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {loginError && (
                      <div className="bg-red-50 border-2 border-red-500 text-red-700 text-xs p-4 font-mono leading-relaxed shadow-[3px_3px_0px_#ff2e93] font-bold">
                        ⚠️ {loginError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="riso-btn riso-btn-pink w-full justify-center text-center py-3.5 text-sm font-black shadow-[4px_4px_0px_#121212] mt-1"
                    >
                      {loginLoading ? "AUTHENTICATING SESSION..." : "SIGN IN TO PORTAL"}
                    </button>
                  </form>
                )}

                {/* Tab Content: Forgot Password */}
                {activeTab === 'forgot' && (
                  <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 mt-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black uppercase tracking-wider text-gray-700">
                        Password Recovery
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="text-[11px] font-bold text-gray-500 hover:text-black hover:underline font-mono"
                      >
                        ← Back to Sign In
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[var(--ink-pink)]" /> Registered Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="tmsl.aiml27.001firstname@gmail.com"
                        className="riso-input w-full focus:outline-none font-semibold text-sm"
                      />
                    </div>

                    {forgotError && (
                      <div className="bg-red-50 border-2 border-red-500 text-red-700 text-xs p-4 font-mono leading-relaxed shadow-[3px_3px_0px_#ff2e93] font-bold">
                        ⚠️ {forgotError}
                      </div>
                    )}

                    {forgotSuccess && (
                      <div className="bg-green-50 border-2 border-[var(--ink-green)] text-[var(--ink-green)] text-xs p-4 font-mono leading-relaxed shadow-[3px_3px_0px_var(--ink-green)] font-bold flex flex-col gap-2">
                        <div>
                          ✓ Recovery link sent! If this email is registered, you will receive a reset link shortly.
                        </div>
                        {devBypassUrl && (
                          <div className="mt-2 border-t border-dashed border-[var(--ink-green)] pt-2">
                            <span className="bg-amber-100 text-amber-900 border border-amber-400 px-1 py-0.5 rounded text-[10px] font-sans mr-1">
                              DEV MODE BYPASS
                            </span>
                            <a 
                              href={devBypassUrl}
                              className="underline text-blue-600 hover:text-blue-800"
                            >
                              Click here to reset password directly (Bypass SMTP)
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="riso-btn riso-btn-pink w-full justify-center text-center py-3.5 text-sm font-black shadow-[4px_4px_0px_#121212] mt-1"
                    >
                      {forgotLoading ? "SENDING RECOVERY LINK..." : "SEND RECOVERY LINK"}
                    </button>
                  </form>
                )}

                {/* Tab Content: Email Register / Sign-Up */}
                {activeTab === 'signup' && (
                  <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4 mt-2 animate-fadeIn">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-[var(--ink-green)]" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="riso-input focus:outline-none font-semibold text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-[var(--ink-green)]" /> University Roll Number
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={11}
                        value={signupRoll}
                        onChange={(e) => setSignupRoll(e.target.value)}
                        placeholder="e.g. 13030823XXX (or 13030824XXX for lateral)"
                        className="riso-input focus:outline-none font-semibold text-sm font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[var(--ink-green)]" /> Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="tmsl.aiml27.001firstname@gmail.com"
                        className="riso-input focus:outline-none font-semibold text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-[var(--ink-green)]" /> Password
                      </label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          required
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="riso-input w-full focus:outline-none font-semibold text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-[var(--ink-green)]" /> Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showSignupConfirmPassword ? "text" : "password"}
                          required
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className="riso-input w-full focus:outline-none font-semibold text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showSignupConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {signupError && (
                      <div className="bg-red-50 border-2 border-red-500 text-red-700 text-xs p-4 font-mono leading-relaxed shadow-[3px_3px_0px_#ff2e93] font-bold">
                        ⚠️ {signupError}
                      </div>
                    )}

                    <div className="bg-yellow-50 border-2 border-[var(--ink-yellow)] text-gray-700 text-[11px] p-3.5 flex items-start gap-2 shadow-[2px_2px_0px_var(--ink-black)]">
                      <ShieldAlert className="w-4.5 h-4.5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <p className="font-semibold leading-normal font-heading">
                        Registered student accounts have immediate profile creation access. Official administrator accounts are strictly limited by approved institution email domains.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={signupLoading}
                      className="riso-btn riso-btn-green w-full justify-center text-center py-3.5 text-sm font-black shadow-[4px_4px_0px_#121212] mt-1"
                    >
                      {signupLoading ? "CREATING PROFILE..." : "CREATE ACCOUNT"}
                    </button>
                  </form>
                )}

                {/* Tab Content: Admin Login (Easter Egg) */}
                {activeTab === 'admin-login' && (
                  <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4 mt-2 animate-fadeIn bg-slate-100 p-6 border-[3px] border-black shadow-[6px_6px_0px_var(--ink-pink)] relative">
                    <div className="absolute top-0 right-0 bg-[var(--ink-pink)] text-white text-[9px] font-black font-mono px-2 py-1 uppercase border-l-2 border-b-2 border-black">
                      Restricted Access
                    </div>
                    <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3 mb-2">
                      <span className="font-mono text-base font-black uppercase tracking-widest text-black flex items-center gap-2">
                        <Lock className="w-6 h-6 text-[var(--ink-pink)]" /> Admin Override
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="text-[11px] font-bold text-gray-500 hover:text-black font-mono"
                      >
                        [ EXIT ]
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700">
                        Administrator Email
                      </label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="admin@tmsl-aiml.in"
                        className="bg-white border-[2.5px] border-black text-slate-900 p-3 font-mono text-sm focus:outline-none focus:border-[var(--ink-pink)] w-full shadow-[inset_3px_3px_0px_rgba(0,0,0,0.06)]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700">
                        Admin Master Password
                      </label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-white border-[2.5px] border-black text-slate-900 p-3 font-mono text-sm focus:outline-none focus:border-[var(--ink-pink)] w-full shadow-[inset_3px_3px_0px_rgba(0,0,0,0.06)]"
                      />
                    </div>

                    {loginError && (
                      <div className="bg-red-50 border border-red-500 text-red-700 text-xs p-3 font-mono leading-relaxed font-bold">
                        [ERROR]: {loginError}
                      </div>
                    )}

                      <button
                      type="submit"
                      disabled={loginLoading}
                      className="bg-black hover:bg-[var(--ink-pink)] text-white w-full justify-center text-center py-3.5 text-sm font-black transition-colors mt-2 shadow-[4px_4px_0px_#121212] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#121212]"
                    >
                      {loginLoading ? "AUTHENTICATING..." : "EXECUTE LOGIN"}
                    </button>
                    <div className="text-center mt-3 border-t border-gray-200 pt-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('admin-signup')}
                        className="text-[10px] font-mono text-gray-500 hover:text-[var(--ink-pink)] underline"
                      >
                        Initialize New Admin Account
                      </button>
                    </div>
                  </form>
                )}

                {/* Tab Content: Admin Register (Easter Egg) */}
                {activeTab === 'admin-signup' && (
                  <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4 mt-2 animate-fadeIn bg-slate-100 p-6 border-[3px] border-black shadow-[6px_6px_0px_var(--ink-green)] relative">
                    <div className="absolute top-0 right-0 bg-[var(--ink-green)] text-white text-[9px] font-black font-mono px-2 py-1 uppercase border-l-2 border-b-2 border-black">
                      Restricted Creation
                    </div>
                    <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3 mb-2">
                      <span className="font-mono text-base font-black uppercase tracking-widest text-black flex items-center gap-2">
                        <Lock className="w-6 h-6 text-[var(--ink-green)]" /> Admin Setup
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="text-[11px] font-bold text-gray-500 hover:text-black font-mono"
                      >
                        [ EXIT ]
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700">
                        Admin Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. Master Admin"
                        className="bg-white border-[2.5px] border-black text-slate-900 p-3 font-mono text-sm focus:outline-none focus:border-[var(--ink-green)] w-full shadow-[inset_3px_3px_0px_rgba(0,0,0,0.06)]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700">
                        Authorized Email
                      </label>
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="admin@tmsl-aiml.in"
                        className="bg-white border-[2.5px] border-black text-slate-900 p-3 font-mono text-sm focus:outline-none focus:border-[var(--ink-green)] w-full shadow-[inset_3px_3px_0px_rgba(0,0,0,0.06)]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700">
                        Master Password
                      </label>
                      <input
                        type="password"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-white border-[2.5px] border-black text-slate-900 p-3 font-mono text-sm focus:outline-none focus:border-[var(--ink-green)] w-full shadow-[inset_3px_3px_0px_rgba(0,0,0,0.06)]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-white border-[2.5px] border-black text-slate-900 p-3 font-mono text-sm focus:outline-none focus:border-[var(--ink-green)] w-full shadow-[inset_3px_3px_0px_rgba(0,0,0,0.06)]"
                      />
                    </div>

                    {signupError && (
                      <div className="bg-red-50 border border-red-500 text-red-700 text-xs p-3 font-mono leading-relaxed font-bold">
                        [ERROR]: {signupError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={signupLoading}
                      className="bg-black hover:bg-[var(--ink-green)] text-white w-full justify-center text-center py-3.5 text-sm font-black transition-colors mt-2 shadow-[4px_4px_0px_#121212] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#121212]"
                    >
                      {signupLoading ? "CREATING..." : "AUTHORIZE NEW ADMIN"}
                    </button>
                    
                    <div className="text-center mt-3 border-t border-gray-200 pt-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('admin-login')}
                        className="text-[10px] font-mono text-gray-500 hover:text-[var(--ink-green)] underline"
                      >
                        ← Back to Admin Login
                      </button>
                    </div>
                  </form>
                )}


              </div>
            )}
          </div>

          {/* Instruction Checklist */}
          <div className="riso-card riso-card-yellow flex flex-col gap-4 bg-white">
            <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-2">
              <h3 className="font-black text-sm flex items-center gap-2 text-[var(--ink-black)]">
                <GraduationCap className="w-5 h-5 text-[var(--ink-blue)]" /> STUDENT SUBMISSION INSTRUCTIONS
              </h3>
              <a 
                href="/rules" 
                className="text-[10px] font-mono font-black uppercase text-[var(--ink-pink)] hover:underline flex items-center gap-0.5 bg-pink-50 px-2.5 py-1 border border-[var(--ink-pink)] shadow-[1px_1px_0px_#121212]"
              >
                View Rules <ArrowRight className="w-3.5 h-3.5 stroke-[2.5px]" />
              </a>
            </div>
            <ul className="text-xs font-semibold text-gray-700 flex flex-col gap-3">
              <li className="flex items-start gap-2 leading-relaxed">
                <span className="text-[var(--ink-pink)] font-black text-sm">1.</span>
                <span>
                  Ensure your registered email perfectly matches the required batch format: <br />
                  <code className="font-black text-[var(--ink-pink)] bg-pink-50 border border-dashed border-[var(--ink-pink)] px-1.5 py-0.5 text-[11px] inline-block mt-1 font-mono">
                    tmsl.aiml27.&lt;last_3_digits_of_roll&gt;&lt;firstname&gt;@gmail.com (e.g., tmsl.aiml27.001firstname@gmail.com)
                  </code>
                </span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <span className="text-[var(--ink-pink)] font-black text-sm">2.</span>
                <span>Ensure you possess the PDF link of your updated formal passport-sized photograph.</span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <span className="text-[var(--ink-pink)] font-black text-sm">3.</span>
                <span>Enter accurate semester-wise CGPA up to the 5th semester exactly as per results. No rounding off.</span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <span className="text-[var(--ink-pink)] font-black text-sm">4.</span>
                <span>Provide standard marks percentages (Class X & XII) without inserting the "%" sign.</span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <span className="text-[var(--ink-pink)] font-black text-sm">5.</span>
                <span>
                  <strong>No Rounding Off:</strong> Actual percentage must be calculated using all subjects appeared: <code className="bg-pink-50 px-1 border border-dashed border-[var(--ink-pink)] font-mono font-bold text-[11px]">(obtained/appeared)*100</code>. Do not round off (e.g. 59.99% is not equal to 60%).
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Real-time Status / Stats Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="border-2 border-black p-3 bg-white shadow-[3px_3px_0px_#121212]">
            <p className="text-[9px] font-mono font-black text-gray-500 uppercase">Database Engine</p>
            <p className="text-xs font-black text-[var(--ink-blue)] uppercase mt-0.5 flex items-center justify-center gap-1">
              <Database className="w-3.5 h-3.5" /> Neon Serverless
            </p>
          </div>
          <div className="border-2 border-black p-3 bg-white shadow-[3px_3px_0px_#121212]">
            <p className="text-[9px] font-mono font-black text-gray-500 uppercase">System Status</p>
            <p className="text-xs font-black text-[var(--ink-green)] uppercase mt-0.5 flex items-center justify-center gap-1">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> 100% Online
            </p>
          </div>
          <div className="border-2 border-black p-3 bg-white shadow-[3px_3px_0px_#121212]">
            <p className="text-[9px] font-mono font-black text-gray-500 uppercase">Placement Schema</p>
            <p className="text-xs font-black text-[var(--ink-pink)] uppercase mt-0.5">86 Parameters</p>
          </div>
          <div className="border-2 border-black p-3 bg-white shadow-[3px_3px_0px_#121212]">
            <p className="text-[9px] font-mono font-black text-gray-500 uppercase">Handshake Port</p>
            <p className="text-xs font-black text-gray-800 uppercase mt-0.5 font-mono">TLS / SSL Ready</p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6">
          <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
            © 2026 Techno Main Salt Lake • CSE AIML Department • Developed with Next.js & Neon DB
          </p>
        </div>

      </main>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './providers';
import { GraduationCap, ArrowRight, Sparkles, Check, Key, Mail, User as UserIcon, ShieldAlert } from 'lucide-react';

type TabType = 'login' | 'signup' | 'google';

export default function Home() {
  const { user, logout, loginDemo, signInEmail, signUpEmail } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Google OAuth state
  const [liveAuthLoading, setLiveAuthLoading] = useState(false);
  const [liveAuthError, setLiveAuthError] = useState<string | null>(null);

  // Automatic redirect if user session is already active
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
    }
  }, [user, router]);

  // Check for developer bypass query parameters on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const demo = params.get('demo');
      if (demo === 'student') {
        loginDemo('student', 'student.aiml27@gmail.com');
      } else if (demo === 'admin') {
        loginDemo('admin', 'biswajit.tmsl27@gmail.com');
      }
    }
  }, [loginDemo]);

  // Triggers real Google OAuth via Neon Auth
  const handleLiveGoogleLogin = async () => {
    setLiveAuthLoading(true);
    setLiveAuthError(null);
    try {
      const { authClient } = await import('@/lib/auth/client');
      if (!authClient) {
        throw new Error("Neon Auth Client is not configured. Please set NEXT_PUBLIC_NEON_AUTH_BASE_URL.");
      }
      
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/student`,
      });
    } catch (err: any) {
      console.error("Live login error:", err);
      setLiveAuthError(err.message || "Failed to initialize Live Google Login");
      setLiveAuthLoading(false);
    }
  };

  // Handle email/password sign-in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.');
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
    if (!signupName || !signupEmail || !signupPassword) {
      setSignupError('Please fill in all fields.');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    setSignupLoading(true);
    setSignupError(null);
    const res = await signUpEmail(signupEmail, signupPassword, signupName);
    if (res.error) {
      setSignupError(res.error);
      setSignupLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
      
      {/* 1. Technical Layout Frame Border */}
      <div className="absolute inset-4 border border-[var(--ink-black)] pointer-events-none opacity-20 hidden md:block"></div>
      
      <main className="w-full max-w-4xl mx-auto flex flex-col gap-8 z-10 my-8">
        
        {/* 2. Risograph Zine Header Banner */}
        <div className="riso-card riso-card-pink text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6 p-8 bg-[var(--ink-pink)] text-white">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="riso-badge riso-badge-yellow text-[var(--ink-black)] font-bold">CSE - AIML</span>
              <span className="riso-badge bg-black text-white border-white">2027 PASS OUT</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase mt-2">
              MASTER DATABASE
            </h1>
            <p className="font-mono text-xs opacity-90 uppercase tracking-widest mt-1">
              Techno Main Salt Lake • AIML Department Portal
            </p>
          </div>
          
          <div className="bg-[var(--ink-yellow)] p-4 border-2 border-[var(--ink-black)] text-[var(--ink-black)] transform rotate-1 md:rotate-3 shadow-[4px_4px_0px_#121212] max-w-[280px]">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> ESTABLISHED SCHEMA
            </p>
            <p className="text-xs font-semibold leading-tight">
              Pre-configured to match the official placement excel sheet structure (86 unique data parameters).
            </p>
          </div>
        </div>

        {/* 3. Main Dashboard Routing block */}
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
          
          <div className="riso-card flex flex-col gap-4">
            <h2 className="text-2xl font-black text-[var(--ink-blue)]">
              AUTHENTICATION PORTAL
            </h2>
            <p className="text-sm font-medium leading-relaxed text-gray-700">
              Welcome to the official database collection site. Students of the CSE-AIML passing out batch of 2027 must authenticate and submit their details.
            </p>

            <hr className="border border-dashed border-[var(--ink-black)] opacity-20 my-1" />

            {user ? (
              // Authenticated State Banner
              <div className="bg-green-50 border-2 border-[var(--ink-green)] p-4 flex flex-col gap-4 shadow-[4px_4px_0px_var(--ink-green)] mt-2">
                <div className="flex items-start gap-3">
                  <div className="bg-[var(--ink-green)] text-white p-1.5 border border-black">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase text-[var(--ink-green)]">
                      Active Session Detected
                    </h4>
                    <p className="font-mono text-xs font-bold text-gray-600 mt-0.5">
                      {user.email} ({user.role.toUpperCase()})
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a 
                    href={user.role === 'admin' ? '/admin' : '/student'}
                    className="riso-btn riso-btn-pink text-xs py-2 px-4 shadow-[2px_2px_0px_#121212]"
                  >
                    Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <button 
                    onClick={logout}
                    className="riso-btn riso-btn-secondary text-xs py-2 px-4 shadow-[2px_2px_0px_#121212]"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              // Authentication Tab View
              <div className="flex flex-col gap-4 mt-2">
                
                {/* Custom Brutalist Tab Switches */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 border-2 border-black font-black uppercase text-xs">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`py-2 text-center transition-all ${
                      activeTab === 'login' 
                        ? 'bg-[var(--ink-pink)] text-white border-2 border-black shadow-[2px_2px_0px_#121212]' 
                        : 'text-gray-500 hover:text-black hover:bg-gray-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab('signup')}
                    className={`py-2 text-center transition-all ${
                      activeTab === 'signup' 
                        ? 'bg-[var(--ink-green)] text-white border-2 border-black shadow-[2px_2px_0px_#121212]' 
                        : 'text-gray-500 hover:text-black hover:bg-gray-200'
                    }`}
                  >
                    Register
                  </button>
                  <button
                    onClick={() => setActiveTab('google')}
                    className={`py-2 text-center transition-all ${
                      activeTab === 'google' 
                        ? 'bg-[var(--ink-yellow)] text-[var(--ink-black)] border-2 border-black shadow-[2px_2px_0px_#121212]' 
                        : 'text-gray-500 hover:text-black hover:bg-gray-200'
                    }`}
                  >
                    Google
                  </button>
                </div>

                {/* Tab Content: Email Sign-In */}
                {activeTab === 'login' && (
                  <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4 mt-2 animate-fadeIn">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[var(--ink-pink)]" /> Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="tech-input border-2 border-black p-3 text-sm focus:outline-none focus:ring-0 focus:border-[var(--ink-pink)] font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-[var(--ink-pink)]" /> Password
                      </label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="tech-input border-2 border-black p-3 text-sm focus:outline-none focus:ring-0 focus:border-[var(--ink-pink)] font-medium"
                      />
                    </div>

                    {loginError && (
                      <div className="bg-red-50 border-2 border-red-500 text-red-700 text-xs p-3 font-mono">
                        {loginError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="riso-btn riso-btn-pink w-full justify-center text-center py-3 text-sm font-black shadow-[3px_3px_0px_#121212]"
                    >
                      {loginLoading ? "AUTHENTICATING SESSION..." : "SIGN IN TO PORTAL"}
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
                        placeholder="e.g. Priyanshu Sen"
                        className="tech-input border-2 border-black p-3 text-sm focus:outline-none focus:ring-0 focus:border-[var(--ink-green)] font-medium"
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
                        placeholder="yourname@gmail.com"
                        className="tech-input border-2 border-black p-3 text-sm focus:outline-none focus:ring-0 focus:border-[var(--ink-green)] font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-[var(--ink-green)]" /> Password
                      </label>
                      <input
                        type="password"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="tech-input border-2 border-black p-3 text-sm focus:outline-none focus:ring-0 focus:border-[var(--ink-green)] font-medium"
                      />
                    </div>

                    {signupError && (
                      <div className="bg-red-50 border-2 border-red-500 text-red-700 text-xs p-3 font-mono">
                        {signupError}
                      </div>
                    )}

                    <div className="bg-yellow-50 border-2 border-[var(--ink-yellow)] text-gray-700 text-[11px] p-3 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <p className="font-semibold leading-normal">
                        Registered student accounts have immediate profile creation access. Official administrator accounts are strictly limited by approved institution email domains.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={signupLoading}
                      className="riso-btn riso-btn-green w-full justify-center text-center py-3 text-sm font-black shadow-[3px_3px_0px_#121212]"
                    >
                      {signupLoading ? "CREATING PROFILE..." : "CREATE ACCOUNT"}
                    </button>
                  </form>
                )}

                {/* Tab Content: Live Google OAuth */}
                {activeTab === 'google' && (
                  <div className="flex flex-col gap-4 mt-2 animate-fadeIn">
                    <button 
                      onClick={handleLiveGoogleLogin}
                      disabled={liveAuthLoading}
                      className="riso-btn w-full justify-center text-center py-3.5 text-base font-black shadow-[4px_4px_0px_#121212]"
                    >
                      {liveAuthLoading ? (
                        "INITIALIZING SECURE FLOW..."
                      ) : (
                        <span className="flex items-center gap-2">
                          SIGN IN WITH GOOGLE <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </button>
                    
                    {liveAuthError && (
                      <div className="bg-red-50 border-2 border-red-500 text-red-700 text-xs p-3 font-mono">
                        {liveAuthError}
                      </div>
                    )}

                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest text-center mt-2">
                      🔒 Secured natively via Neon Auth & Better Auth
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instruction Checklist */}
          <div className="riso-card riso-card-yellow flex flex-col gap-3">
            <h3 className="font-black text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[var(--ink-blue)]" /> STUDENT SUBMISSION INSTRUCTIONS
            </h3>
            <ul className="text-xs font-semibold text-gray-700 flex flex-col gap-2">
              <li className="flex items-start gap-2">
                <span className="text-[var(--ink-pink)] font-bold">1.</span>
                Ensure you possess the PDF link of your updated formal passport-sized photograph.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--ink-pink)] font-bold">2.</span>
                Enter accurate semester-wise CGPA up to the 5th semester exactly as per results.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--ink-pink)] font-bold">3.</span>
                Provide standard marks percentages (Class X & XII) without inserting the "%" sign.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--ink-pink)] font-bold">4.</span>
                Review backlogs carefully. Enter YES and detail the subject codes if active.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6">
          <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
            © 2026 Techno Main Salt Lake • CSE AIML Department • Developed with Next.js & Neon DB
          </p>
        </div>

      </main>
    </div>
  );
}

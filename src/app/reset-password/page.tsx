'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Key, 
  Check, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Lock
} from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email') || '';

  // Passwords state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Submit state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('Invalid or expired reset token.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { authClient } = await import('@/lib/auth/client');
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token
      });

      if (resetError) {
        setError(resetError.message || 'Failed to reset password.');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="riso-card flex flex-col gap-5 bg-white border-red-500 shadow-[5px_5px_0px_#ff2e93]">
        <div className="bg-red-50 border-2 border-red-500 text-red-700 text-xs p-4 font-mono leading-relaxed font-bold">
          ⚠️ Invalid Reset Link: Token is missing or expired. Please request a new password recovery link.
        </div>
        <button
          onClick={() => router.push('/')}
          className="riso-btn riso-btn-pink justify-center py-3 text-sm font-black shadow-[3px_3px_0px_#121212]"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="riso-card flex flex-col gap-5 bg-white border-[var(--ink-green)] shadow-[5px_5px_0px_var(--ink-green)]">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--ink-green)] text-white p-1.5 border-2 border-black">
            <Check className="w-5 h-5 stroke-[3px]" />
          </div>
          <div>
            <h4 className="font-black text-sm uppercase text-[var(--ink-green)] tracking-wider">
              Password Reset Complete
            </h4>
            <p className="text-xs text-gray-600 mt-1 font-semibold">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/')}
          className="riso-btn riso-btn-pink justify-center py-3.5 text-sm font-black shadow-[4px_4px_0px_#121212] mt-2 flex items-center gap-2"
        >
          Go to Sign In <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="riso-card flex flex-col gap-5 bg-white">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[var(--ink-blue)] uppercase tracking-tight flex items-center gap-2">
          <Lock className="w-6 h-6 text-[var(--ink-pink)]" /> RESET PASSWORD
        </h2>
      </div>
      
      {emailParam && (
        <p className="text-xs font-mono text-gray-500 bg-gray-50 p-2 border border-dashed border-gray-200">
          Account Email: <strong className="text-gray-800">{emailParam}</strong>
        </p>
      )}

      <p className="text-sm font-semibold leading-relaxed text-gray-600">
        Please enter and confirm your new account password. It must be at least 6 characters long.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-[var(--ink-pink)]" /> New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="riso-input w-full focus:outline-none font-semibold text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-[var(--ink-pink)]" /> Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="riso-input w-full focus:outline-none font-semibold text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-500 text-red-700 text-xs p-4 font-mono leading-relaxed shadow-[3px_3px_0px_#ff2e93] font-bold">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="riso-btn riso-btn-pink w-full justify-center text-center py-3.5 text-sm font-black shadow-[4px_4px_0px_#121212] mt-1"
        >
          {loading ? "RESETTING PASSWORD..." : "UPDATE PASSWORD"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-[#FAF9F6] min-h-screen">
      
      {/* Blueprint Grid Lines Background Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#12121208_1px,transparent_1px),linear-gradient(to_bottom,#12121208_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      {/* Technical Layout Frame Border */}
      <div className="absolute inset-4 border-2 border-[var(--ink-black)] pointer-events-none opacity-15 hidden md:block"></div>
      
      <main className="w-full max-w-2xl mx-auto flex flex-col gap-8 z-10 my-8">
        
        {/* Elevated Zine Header Card with Neon Pink Background */}
        <div className="border-[var(--border-width)] border-[var(--ink-black)] bg-[var(--ink-pink)] text-white shadow-[6px_6px_0px_var(--ink-black)] text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6 p-8 relative overflow-hidden">
          <div className="absolute inset-0 halftone-bg opacity-10 pointer-events-none"></div>

          <div className="flex flex-col gap-2 relative z-10 text-left w-full">
            <div className="flex items-center justify-start gap-2 flex-wrap">
              <span className="riso-badge riso-badge-yellow text-[var(--ink-black)] font-black border-2 shadow-[2px_2px_0px_#121212]">
                CSE - AIML
              </span>
              <span className="riso-badge bg-[var(--ink-black)] text-white border-2 border-white font-black shadow-[2px_2px_0px_#121212]">
                SECURE CREDENTIALS
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none uppercase mt-2 drop-shadow-[2px_2px_0px_#121212]">
              PASSWORD RESTORATION
            </h1>
            <p className="font-mono text-xs opacity-90 uppercase tracking-widest mt-1 font-bold">
              Techno Main Salt Lake • Authentication Server
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-6">
          <Suspense fallback={
            <div className="riso-card flex flex-col items-center justify-center p-12 bg-white">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--ink-pink)]"></div>
              <span className="mt-4 font-mono text-xs font-bold text-gray-500 uppercase">
                Loading Reset Session...
              </span>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6">
          <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
            © 2026 Techno Main Salt Lake • CSE AIML Department • Security Handshake TLS
          </p>
        </div>

      </main>
    </div>
  );
}

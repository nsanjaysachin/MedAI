import React, { useState } from 'react';
import { Activity, ShieldCheck, Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2, FileText, HeartPulse } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';
import { signInWithGoogle } from '../lib/firebase';

interface LoginScreenProps {
  onSuccess: (user: UserType) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { user: fbUser } = await signInWithGoogle();
      const res = await api.loginGoogle({
        id: fbUser.id,
        name: fbUser.name,
        email: fbUser.email,
      });
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Google authentication could not be completed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim() || !email.trim()) {
          throw new Error('Please enter your full name and valid email address');
        }
        const res = await api.register({
          name,
          email,
          date_of_birth: dob,
          gender,
        });
        onSuccess(res.user);
      } else {
        if (!email.trim()) {
          throw new Error('Please enter your email address');
        }
        const res = await api.login(email);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-teal-500/20">
      {/* Top Brand Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-lg tracking-tight">MEDAI</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Patient Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Medical Report Understanding & Timeline</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Confidential & Private Medical Workspace</span>
        </div>
      </header>

      {/* Main Login Screen Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-7 sm:p-9">
            
            {/* Header / Intro */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isRegister ? 'Create Your Health Account' : 'Welcome to MEDAI'}
              </h1>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {isRegister 
                  ? 'Sign up to upload your lab results and track your biomarkers over time.' 
                  : 'Sign in to access your decoded medical reports, timelines, and insights.'}
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Hero 1-Click Google Authentication */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-800 font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {/* SVG Google Multi-color Logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google Account</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Verified Google Firebase Authentication</span>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-slate-400 font-medium absolute">
                Or sign in with email
              </span>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isRegister && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 block">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                      required={isRegister}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-700 block">Password</label>
                  {!isRegister && (
                    <span className="text-[10px] text-teal-600 hover:text-teal-700 font-medium cursor-pointer">
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                    required
                  />
                </div>
              </div>

              {isRegister && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 block">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 block">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                    >
                      <option value="">Select (Optional)</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In with Email'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Toggle Login / Register */}
            <div className="text-center pt-5 text-xs text-slate-500">
              {isRegister ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setError(null);
                    }}
                    className="font-semibold text-teal-600 hover:text-teal-700 cursor-pointer underline underline-offset-2"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don&apos;t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(true);
                      setError(null);
                    }}
                    className="font-semibold text-teal-600 hover:text-teal-700 cursor-pointer underline underline-offset-2"
                  >
                    Create one now
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Medical Notice & Privacy Guarantee */}
          <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-500 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-700">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <span>Educational & Organizing Assistant Notice</span>
            </div>
            <p className="leading-relaxed">
              MEDAI provides educational summaries, terminology definitions, and visual timeline comparisons of your medical test results. It does not provide medical diagnoses, treatment decisions, or prescriptions. Always consult a qualified physician for healthcare advice.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
        <div>&copy; {new Date().getFullYear()} MEDAI. Confidential Patient Health Intelligence.</div>
        <div className="flex items-center gap-4">
          <span>Encrypted Transmission</span>
          <span>&bull;</span>
          <span>Zero Third-Party Ad Tracking</span>
          <span>&bull;</span>
          <span>HIPAA-Ready Architecture</span>
        </div>
      </footer>
    </div>
  );
};

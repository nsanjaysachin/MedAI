import React, { useState } from 'react';
import { Activity, Sparkles, Mail, User, AlertCircle, LogIn, CheckCircle2, X } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';
import { signInWithGoogle } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
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
        const res = await api.register({
          name,
          email,
          date_of_birth: dob,
          gender,
        });
        onSuccess(res.user);
      } else {
        const res = await api.login(email);
        onSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 text-sm p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-11 h-11 mx-auto rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isRegister ? 'Create Patient Vault' : 'Sign in to MEDAI'}
          </h2>
          <p className="text-xs text-slate-500">
            {isRegister
              ? 'Register your account to manage reports and analyze health markers'
              : 'Enter your patient credentials to access your health records'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
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
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[11px] text-slate-400 font-medium">or continue with email</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Full Name:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sanjay Sachin"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold">Email Address:</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@example.com"
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500"
            />
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Date of Birth:</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Biological Sex:</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-teal-500 cursor-pointer"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>{isRegister ? 'Complete Registration' : 'Sign In'}</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-teal-700 hover:text-teal-800 font-medium cursor-pointer"
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : "Don't have an account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
};

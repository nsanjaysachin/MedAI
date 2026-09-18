import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Trash2, 
  History, 
  CheckCircle2, 
  AlertTriangle,
  Key,
  Server,
  EyeOff
} from 'lucide-react';
import { User as UserType, AuditLog } from '../types';
import { api } from '../services/api';
import { MedicalDisclaimer } from './MedicalDisclaimer';

interface ProfilePageProps {
  user: UserType;
  onLogout: () => void;
  onUserUpdated: (u: UserType) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onLogout,
  onUserUpdated,
}) => {
  const [name, setName] = useState(user.name);
  const [dob, setDob] = useState(user.date_of_birth || '');
  const [gender, setGender] = useState(user.gender || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      const res = await api.getAuditLogs();
      setAuditLogs(res.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify({ name, date_of_birth: dob, gender }),
      });
      const data = await res.json();
      if (data.user) {
        onUserUpdated(data.user);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'Are you sure you want to permanently delete your account and all associated medical reports, markers, and timeline events? This action cannot be undone.'
    );
    if (confirmation) {
      try {
        await api.deleteAccount();
        onLogout();
      } catch (err) {
        console.error('Failed to delete account:', err);
      }
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-semibold text-teal-700 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Security & Patient Vault</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Account & Privacy Controls
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your personal patient details, inspect security logs, and review data privacy settings.
        </p>
      </div>

      <MedicalDisclaimer compact />

      {/* User Info Form */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            Patient Profile Information
          </h2>
          <span className="text-xs text-slate-400 font-mono">ID: {user.id}</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Full Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Email Address (Immutable):</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed"
              />
            </div>

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
              <label className="text-slate-700 font-semibold">Gender / Biological Sex:</label>
              <input
                type="text"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                placeholder="e.g., Female, Male, Other"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully</span>
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Privacy Architecture Guarantee */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-600" />
          Privacy & Data Protection Principles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900">No Public Indexing</span>
            <p className="text-slate-600 leading-relaxed">
              Your health documents are never published or accessible outside your authenticated session.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900">Zero Third-Party Ad Sharing</span>
            <p className="text-slate-600 leading-relaxed">
              We do not sell, broker, or monetize sensitive personal health information.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-900">Safe Multi-Tenant Isolation</span>
            <p className="text-slate-600 leading-relaxed">
              Database operations enforce rigorous user-ID filtering at both the API and query layers.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Log Transparency */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            Security Audit Trail
          </h2>
          <span className="text-xs text-slate-500 font-medium">Activity Log</span>
        </div>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-mono text-teal-700 font-semibold">{log.action}</span>
                <div className="text-[11px] text-slate-500">
                  Target: {log.resource_type} ({log.resource_id})
                </div>
              </div>
              <span className="font-mono text-[10px] text-slate-400">{log.created_at}</span>
            </div>
          ))}

          {auditLogs.length === 0 && (
            <div className="p-4 text-center text-slate-400 text-xs">
              No audit logs recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="p-6 sm:p-7 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          Danger Zone &bull; Permanent Account Deletion
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Permanently erase your patient profile, all uploaded clinical documents, lab markers, chat logs, and doctor questions. This cannot be reversed.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Permanently Delete All My Data</span>
        </button>
      </div>
    </div>
  );
};

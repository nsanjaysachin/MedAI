import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface MedicalDisclaimerProps {
  compact?: boolean;
  className?: string;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ compact = false, className = '' }) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 ${className}`}>
        <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <span>
          <strong>Educational use only:</strong> MEDAI does not provide medical diagnoses, prescribe treatments, or replace healthcare professionals.
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl bg-teal-50/60 border border-teal-200 text-slate-700 text-sm shadow-sm ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-teal-100 text-teal-700 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-slate-900 font-semibold text-sm mb-1">
            Important Medical Disclaimer
          </h4>
          <p className="text-slate-600 text-xs leading-relaxed">
            MEDAI provides educational information, terminology translation, and document organization only. It does <strong>not</strong> diagnose diseases, recommend medications, or substitute for consultation with a qualified physician or healthcare provider. Always discuss your lab results and medical decisions directly with your doctor.
          </p>
        </div>
      </div>
    </div>
  );
};

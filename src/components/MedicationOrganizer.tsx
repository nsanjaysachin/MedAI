import React, { useState } from 'react';
import { 
  Pill, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  AlertTriangle,
  X
} from 'lucide-react';
import { Medication } from '../types';
import { api } from '../services/api';
import { MedicalDisclaimer } from './MedicalDisclaimer';

interface MedicationOrganizerProps {
  medications: Medication[];
  onRefreshMedications: () => void;
}

export const MedicationOrganizer: React.FC<MedicationOrganizerProps> = ({
  medications,
  onRefreshMedications,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dose || !frequency) return;
    try {
      await api.addMedication({
        name,
        dose,
        frequency,
        start_date: startDate,
        notes,
      });
      setShowAddModal(false);
      setName('');
      setDose('');
      setFrequency('');
      setNotes('');
      onRefreshMedications();
    } catch (err) {
      console.error('Failed to add medication:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this medication record from your organizer?')) {
      try {
        await api.deleteMedication(id);
        onRefreshMedications();
      } catch (err) {
        console.error('Failed to delete medication:', err);
      }
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-semibold text-teal-700 mb-2">
            <Pill className="w-3.5 h-3.5 text-teal-600" />
            <span>Personal Health Organizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Medications & Supplements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Keep track of current prescriptions and supplements to share with your healthcare providers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2 w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Strict Medical Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-900">Organizer Notice & Safety Rules:</div>
          <p className="text-slate-700 leading-relaxed">
            MEDAI is an educational organization tool only. It does <strong>not</strong> prescribe medications, suggest dosages, evaluate drug interactions, or recommend changing or stopping treatments. Always consult your prescribing physician or pharmacist for all medication guidance.
          </p>
        </div>
      </div>

      {/* Medication Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.map((med) => (
          <div
            key={med.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 space-y-3 transition-all shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{med.name}</h3>
                  <div className="text-xs font-mono text-teal-700 font-semibold">{med.dose}</div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(med.id)}
                className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                title="Remove medication"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-mono">Frequency</span>
                <div className="text-slate-700 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{med.frequency}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-mono">Started</span>
                <div className="text-slate-700 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{med.start_date}</span>
                </div>
              </div>
            </div>

            {med.notes && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                <span className="text-[10px] text-slate-400 font-mono block">Physician Notes / Purpose:</span>
                {med.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {medications.length === 0 && (
        <div className="p-12 text-center text-slate-500 text-xs rounded-2xl bg-white border border-dashed border-slate-200 space-y-3">
          <Pill className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No medications logged yet</h3>
          <p className="max-w-md mx-auto">
            Click &quot;Add Medication&quot; to log current vitamins, supplements, or prescriptions for your medical records.
          </p>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add Medication or Supplement</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Medication Name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Vitamin D3, Atorvastatin, Metformin"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Dosage:</label>
                  <input
                    type="text"
                    required
                    value={dose}
                    onChange={(e) => setDose(e.target.value)}
                    placeholder="e.g., 2000 IU, 10 mg"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold">Frequency:</label>
                  <input
                    type="text"
                    required
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="e.g., Once daily with meal"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Notes / Prescribing Physician:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Recommended by Dr. Reynolds after routine lab check"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold cursor-pointer"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

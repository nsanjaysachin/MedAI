import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  FileText, 
  Pill, 
  Activity, 
  Stethoscope, 
  Sparkles, 
  ArrowUpRight,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { TimelineEvent } from '../types';
import { api } from '../services/api';
import { MedicalDisclaimer } from './MedicalDisclaimer';

interface HealthTimelineProps {
  events: TimelineEvent[];
  onSelectDocument: (docId: string) => void;
  onRefreshEvents: () => void;
}

export const HealthTimeline: React.FC<HealthTimelineProps> = ({
  events,
  onSelectDocument,
  onRefreshEvents,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newType, setNewType] = useState('Note');

  const filteredEvents = events.filter((e) => {
    if (selectedFilter === 'All') return true;
    return e.event_type.toLowerCase() === selectedFilter.toLowerCase() || e.category.toLowerCase() === selectedFilter.toLowerCase();
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      await api.addTimelineEvent({
        title: newTitle,
        description: newDesc,
        event_date: newDate,
        event_type: newType as any,
        category: newType,
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewDesc('');
      onRefreshEvents();
    } catch (err) {
      console.error('Failed to add event:', err);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'lab test':
        return <Activity className="w-4 h-4 text-teal-600" />;
      case 'prescription':
        return <Pill className="w-4 h-4 text-cyan-600" />;
      case 'doctor visit':
        return <Stethoscope className="w-4 h-4 text-emerald-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-semibold text-teal-700 mb-2">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Chronological Health Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Personal Health Timeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            A comprehensive record of your tests, reports, medications, and wellness notes over time.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2 w-fit cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Note or Event</span>
        </button>
      </div>

      <MedicalDisclaimer compact />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['All', 'Lab test', 'Prescription', 'Doctor visit', 'Note'].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedFilter === filter
                ? 'bg-teal-600 text-white font-semibold shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {filter === 'All' ? 'All Events' : filter}
          </button>
        ))}
      </div>

      {/* Vertical Timeline Tree */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs rounded-2xl bg-white border border-dashed border-slate-200 space-y-3">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No timeline events recorded yet</h3>
          <p className="max-w-md mx-auto">
            Events are automatically created when you upload lab reports and medications, or you can record doctor appointments and clinical notes.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8 ml-3 sm:ml-4">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="relative group">
              {/* Timeline Node Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
              </div>

              {/* Event Content Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500/50 hover:shadow-md transition-all space-y-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      {getEventIcon(ev.event_type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {ev.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-mono">{ev.event_date}</span>
                        <span>&bull;</span>
                        <span className="text-teal-700 font-medium">{ev.event_type}</span>
                      </div>
                    </div>
                  </div>

                  {ev.document_id && (
                    <button
                      onClick={() => onSelectDocument(ev.document_id!)}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 w-fit bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 cursor-pointer"
                    >
                      <span>View Linked Report</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {ev.description && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {ev.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add Timeline Event or Note</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Event Title:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Annual Physical Exam, Cholesterol Re-check"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Date:</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Event Type:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-teal-500 cursor-pointer"
                  >
                    <option value="Doctor visit">Doctor Visit</option>
                    <option value="Lab test">Lab Test</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Note">General Note</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Notes / Details:</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Clinical notes, doctor advice, or questions..."
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
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold cursor-pointer"
                >
                  Save to Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

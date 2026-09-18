import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Building2, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ArrowLeft, 
  Download, 
  Trash2, 
  Plus,
  Search, 
  Filter,
  Info,
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { MedicalDocument, MedicalMarker, MarkerCategory } from '../types';
import { MedicalDisclaimer } from './MedicalDisclaimer';
import { api } from '../services/api';

interface ReportDetailProps {
  document: MedicalDocument;
  onBack: () => void;
  onCompareWith: (docId: string) => void;
  onAskAssistant: (prompt: string) => void;
  onDeleteDocument: (docId: string) => void;
}

export const ReportDetail: React.FC<ReportDetailProps> = ({
  document,
  onBack,
  onCompareWith,
  onAskAssistant,
  onDeleteDocument,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMarker, setActiveMarker] = useState<MedicalMarker | null>(
    document.markers && document.markers.length > 0 ? document.markers[0] : null
  );
  const [addedQuestions, setAddedQuestions] = useState<Set<string>>(new Set());

  const markers = document.markers || [];
  const abnormalMarkers = markers.filter((m) => m.status !== 'NORMAL_RANGE');

  const filteredMarkers = markers.filter((m) => {
    const matchCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.normalized_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const categories = ['All', ...Array.from(new Set(markers.map((m) => m.category)))];

  const handleAddQuestionToDoctorList = async (qText: string) => {
    try {
      await api.addQuestion(qText, 'Understanding the result', document.id);
      setAddedQuestions((prev) => new Set([...prev, qText]));
    } catch (err) {
      console.error('Failed to add question:', err);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Back and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors w-fit shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCompareWith(document.id)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span>Compare With Another Report</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export / Print</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${document.filename}?`)) {
                onDeleteDocument(document.id);
              }
            }}
            className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-medium text-slate-500 hover:text-rose-600 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Delete report"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Header Document Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
                {document.document_type}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Verified Clinical Analysis
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {document.filename}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Report Date: <strong className="text-slate-800">{document.report_date}</strong></span>
            </div>
            {document.facility_name && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[200px] text-slate-700">{document.facility_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <MedicalDisclaimer compact />
      </div>

      {/* Section A: Executive Summary in Plain Language */}
      {document.analysis && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Executive Summary (Plain English)
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Educational Overview</span>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">
            {document.analysis.summary}
          </p>
        </div>
      )}

      {/* Section B: Key Findings for Notable Values */}
      {abnormalMarkers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Values Outside Reference Intervals ({abnormalMarkers.length})
            </h3>
            <span className="text-xs text-slate-500">
              Factual measurement observations for doctor discussion
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {abnormalMarkers.map((m) => (
              <div
                key={m.id}
                onClick={() => setActiveMarker(m)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 shadow-sm ${
                  activeMarker?.id === m.id
                    ? 'bg-teal-50/50 border-teal-500 ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">{m.name}</span>
                  {m.status === 'LOW' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                      Below ref
                    </span>
                  )}
                  {m.status === 'HIGH' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                      Above ref
                    </span>
                  )}
                </div>
                <div className="font-mono text-lg font-bold text-slate-900">
                  {m.value_text} <span className="text-xs text-slate-500 font-normal">{m.unit}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Lab Reference: {m.reference_text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section C: Full Results Interactive Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Full Extracted Measurements</h3>
            <p className="text-xs text-slate-500">
              Click any row to view in-depth plain-language explanation and biology context
            </p>
          </div>

          {/* Search and Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search marker..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-sm"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-teal-500 shadow-sm cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <th className="py-3 px-4">Marker Name</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Reference Interval</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredMarkers.map((m) => {
                  const isSelected = activeMarker?.id === m.id;
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setActiveMarker(m)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-teal-50/70 font-medium'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{m.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{m.normalized_name}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {m.value_text} <span className="text-[10px] font-normal text-slate-500">{m.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {m.reference_text || (m.reference_min !== null && m.reference_max !== null ? `${m.reference_min} - ${m.reference_max} ${m.unit}` : '—')}
                      </td>
                      <td className="py-3.5 px-4">
                        {m.status === 'NORMAL_RANGE' && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                            Normal
                          </span>
                        )}
                        {m.status === 'LOW' && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
                            Below ref
                          </span>
                        )}
                        {m.status === 'HIGH' && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium">
                            Above ref
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {m.category}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-teal-700 hover:text-teal-800 text-[11px] font-semibold flex items-center justify-end gap-1">
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section D: In-Depth AI Marker Explanation Card */}
      {activeMarker && (
        <div className="p-6 rounded-2xl bg-white border border-teal-200 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider">
                Marker Deep Dive &bull; {activeMarker.category}
              </div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>{activeMarker.name}</span>
                <span className="text-sm font-mono font-medium text-slate-500">
                  ({activeMarker.value_text} {activeMarker.unit})
                </span>
              </h3>
            </div>

            <button
              onClick={() => onAskAssistant(`Explain what ${activeMarker.name} means and why my result is ${activeMarker.value_text} ${activeMarker.unit}.`)}
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-medium flex items-center gap-1.5 transition-colors w-fit cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Ask AI Assistant About This</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900">1. What is it?</h4>
              <p className="text-slate-600 leading-relaxed">
                {activeMarker.explanation || `${activeMarker.name} is a biological indicator evaluated in routine clinical care.`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900">2. Why is it measured?</h4>
              <p className="text-slate-600 leading-relaxed">
                Physicians routinely review {activeMarker.name} to monitor overall physiological balance, metabolic activity, and organ function over time.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900">3. Relative to Reference Range</h4>
              <p className="text-slate-600 leading-relaxed">
                Your recorded measurement of {activeMarker.value_text} {activeMarker.unit} is{' '}
                {activeMarker.status === 'NORMAL_RANGE'
                  ? 'within the standard laboratory range (' + activeMarker.reference_text + ').'
                  : activeMarker.status === 'LOW'
                  ? 'below the typical lab reference interval (' + activeMarker.reference_text + ').'
                  : 'above the typical lab reference interval (' + activeMarker.reference_text + ').'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section E: Questions to Ask Your Doctor */}
      {document.analysis?.doctor_questions && document.analysis.doctor_questions.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">Questions to Ask Your Doctor</h3>
            </div>
            <span className="text-xs text-slate-500">
              Formulated specifically from this report
            </span>
          </div>

          <div className="space-y-3">
            {document.analysis.doctor_questions.map((q, idx) => {
              const isAdded = addedQuestions.has(q);
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-teal-700 uppercase">Suggested Question</span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      &quot;{q}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAddQuestionToDoctorList(q)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Added to Checklist</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Checklist</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onAskAssistant(`Can you explain why asking: "${q}" is relevant to my lab results?`)}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-teal-700 border border-slate-200 transition-colors shadow-sm cursor-pointer"
                      title="Ask AI about this question"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

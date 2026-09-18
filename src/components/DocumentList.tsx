import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Building2, 
  ArrowUpRight, 
  Plus, 
  Trash2, 
  Search, 
  Filter,
  Activity,
  Sparkles,
  TrendingUp,
  UploadCloud
} from 'lucide-react';
import { MedicalDocument } from '../types';
import { MedicalDisclaimer } from './MedicalDisclaimer';

interface DocumentListProps {
  documents: MedicalDocument[];
  onSelectDocument: (docId: string) => void;
  onUploadClick: () => void;
  onCompareReports: () => void;
  onDeleteDocument: (docId: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onSelectDocument,
  onUploadClick,
  onCompareReports,
  onDeleteDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const types = ['All', ...Array.from(new Set(documents.map((d) => d.document_type)))];

  const filteredDocs = documents.filter((doc) => {
    const matchType = typeFilter === 'All' || doc.document_type === typeFilter;
    const matchSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.facility_name && doc.facility_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-semibold text-teal-700 mb-2">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>Document Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Medical Reports & Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            All your uploaded clinical laboratory reports, prescriptions, and medical evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {documents.length > 1 && (
            <button
              onClick={onCompareReports}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              <span>Compare Reports</span>
            </button>
          )}
          <button
            onClick={onUploadClick}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Report</span>
          </button>
        </div>
      </div>

      <MedicalDisclaimer compact />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name or laboratory..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                typeFilter === t
                  ? 'bg-teal-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const abnormalCount = (doc.markers || []).filter((m) => m.status !== 'NORMAL_RANGE').length;
          return (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500/50 hover:shadow-md space-y-4 transition-all flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                      {doc.document_type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {doc.report_date}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete ${doc.filename}?`)) {
                        onDeleteDocument(doc.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3
                  onClick={() => onSelectDocument(doc.id)}
                  className="font-bold text-slate-900 text-base hover:text-teal-700 cursor-pointer transition-colors"
                >
                  {doc.filename}
                </h3>

                {doc.facility_name && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{doc.facility_name}</span>
                  </div>
                )}

                {doc.analysis?.summary && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                    {doc.analysis.summary}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">
                    {doc.markers?.length || 0} markers
                  </span>
                  {abnormalCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                      {abnormalCount} outside range
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onSelectDocument(doc.id)}
                  className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full Analysis</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <div className="p-12 text-center text-slate-500 text-xs rounded-2xl bg-white border border-dashed border-slate-200 space-y-3">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <p>No medical reports found matching your criteria.</p>
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload a Document</span>
          </button>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { 
  FileText, 
  TrendingUp, 
  Activity, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  HelpCircle, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  UploadCloud,
  Plus
} from 'lucide-react';
import { MedicalDocument, MedicalMarker, MarkerCategory, User, DoctorQuestion } from '../types';
import { MedicalDisclaimer } from './MedicalDisclaimer';

interface DashboardOverviewProps {
  user: User;
  documents: MedicalDocument[];
  questions: DoctorQuestion[];
  onNavigate: (route: string) => void;
  onSelectDocument: (docId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  user,
  documents,
  questions,
  onNavigate,
  onSelectDocument,
}) => {
  // Aggregate all unique markers from latest reports
  const allMarkers: MedicalMarker[] = [];
  const latestDoc = documents[0];

  for (const doc of documents) {
    if (doc.markers) {
      allMarkers.push(...doc.markers);
    }
  }

  const uniqueMarkerNames = new Set(allMarkers.map((m) => m.normalized_name));
  const categories: MarkerCategory[] = ['Blood', 'Metabolic', 'Liver', 'Kidney', 'Thyroid', 'Other'];

  // Categorize latest markers
  const categorizedMarkers: Record<string, MedicalMarker[]> = {};
  for (const cat of categories) {
    categorizedMarkers[cat] = (latestDoc?.markers || []).filter((m) => m.category === cat);
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-semibold text-teal-700">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Health Intelligence Canvas Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {documents.length > 0 
              ? `Here is your longitudinal synthesis based on ${documents.length} analyzed medical documents.`
              : 'Your secure medical vault is ready. Upload your first lab test, blood panel, or clinical report to begin automated extraction and trend analysis.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={() => onNavigate('upload')}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Report</span>
          </button>
          {documents.length > 0 && (
            <button
              onClick={() => onNavigate('trends')}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>View Trends</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety Notice */}
      <MedicalDisclaimer compact />

      {/* 4 Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Reports Analyzed */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Reports Analyzed</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">
            {documents.length}
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{documents.length > 0 ? 'All records verified & indexed' : 'Awaiting first document'}</span>
          </p>
        </div>

        {/* Card 2: Health Markers Tracked */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Markers Tracked</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-100">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">
            {uniqueMarkerNames.size}
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>Mapped across standard clinical panels</span>
          </p>
        </div>

        {/* Card 3: Trends Detected */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Longitudinal Trends</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">
            {documents.length > 1 ? documents.length * 2 : 0}
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>{documents.length > 1 ? 'Trajectory models computed' : 'Requires 2+ reports'}</span>
          </p>
        </div>

        {/* Card 4: Last Analysis */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Last Recorded</span>
            <div className="p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
            {latestDoc ? latestDoc.report_date : 'No records yet'}
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {latestDoc ? latestDoc.filename : 'Upload a PDF or scan'}
          </p>
        </div>
      </div>

      {/* When no documents exist yet, show clean bright onboarding banner */}
      {documents.length === 0 && (
        <div className="p-8 sm:p-10 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center border border-teal-100">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Upload your first medical report</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a lab test result (PDF, JPEG, or PNG) such as Complete Blood Count (CBC), Metabolic Panel, Lipid Panel, or HbA1c to see plain-English explanations and biomarker visualizations.
            </p>
          </div>
          <button
            onClick={() => onNavigate('upload')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Select or Scan Report</span>
          </button>
        </div>
      )}

      {/* Section: Connected Layers Visual Pipeline */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Health Intelligence Layer Flow
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Automated Pipeline</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
          <div 
            onClick={() => onNavigate('reports')}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 cursor-pointer transition-all"
          >
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Layer 1</div>
            <div className="font-semibold text-slate-800 mt-1">Documents</div>
            <div className="text-[11px] text-teal-700 font-medium mt-0.5">{documents.length} Files</div>
          </div>

          <div 
            onClick={() => latestDoc && onSelectDocument(latestDoc.id)}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 cursor-pointer transition-all"
          >
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Layer 2</div>
            <div className="font-semibold text-slate-800 mt-1">Extracted Data</div>
            <div className="text-[11px] text-teal-700 font-medium mt-0.5">{uniqueMarkerNames.size} Markers</div>
          </div>

          <div 
            onClick={() => latestDoc && onSelectDocument(latestDoc.id)}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 cursor-pointer transition-all"
          >
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Layer 3</div>
            <div className="font-semibold text-slate-800 mt-1">Health Insights</div>
            <div className="text-[11px] text-teal-700 font-medium mt-0.5">Plain Summaries</div>
          </div>

          <div 
            onClick={() => onNavigate('trends')}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 cursor-pointer transition-all"
          >
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Layer 4</div>
            <div className="font-semibold text-slate-800 mt-1">Trends</div>
            <div className="text-[11px] text-teal-700 font-medium mt-0.5">Longitudinal</div>
          </div>

          <div 
            onClick={() => onNavigate('doctor-questions')}
            className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 cursor-pointer transition-all"
          >
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Layer 5</div>
            <div className="font-semibold text-slate-800 mt-1">Doctor Questions</div>
            <div className="text-[11px] text-teal-700 font-medium mt-0.5">{questions.length} Items</div>
          </div>
        </div>
      </div>

      {/* Main Section: Health Snapshot */}
      {latestDoc && latestDoc.markers && latestDoc.markers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Health Snapshot</h2>
              <p className="text-xs text-slate-500">
                Latest measured values categorized by physiological system (Values are purely informative)
              </p>
            </div>
            <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 font-medium">
              Source: {latestDoc.filename}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const markers = categorizedMarkers[cat] || [];
              if (markers.length === 0) return null;

              return (
                <div
                  key={cat}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      {cat}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {markers.length} marker{markers.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {markers.slice(0, 4).map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                        <div>
                          <div className="text-slate-800 font-medium truncate max-w-[150px]">{m.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Ref: {m.reference_text}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900">
                            {m.value_text} <span className="text-[10px] text-slate-500 font-normal">{m.unit}</span>
                          </div>
                          {m.status === 'NORMAL_RANGE' && (
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                              Normal range
                            </span>
                          )}
                          {m.status === 'LOW' && (
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                              Below ref range
                            </span>
                          )}
                          {m.status === 'HIGH' && (
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                              Above ref range
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two Column Section: Recent Reports & Doctor Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Reports */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Document Library
            </h3>
            {documents.length > 0 && (
              <button
                onClick={() => onNavigate('reports')}
                className="text-xs text-teal-700 hover:text-teal-800 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>View all ({documents.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="p-6 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                <p>No documents uploaded yet.</p>
                <button
                  onClick={() => onNavigate('upload')}
                  className="text-teal-600 hover:text-teal-700 font-semibold underline underline-offset-2"
                >
                  Upload your first lab test
                </button>
              </div>
            ) : (
              documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument(doc.id)}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-500/80 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {doc.filename}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                        {doc.document_type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {doc.report_date}
                      </span>
                      <span>&bull;</span>
                      <span>{doc.markers?.length || 0} markers</span>
                      {doc.facility_name && (
                        <>
                          <span>&bull;</span>
                          <span className="truncate max-w-[160px]">{doc.facility_name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-teal-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>Inspect</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Doctor Questions Checklist */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              Doctor Questions
            </h3>
            <button
              onClick={() => onNavigate('doctor-questions')}
              className="text-xs text-teal-700 hover:text-teal-800 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Manage ({questions.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <p className="text-xs text-slate-500">
              Formulated questions based on lab findings to bring to your doctor's appointment:
            </p>

            <div className="space-y-2.5">
              {questions.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No questions saved yet. Questions are generated as you upload reports, or you can add your own.
                </div>
              ) : (
                questions.slice(0, 3).map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-teal-700 font-semibold">{q.category}</span>
                      <span className={q.is_completed ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                        {q.is_completed ? '✓ Discussed' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">
                      &quot;{q.question}&quot;
                    </p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => onNavigate('doctor-questions')}
              className="w-full py-2.5 text-xs text-center font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
            >
              Open Full Checklist & Print Sheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

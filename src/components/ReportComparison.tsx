import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Info,
  Layers,
  FileText
} from 'lucide-react';
import { MedicalDocument, ReportComparisonResult } from '../types';
import { api } from '../services/api';
import { MedicalDisclaimer } from './MedicalDisclaimer';

interface ReportComparisonProps {
  documents: MedicalDocument[];
  initialReportAId?: string;
  initialReportBId?: string;
  onSelectDocument: (docId: string) => void;
}

export const ReportComparison: React.FC<ReportComparisonProps> = ({
  documents,
  initialReportAId,
  initialReportBId,
  onSelectDocument,
}) => {
  const sortedDocs = [...documents].sort(
    (a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime()
  );

  const [reportAId, setReportAId] = useState<string>(
    initialReportAId || (sortedDocs.length >= 2 ? sortedDocs[0].id : sortedDocs[0]?.id || '')
  );
  const [reportBId, setReportBId] = useState<string>(
    initialReportBId || (sortedDocs.length >= 2 ? sortedDocs[sortedDocs.length - 1].id : sortedDocs[0]?.id || '')
  );

  const [comparison, setComparison] = useState<ReportComparisonResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (reportAId && reportBId && reportAId !== reportBId) {
      loadComparison(reportAId, reportBId);
    }
  }, [reportAId, reportBId]);

  const loadComparison = async (idA: string, idB: string) => {
    setLoading(true);
    try {
      const res = await api.compareReports(idA, idB);
      setComparison(res.comparison);
    } catch (err) {
      console.error('Failed to compare reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = reportAId;
    setReportAId(reportBId);
    setReportBId(temp);
  };

  const reportA = documents.find((d) => d.id === reportAId);
  const reportB = documents.find((d) => d.id === reportBId);

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-semibold text-teal-700 mb-2">
          <ArrowLeftRight className="w-3.5 h-3.5 text-teal-600" />
          <span>Longitudinal Delta Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Report Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Analyze documented changes, value differences, and reference-boundary transitions between two reports.
        </p>
      </div>

      <MedicalDisclaimer compact />

      {documents.length < 2 ? (
        <div className="p-12 text-center text-slate-500 text-xs rounded-2xl bg-white border border-dashed border-slate-200 space-y-3">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Two or more reports required</h3>
          <p className="max-w-md mx-auto">
            Upload at least two medical reports or lab tests to generate automated delta comparisons and biomarker shift tracking.
          </p>
        </div>
      ) : (
        <>
          {/* Selectors Bar */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Report A */}
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-slate-600">Baseline (Earlier Report):</label>
              <select
                value={reportAId}
                onChange={(e) => setReportAId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-500 shadow-sm cursor-pointer"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.filename} ({d.report_date})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center md:pt-4">
              <button
                onClick={handleSwap}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-teal-700 border border-slate-200 transition-colors shadow-sm cursor-pointer"
                title="Swap reports"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* Report B */}
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-slate-600">Comparison (Later Report):</label>
              <select
                value={reportBId}
                onChange={(e) => setReportBId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-500 shadow-sm cursor-pointer"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.filename} ({d.report_date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-teal-600" />
              <span>Comparing documented measurements...</span>
            </div>
          )}

          {comparison && !loading && (
            <>
              {/* Executive Comparative Summary */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    Comparative Synthesis (Plain Language)
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Objective Delta</span>
                </div>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  {comparison.summary}
                </p>
              </div>

              {/* 4 Summary Metric Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-left space-y-1 shadow-sm">
                  <span className="text-[11px] font-semibold text-emerald-700">Entered Normal Range</span>
                  <div className="text-2xl font-bold text-slate-900">{comparison.enteredNormal.length}</div>
                  <span className="text-[10px] text-slate-500">Improved into reference bounds</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 text-left space-y-1 shadow-sm">
                  <span className="text-[11px] font-semibold text-amber-700">Left Normal Range</span>
                  <div className="text-2xl font-bold text-slate-900">{comparison.leftNormal.length}</div>
                  <span className="text-[10px] text-slate-500">Moved outside reference bounds</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 text-left space-y-1 shadow-sm">
                  <span className="text-[11px] font-semibold text-teal-700">Numerical Increase</span>
                  <div className="text-2xl font-bold text-slate-900">{comparison.increased.length}</div>
                  <span className="text-[10px] text-slate-500">Higher recorded values</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 text-left space-y-1 shadow-sm">
                  <span className="text-[11px] font-semibold text-blue-700">Numerical Decrease</span>
                  <div className="text-2xl font-bold text-slate-900">{comparison.decreased.length}</div>
                  <span className="text-[10px] text-slate-500">Lower recorded values</span>
                </div>
              </div>

              {/* Critical Highlights: Entered or Left Normal Bounds */}
              {(comparison.enteredNormal.length > 0 || comparison.leftNormal.length > 0) && (
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Key Reference-Boundary Changes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {comparison.enteredNormal.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white border border-emerald-200 shadow-sm flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {item.valA} &rarr; <span className="text-emerald-700 font-bold">{item.valB} {item.unit}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                          Entered Reference Range
                        </span>
                      </div>
                    ))}

                    {comparison.leftNormal.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white border border-amber-200 shadow-sm flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {item.valA} &rarr; <span className="text-amber-700 font-bold">{item.valB} {item.unit}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200">
                          Left Reference Range
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Side-by-Side Detailed Comparison Table */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-base">Complete Side-by-Side Markers Comparison</h3>
                <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                        <th className="py-3 px-4">Marker</th>
                        <th className="py-3 px-4">
                          Baseline ({reportA?.report_date})
                        </th>
                        <th className="py-3 px-4">
                          Comparison ({reportB?.report_date})
                        </th>
                        <th className="py-3 px-4">Difference (Delta)</th>
                        <th className="py-3 px-4 text-right">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {/* Render increased */}
                      {comparison.increased.map((item, idx) => (
                        <tr key={`inc_${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{item.name}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">{item.valA} {item.unit}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-900 font-bold">{item.valB} {item.unit}</td>
                          <td className="py-3.5 px-4 font-mono text-teal-700 font-bold">
                            +{item.change.toFixed(2)} {item.unit}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] text-teal-700 font-medium">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>Increased</span>
                            </span>
                          </td>
                        </tr>
                      ))}

                      {/* Render decreased */}
                      {comparison.decreased.map((item, idx) => (
                        <tr key={`dec_${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{item.name}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">{item.valA} {item.unit}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-900 font-bold">{item.valB} {item.unit}</td>
                          <td className="py-3.5 px-4 font-mono text-blue-700 font-bold">
                            {item.change.toFixed(2)} {item.unit}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-medium">
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span>Decreased</span>
                            </span>
                          </td>
                        </tr>
                      ))}

                      {/* Render unchanged */}
                      {comparison.unchanged.map((item, idx) => (
                        <tr key={`unc_${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{item.name}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-500">{item.valA} {item.unit}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-700">{item.valB} {item.unit}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-400">0.00</td>
                          <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">Unchanged</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

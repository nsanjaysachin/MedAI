import React, { useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  Info, 
  ChevronRight, 
  ArrowUpRight, 
  Filter, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine
} from 'recharts';
import { MarkerTrend } from '../types';
import { MedicalDisclaimer } from './MedicalDisclaimer';

interface HealthTrendsProps {
  trends: MarkerTrend[];
  onSelectDocument: (docId: string) => void;
}

export const HealthTrends: React.FC<HealthTrendsProps> = ({
  trends,
  onSelectDocument,
}) => {
  const [selectedMarkerKey, setSelectedMarkerKey] = useState<string>(
    trends.length > 0 ? trends[0].normalized_name : ''
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(trends.map((t) => t.category)))];

  const filteredTrends = trends.filter((t) => {
    return selectedCategory === 'All' || t.category === selectedCategory;
  });

  const activeTrend = trends.find((t) => t.normalized_name === selectedMarkerKey) || filteredTrends[0];

  // Prepare chart data
  const chartData = (activeTrend?.points || []).map((pt) => ({
    date: pt.date,
    value: pt.value,
    unit: pt.unit,
    refMin: pt.reference_min,
    refMax: pt.reference_max,
    status: pt.status,
    docTitle: pt.document_title,
    docId: pt.document_id,
  }));

  // Min/Max for chart domain
  const values = chartData.map((d) => d.value);
  const refMins = chartData.map((d) => d.refMin).filter((v) => v !== null) as number[];
  const refMaxs = chartData.map((d) => d.refMax).filter((v) => v !== null) as number[];
  const allNums = [...values, ...refMins, ...refMaxs];
  const minVal = allNums.length > 0 ? Math.floor(Math.min(...allNums) * 0.9) : 0;
  const maxVal = allNums.length > 0 ? Math.ceil(Math.max(...allNums) * 1.1) : 100;

  const currentRefMin = chartData[0]?.refMin;
  const currentRefMax = chartData[0]?.refMax;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-semibold text-teal-700 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span>Longitudinal Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Health Marker Trends Over Time
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Compare lab results across multiple test dates with reference range intervals.
          </p>
        </div>
      </div>

      <MedicalDisclaimer compact />

      {trends.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs rounded-2xl bg-white border border-dashed border-slate-200 space-y-3">
          <TrendingUp className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No trend data available yet</h3>
          <p className="max-w-md mx-auto">
            Upload multiple medical reports or lab tests over time to automatically map historical biomarker trajectories.
          </p>
        </div>
      ) : (
        <>
          {/* Filter and Selector Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            {/* Category Pill Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    const firstInCat = trends.find((t) => cat === 'All' || t.category === cat);
                    if (firstInCat) setSelectedMarkerKey(firstInCat.normalized_name);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Marker Dropdown for Quick Switching */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 shrink-0 font-medium">Select Marker:</span>
              <select
                value={activeTrend?.normalized_name}
                onChange={(e) => setSelectedMarkerKey(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-500 shadow-sm cursor-pointer"
              >
                {filteredTrends.map((t) => (
                  <option key={t.normalized_name} value={t.normalized_name}>
                    {t.marker_name} ({t.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeTrend && (
            <>
              {/* Main Chart Card */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {activeTrend.category}
                      </span>
                      <span className="text-xs text-teal-700 font-semibold font-mono">
                        Unit: {activeTrend.unit}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {activeTrend.marker_name}
                    </h2>
                  </div>

                  {/* Direction Indicator */}
                  <div className="flex items-center gap-2 text-xs">
                    {activeTrend.direction === 'decreased' && (
                      <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                        Trajectory: Decreased over time
                      </span>
                    )}
                    {activeTrend.direction === 'increased' && (
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
                        Trajectory: Increased over time
                      </span>
                    )}
                    {activeTrend.direction === 'stable' && (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        Trajectory: Stable over time
                      </span>
                    )}
                    {activeTrend.direction === 'insufficient_data' && (
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                        Single Data Point Recorded
                      </span>
                    )}
                  </div>
                </div>

                {/* Objective Narrative Observation */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed space-y-1">
                    <div className="font-semibold text-slate-900">Objective Trend Observation:</div>
                    <p className="text-slate-600">{activeTrend.observation}</p>
                    <p className="text-slate-400 text-[11px]">
                      Reference interval: {currentRefMin !== null && currentRefMax !== null ? `${currentRefMin} - ${currentRefMax} ${activeTrend.unit}` : 'Standard lab range'}.
                    </p>
                  </div>
                </div>

                {/* Recharts Visualization */}
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        domain={[minVal, maxVal]}
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                        unit={` ${activeTrend.unit}`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-lg text-xs space-y-1.5">
                                <div className="font-semibold text-slate-900">{data.date}</div>
                                <div className="font-mono text-teal-700 font-bold">
                                  {data.value} {data.unit}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  Ref: {data.refMin !== null ? `${data.refMin} - ${data.refMax}` : 'Standard'} {data.unit}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                                  {data.docTitle}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      {/* Reference Lines */}
                      {currentRefMin !== null && currentRefMax !== null && (
                        <>
                          <ReferenceLine
                            y={currentRefMin}
                            stroke="#0d9488"
                            strokeDasharray="4 4"
                            strokeOpacity={0.6}
                            label={{ value: `Ref Min: ${currentRefMin}`, fill: '#0d9488', fontSize: 10, position: 'insideBottomLeft' }}
                          />
                          <ReferenceLine
                            y={currentRefMax}
                            stroke="#0d9488"
                            strokeDasharray="4 4"
                            strokeOpacity={0.6}
                            label={{ value: `Ref Max: ${currentRefMax}`, fill: '#0d9488', fontSize: 10, position: 'insideTopLeft' }}
                          />
                        </>
                      )}

                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#0d9488"
                        strokeWidth={2.5}
                        dot={{ fill: '#0f766e', r: 5, stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 7, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Historical Data Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Recorded Historical Points</h3>
                <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                        <th className="py-3 px-4">Recorded Date</th>
                        <th className="py-3 px-4">Measurement</th>
                        <th className="py-3 px-4">Reference Interval</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Source Document</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {chartData.map((pt, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium">{pt.date}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {pt.value} {pt.unit}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {pt.refMin !== null && pt.refMax !== null ? `${pt.refMin} - ${pt.refMax} ${pt.unit}` : '—'}
                          </td>
                          <td className="py-3 px-4">
                            {pt.status === 'NORMAL_RANGE' && (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                                Normal
                              </span>
                            )}
                            {pt.status === 'LOW' && (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
                                Below ref
                              </span>
                            )}
                            {pt.status === 'HIGH' && (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium">
                                Above ref
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]">
                            {pt.docTitle}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => onSelectDocument(pt.docId)}
                              className="text-teal-700 hover:text-teal-800 font-semibold text-xs flex items-center justify-end gap-1 ml-auto cursor-pointer"
                            >
                              <span>View Report</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
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

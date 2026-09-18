import React, { useState } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  Circle, 
  Stethoscope, 
  Tag,
  Filter,
  X
} from 'lucide-react';
import { DoctorQuestion, QuestionCategory } from '../types';
import { api } from '../services/api';
import { MedicalDisclaimer } from './MedicalDisclaimer';

interface DoctorQuestionsProps {
  questions: DoctorQuestion[];
  onRefreshQuestions: () => void;
}

const CATEGORIES: QuestionCategory[] = [
  'Understanding the result',
  'Follow-up testing',
  'Lifestyle discussion',
  'Medication discussion',
  'Monitoring',
];

export const DoctorQuestions: React.FC<DoctorQuestionsProps> = ({
  questions,
  onRefreshQuestions,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newQuestionCategory, setNewQuestionCategory] = useState<QuestionCategory>('Understanding the result');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const filteredQuestions = questions.filter((q) => {
    return selectedCategory === 'All' || q.category === selectedCategory;
  });

  const completedCount = questions.filter((q) => q.is_completed).length;

  const handleToggle = async (q: DoctorQuestion) => {
    try {
      await api.toggleQuestion(q.id, !q.is_completed);
      onRefreshQuestions();
    } catch (err) {
      console.error('Failed to toggle question:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteQuestion(id);
      onRefreshQuestions();
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    try {
      await api.addQuestion(newQuestionText, newQuestionCategory);
      setNewQuestionText('');
      setShowAddForm(false);
      onRefreshQuestions();
    } catch (err) {
      console.error('Failed to add question:', err);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-semibold text-teal-700 mb-2">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>Clinical Preparation Checklist</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Questions for Your Doctor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Formulate and organize thoughtful questions based on your lab results to discuss during your appointment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Appointment Sheet</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      <MedicalDisclaimer compact />

      {/* Progress Metric Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="space-y-1">
          <div className="text-slate-800 font-semibold">Appointment Preparation Status</div>
          <div className="text-slate-500 text-[11px]">
            {completedCount} of {questions.length} questions marked as discussed with your physician.
          </div>
        </div>
        <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all"
            style={{ width: `${questions.length > 0 ? (completedCount / questions.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['All', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-teal-600 text-white font-semibold shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddQuestion} className="p-5 rounded-2xl bg-white border border-teal-300 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Add Custom Question for Your Doctor</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            required
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="e.g., Should we schedule a re-test in 3 or 6 months?"
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-500"
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <select
              value={newQuestionCategory}
              onChange={(e) => setNewQuestionCategory(e.target.value as QuestionCategory)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-teal-500 cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs cursor-pointer"
              >
                Save Question
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 text-xs shadow-sm ${
              q.is_completed
                ? 'bg-slate-50 border-slate-200 opacity-60'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggle(q)}
                className="mt-0.5 text-slate-400 hover:text-teal-600 transition-colors shrink-0 cursor-pointer"
              >
                {q.is_completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400" />
                )}
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {q.category}
                </span>
                <p className={`text-slate-800 text-xs sm:text-sm font-medium leading-relaxed ${q.is_completed ? 'line-through text-slate-400' : ''}`}>
                  {q.question}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(q.id)}
              className="text-slate-400 hover:text-rose-600 p-1 transition-colors shrink-0 cursor-pointer"
              title="Delete question"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-2xl border border-dashed border-slate-200">
            No questions found in this category.
          </div>
        )}
      </div>
    </div>
  );
};

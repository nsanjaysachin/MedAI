import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw,
  Layers,
  FileCheck,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { MedicalDocument } from '../types';
import { MedicalDisclaimer } from './MedicalDisclaimer';

interface ReportUploadProps {
  onUploadSuccess: (newDoc: MedicalDocument) => void;
  onCancel: () => void;
}

const SAMPLE_TEMPLATES = [
  {
    title: 'Complete Blood Count (CBC)',
    category: 'CBC',
    filename: 'Complete_Blood_Count_Report.txt',
    text: `METROPOLITAN CLINICAL LABORATORY
PATIENT ID: MED-882194
COLLECTION DATE: 2026-02-10 | SPECIMEN: Whole Blood (EDTA)

COMPLETE BLOOD COUNT (CBC) WITH AUTOMATED DIFFERENTIAL
Hemoglobin (HGB): 12.4 g/dL (Reference Range: 12.0 - 16.0 g/dL) [NORMAL]
Hematocrit (HCT): 38.2 % (Reference Range: 37.0 - 48.0 %) [NORMAL]
White Blood Cells (WBC): 6.8 x10³/µL (Reference Range: 4.5 - 11.0 x10³/µL) [NORMAL]
Red Blood Cells (RBC): 4.45 x10⁶/µL (Reference Range: 4.20 - 5.40 x10⁶/µL) [NORMAL]
Platelets: 235 x10³/µL (Reference Range: 150 - 450 x10³/µL) [NORMAL]
Mean Corpuscular Volume (MCV): 86 fL (Reference Range: 80 - 100 fL) [NORMAL]
Neutrophils: 58 % (Reference Range: 40 - 70 %) [NORMAL]
Lymphocytes: 32 % (Reference Range: 20 - 40 %) [NORMAL]`,
  },
  {
    title: 'Comprehensive Lipid & Cardio Panel',
    category: 'Lipid profile',
    filename: 'Fasting_Lipid_Evaluation.txt',
    text: `PACIFIC DIAGNOSTIC HEALTH INSTITUTE
PATIENT ID: MED-882194 | ACC: #LIP-2026-91
SPECIMEN DATE: 2026-01-18 | FASTING: 12 Hours

FASTING LIPID EVALUATION
Total Cholesterol: 192 mg/dL (Reference Range: 125 - 200 mg/dL) [NORMAL]
LDL Cholesterol (Calculated): 98 mg/dL (Desirable: < 100 mg/dL) [NORMAL]
HDL Cholesterol: 58 mg/dL (Reference Range: 50 - 90 mg/dL) [NORMAL]
Triglycerides: 128 mg/dL (Reference Range: < 150 mg/dL) [NORMAL]
Non-HDL Cholesterol: 134 mg/dL (Reference Range: < 130 mg/dL) [HIGH]
Cholesterol / HDL Ratio: 3.3 (Optimal: < 4.0)`,
  },
  {
    title: 'Metabolic & Kidney Panel (CMP)',
    category: 'Metabolic',
    filename: 'Comprehensive_Metabolic_Report.txt',
    text: `QUEST METABOLIC DIAGNOSTICS
PATIENT ID: MED-882194 | REPORT DATE: 2026-01-20
TEST NAME: COMPREHENSIVE METABOLIC PANEL (CMP-14)

Fasting Glucose: 92 mg/dL (Reference Range: 70 - 99 mg/dL) [NORMAL]
Blood Urea Nitrogen (BUN): 14 mg/dL (Reference Range: 7 - 20 mg/dL) [NORMAL]
Serum Creatinine: 0.88 mg/dL (Reference Range: 0.60 - 1.20 mg/dL) [NORMAL]
eGFR (CKD-EPI): 94 mL/min/1.73m² (Reference Range: >= 60 mL/min/1.73m²) [NORMAL]
Sodium: 140 mEq/L (Reference Range: 136 - 145 mEq/L) [NORMAL]
Potassium: 4.2 mEq/L (Reference Range: 3.5 - 5.1 mEq/L) [NORMAL]
Chloride: 102 mEq/L (Reference Range: 98 - 107 mEq/L) [NORMAL]
Calcium: 9.4 mg/dL (Reference Range: 8.6 - 10.2 mg/dL) [NORMAL]
Total Bilirubin: 0.7 mg/dL (Reference Range: 0.2 - 1.2 mg/dL) [NORMAL]
ALT (Alanine Aminotransferase): 24 U/L (Reference Range: 7 - 35 U/L) [NORMAL]
AST (Aspartate Aminotransferase): 21 U/L (Reference Range: 8 - 33 U/L) [NORMAL]`,
  },
  {
    title: 'Thyroid & Vitamin D Profile',
    category: 'Thyroid',
    filename: 'Endocrine_Thyroid_VitaminD.txt',
    text: `SPECIALTY ENDOCRINE LABORATORY
TEST PERFORMED: TSH, FREE T4 & 25-OH VITAMIN D
DATE OF SERVICE: 2026-01-22

TSH (Thyroid Stimulating Hormone): 2.15 mIU/L (Reference Range: 0.40 - 4.00 mIU/L) [NORMAL]
Free T4 (Thyroxine): 1.18 ng/dL (Reference Range: 0.80 - 1.80 ng/dL) [NORMAL]
Vitamin D (25-Hydroxy): 38.5 ng/mL (Reference: 30.0 - 100.0 ng/mL) [SUFFICIENT]
Iron (Total): 84 µg/dL (Reference Range: 60 - 170 µg/dL) [NORMAL]
Ferritin: 42 ng/mL (Reference Range: 20 - 200 ng/mL) [NORMAL]`,
  },
];

const PROCESSING_STEPS = [
  'Reading document structure...',
  'Extracting entities & clinical lab values...',
  'Identifying medical markers & biological names...',
  'Comparing measurements against reference ranges...',
  'Generating plain-language educational summary...',
];

export const ReportUpload: React.FC<ReportUploadProps> = ({ onUploadSuccess, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customFilename, setCustomFilename] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setCustomFilename(file.name);
    setErrorMessage(null);

    // If it is a text or markdown file, read content
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawText(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      // For binary or images/PDFs, extract text or provide OCR fallback
      const reader = new FileReader();
      reader.onload = () => {
        setRawText(`[Uploaded File: ${file.name} (${Math.round(file.size / 1024)} KB)]\nClinical Report Content\nProcessing document image/PDF representation...`);
      };
      reader.readAsText(file.slice(0, 4000));
    }
  };

  const handleLoadSample = (sample: typeof SAMPLE_TEMPLATES[0]) => {
    setCustomFilename(sample.filename);
    setRawText(sample.text);
    setSelectedFile(null);
  };

  const handleProcessDocument = async () => {
    if (!customFilename && !rawText) {
      setErrorMessage('Please select a file or choose a sample report template.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setCurrentStepIndex(0);

    // Step through visual pipeline
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < PROCESSING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    try {
      const response = await api.uploadDocument({
        filename: customFilename || 'Medical_Report.txt',
        rawText: rawText,
        file_size: selectedFile?.size || rawText.length,
        mime_type: selectedFile?.type || 'text/plain',
      });

      clearInterval(interval);
      setCurrentStepIndex(PROCESSING_STEPS.length - 1);
      setTimeout(() => {
        setIsProcessing(false);
        onUploadSuccess(response.document);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to process document');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Analyze Medical Document
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Upload your laboratory result, prescription, or clinical summary to extract markers and plain-language explanations.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <MedicalDisclaimer compact />

      {/* Main Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all bg-white shadow-sm ${
          dragActive
            ? 'border-teal-500 bg-teal-50/50'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <input
          id="file-upload-input"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shadow-sm">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900">
              Drag & Drop your report here
            </h3>
            <p className="text-xs text-slate-500">
              Supports PDF, PNG, JPG, JPEG, or TXT documents
            </p>
          </div>

          <label
            htmlFor="file-upload-input"
            className="inline-block px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium text-xs cursor-pointer transition-all shadow-sm"
          >
            Browse from your computer
          </label>

          {(customFilename || selectedFile) && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-left">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-slate-800 font-medium truncate">{customFilename}</span>
              </div>
              <span className="text-teal-700 font-semibold text-[10px] shrink-0 ml-2">Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Sample Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
            Or Choose a Pre-Loaded Clinical Sample Template
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Instant Test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_TEMPLATES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadSample(sample)}
              className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                customFilename === sample.filename
                  ? 'bg-teal-50/70 border-teal-500 text-slate-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-900">{sample.title}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {sample.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                Includes realistic lab values, units, and laboratory reference ranges.
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Raw Text Preview or Editing */}
      {rawText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Document Text / OCR Content:</span>
            <span>{rawText.length} characters</span>
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={5}
            className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 leading-relaxed shadow-sm"
          />
        </div>
      )}

      {/* Error display */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Processing Pipeline Animation Overlay */}
      {isProcessing && (
        <div className="p-6 rounded-2xl bg-white border border-teal-200 shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-700 text-sm font-semibold">
              <Sparkles className="w-4 h-4 animate-spin text-teal-600" />
              <span>MEDAI Analysis Engine Active</span>
            </div>
            <span className="text-xs font-mono text-slate-500 font-medium">
              Step {currentStepIndex + 1} of {PROCESSING_STEPS.length}
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-teal-600 transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentStepIndex + 1) / PROCESSING_STEPS.length) * 100}%`,
                }}
              />
            </div>
            <div className="text-xs text-slate-700 font-medium animate-pulse">
              {PROCESSING_STEPS[currentStepIndex]}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1.5 pt-2">
            {PROCESSING_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full ${
                  idx <= currentStepIndex ? 'bg-teal-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!isProcessing && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleProcessDocument}
            disabled={!customFilename && !rawText}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Process & Extract Markers</span>
          </button>
        </div>
      )}
    </div>
  );
};

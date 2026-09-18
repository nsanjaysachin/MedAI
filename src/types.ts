export type MarkerStatus = 'LOW' | 'NORMAL_RANGE' | 'HIGH' | 'UNKNOWN';

export type MarkerCategory = 
  | 'Blood' 
  | 'Metabolic' 
  | 'Liver' 
  | 'Kidney' 
  | 'Thyroid' 
  | 'Vitals' 
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  date_of_birth?: string;
  gender?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  timezone: string;
  preferences: {
    notifications: boolean;
    highContrast: boolean;
    educationalDetail: 'simple' | 'comprehensive';
  };
}

export interface MedicalMarker {
  id: string;
  document_id: string;
  user_id: string;
  name: string;
  normalized_name: string;
  value_numeric: number | null;
  value_text: string;
  unit: string;
  reference_min: number | null;
  reference_max: number | null;
  reference_text: string;
  status: MarkerStatus;
  category: MarkerCategory;
  confidence: number;
  source_page: number;
  created_at?: string;
  explanation?: string;
  educational_context?: string;
  recorded_date?: string;
}

export interface ReportAnalysis {
  id: string;
  document_id: string;
  user_id: string;
  summary: string;
  key_findings: Array<{
    marker_name: string;
    status: MarkerStatus;
    value: string;
    note: string;
  }>;
  doctor_questions: string[];
  model_name: string;
  created_at: string;
}

export interface MedicalDocument {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  document_type: 
    | 'Blood test' 
    | 'Urine test' 
    | 'Lipid profile' 
    | 'Liver function' 
    | 'Kidney function' 
    | 'Thyroid' 
    | 'Diabetes-related reports' 
    | 'CBC' 
    | 'Imaging report' 
    | 'Prescription' 
    | 'General medical document';
  mime_type: string;
  file_size: number;
  storage_path: string;
  upload_status: 'uploading' | 'processing' | 'completed' | 'failed';
  uploaded_at: string;
  report_date: string;
  facility_name?: string;
  doctor_name?: string;
  markers?: MedicalMarker[];
  analysis?: ReportAnalysis;
}

export interface TimelineEvent {
  id: string;
  user_id: string;
  document_id?: string | null;
  event_type: 'Report' | 'Lab test' | 'Prescription' | 'Note';
  event_date: string;
  title: string;
  description: string;
  created_at: string;
  category?: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dose: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type QuestionCategory = 'Understanding the result' | 'Follow-up testing' | 'Lifestyle discussion' | 'Medication discussion' | 'Monitoring';

export interface DoctorQuestion {
  id: string;
  user_id: string;
  document_id?: string | null;
  question: string;
  category: QuestionCategory;
  is_completed: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Array<{
    document_title: string;
    date: string;
    marker_name?: string;
    value?: string;
  }>;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  created_at: string;
}

export interface MarkerHistoryPoint {
  date: string;
  document_id: string;
  document_title: string;
  value: number;
  unit: string;
  reference_min: number | null;
  reference_max: number | null;
  status: MarkerStatus;
}

export interface MarkerTrend {
  marker_name: string;
  normalized_name: string;
  category: MarkerCategory;
  unit: string;
  points: MarkerHistoryPoint[];
  direction: 'increased' | 'decreased' | 'stable' | 'insufficient_data';
  observation: string;
}

export interface ReportComparisonResult {
  reportA: MedicalDocument;
  reportB: MedicalDocument;
  increased: Array<{ name: string; valA: number; valB: number; unit: string; change: number }>;
  decreased: Array<{ name: string; valA: number; valB: number; unit: string; change: number }>;
  enteredNormal: Array<{ name: string; valA: number; valB: number; unit: string; statusA: MarkerStatus; statusB: MarkerStatus }>;
  leftNormal: Array<{ name: string; valA: number; valB: number; unit: string; statusA: MarkerStatus; statusB: MarkerStatus }>;
  unchanged: Array<{ name: string; valA: number; valB: number; unit: string }>;
  newMarkers: Array<{ name: string; valB: number; unit: string; statusB: MarkerStatus }>;
  removedMarkers: Array<{ name: string; valA: number; unit: string; statusA: MarkerStatus }>;
  summary: string;
}

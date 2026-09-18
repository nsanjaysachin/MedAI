import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  FileText, 
  TrendingUp, 
  ArrowLeftRight, 
  Calendar, 
  HelpCircle, 
  Pill, 
  User as UserIcon, 
  Sparkles, 
  UploadCloud, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X,
  Stethoscope,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { api } from './services/api';
import { User, MedicalDocument, MarkerTrend, TimelineEvent, DoctorQuestion, Medication } from './types';
import { LoginScreen } from './components/LoginScreen';
import { DashboardOverview } from './components/DashboardOverview';
import { DocumentList } from './components/DocumentList';
import { ReportUpload } from './components/ReportUpload';
import { ReportDetail } from './components/ReportDetail';
import { HealthTrends } from './components/HealthTrends';
import { ReportComparison } from './components/ReportComparison';
import { HealthTimeline } from './components/HealthTimeline';
import { AIAssistant } from './components/AIAssistant';
import { DoctorQuestions } from './components/DoctorQuestions';
import { MedicationOrganizer } from './components/MedicationOrganizer';
import { ProfilePage } from './components/ProfilePage';
import { auth, signOut as firebaseSignOut } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type AppRoute = 
  | 'dashboard' 
  | 'reports' 
  | 'upload' 
  | 'report-detail' 
  | 'trends' 
  | 'compare' 
  | 'timeline' 
  | 'assistant' 
  | 'doctor-questions' 
  | 'medications' 
  | 'profile';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [trends, setTrends] = useState<MarkerTrend[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [doctorQuestions, setDoctorQuestions] = useState<DoctorQuestion[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize data and Firebase auth listener on mount
  useEffect(() => {
    bootstrapApp();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const res = await api.loginGoogle({
            id: fbUser.uid,
            name: fbUser.displayName || 'Patient',
            email: fbUser.email || '',
          });
          setUser(res.user);
          await refreshAllData();
        } catch (e) {
          console.error('Failed syncing Firebase Google user:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const bootstrapApp = async () => {
    try {
      const meData = await api.getMe().catch(() => null);
      if (meData?.user) {
        setUser(meData.user);
        await refreshAllData();
      }
    } catch (err) {
      console.warn('Initial session check:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllData = async () => {
    try {
      const [docsRes, trendsRes, timelineRes, questionsRes, medsRes] = await Promise.all([
        api.getDocuments().catch(() => ({ documents: [] })),
        api.getTrends().catch(() => ({ trends: [] })),
        api.getTimeline().catch(() => ({ events: [] })),
        api.getQuestions().catch(() => ({ questions: [] })),
        api.getMedications().catch(() => ({ medications: [] })),
      ]);
      setDocuments(docsRes.documents || []);
      setTrends(trendsRes.trends || []);
      setTimelineEvents(timelineRes.events || []);
      setDoctorQuestions(questionsRes.questions || []);
      setMedications(medsRes.medications || []);
    } catch (err) {
      console.error('Failed refreshing medical data:', err);
    }
  };

  const handleLoginSuccess = async (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentRoute('dashboard');
    await refreshAllData();
  };

  const handleSelectDocument = (docId: string) => {
    setSelectedDocId(docId);
    setCurrentRoute('report-detail');
  };

  const handleAskAssistant = (prompt: string) => {
    setAssistantInitialPrompt(prompt);
    setCurrentRoute('assistant');
  };

  const handleUploadSuccess = (newDoc: MedicalDocument) => {
    setSelectedDocId(newDoc.id);
    refreshAllData();
    setCurrentRoute('report-detail');
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await api.deleteDocument(docId);
      await refreshAllData();
      if (selectedDocId === docId) {
        setSelectedDocId(null);
        setCurrentRoute('reports');
      }
    } catch (err) {
      console.error('Delete document failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut();
    } catch (e) {
      console.error('Firebase sign out error:', e);
    }
    await api.logout();
    setUser(null);
    setDocuments([]);
    setTrends([]);
    setTimelineEvents([]);
    setDoctorQuestions([]);
    setMedications([]);
    setCurrentRoute('dashboard');
  };

  const selectedDocument = documents.find((d) => d.id === selectedDocId) || documents[0];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'reports', label: 'Medical Reports', icon: FileText, count: documents.length },
    { id: 'trends', label: 'Health Trends', icon: TrendingUp },
    { id: 'compare', label: 'Compare Reports', icon: ArrowLeftRight },
    { id: 'timeline', label: 'Health Timeline', icon: Calendar },
    { id: 'assistant', label: 'AI Assistant', icon: Sparkles, highlight: true },
    { id: 'doctor-questions', label: 'Doctor Questions', icon: HelpCircle, count: doctorQuestions.filter(q => !q.is_completed).length },
    { id: 'medications', label: 'Medications', icon: Pill, count: medications.length },
    { id: 'profile', label: 'Profile & Privacy', icon: ShieldCheck },
  ];

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-700">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shadow-sm mb-4 animate-pulse">
          <Activity className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">MEDAI Health Portal</h2>
        <p className="text-xs text-slate-500 mt-1">Verifying secure clinical credentials...</p>
      </div>
    );
  }

  // Not logged in: Start immediately from the Login Screen!
  if (!user) {
    return <LoginScreen onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row selection:bg-teal-500/20">
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div 
          onClick={() => setCurrentRoute('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base tracking-tight">MEDAI</span>
            <span className="text-[10px] text-teal-700 font-semibold ml-1.5 px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200">
              Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentRoute('upload')}
            className="p-2 rounded-xl bg-teal-600 text-white shadow-xs cursor-pointer"
            title="Upload Report"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 shadow-sm ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Logo & Header */}
          <div className="p-5 border-b border-slate-100">
            <div 
              onClick={() => {
                setCurrentRoute('dashboard');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/10 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">MEDAI</span>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    Vault
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                  Medical Report Assistant
                </p>
              </div>
            </div>

            {/* Security Badge */}
            <div className="mt-3.5 py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Encrypted Session</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">HIPAA Compliant</span>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="p-3.5">
            <button
              onClick={() => {
                setCurrentRoute('upload');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload New Report</span>
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 space-y-1 py-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentRoute(item.id as AppRoute);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white font-semibold shadow-xs'
                      : item.highlight
                      ? 'text-teal-700 hover:bg-teal-50'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                      isActive ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User profile footer in sidebar */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
              <div 
                onClick={() => {
                  setCurrentRoute('profile');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2.5 overflow-hidden cursor-pointer flex-1 mr-1"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {user.name ? user.name[0].toUpperCase() : 'P'}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-slate-900 truncate text-[11px]">{user.name || 'Patient'}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
        {/* Top Navbar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Patient Records: <strong className="text-slate-900">{user.name}</strong></span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Active Vault
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentRoute('upload')}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>
        </header>

        {/* Dynamic Route View */}
        <div className="p-4 sm:p-8 flex-1">
          {currentRoute === 'dashboard' && (
            <DashboardOverview
              user={user}
              documents={documents}
              questions={doctorQuestions}
              onNavigate={(route) => setCurrentRoute(route as AppRoute)}
              onSelectDocument={handleSelectDocument}
            />
          )}

          {currentRoute === 'reports' && (
            <DocumentList
              documents={documents}
              onSelectDocument={handleSelectDocument}
              onUploadClick={() => setCurrentRoute('upload')}
              onCompareReports={() => setCurrentRoute('compare')}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {currentRoute === 'upload' && (
            <ReportUpload
              onUploadSuccess={handleUploadSuccess}
              onCancel={() => setCurrentRoute('dashboard')}
            />
          )}

          {currentRoute === 'report-detail' && selectedDocument && (
            <ReportDetail
              document={selectedDocument}
              onBack={() => setCurrentRoute('reports')}
              onCompareWith={(docId) => {
                setCurrentRoute('compare');
              }}
              onAskAssistant={handleAskAssistant}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {currentRoute === 'trends' && (
            <HealthTrends
              trends={trends}
              onSelectDocument={handleSelectDocument}
            />
          )}

          {currentRoute === 'compare' && (
            <ReportComparison
              documents={documents}
              onSelectDocument={handleSelectDocument}
            />
          )}

          {currentRoute === 'timeline' && (
            <HealthTimeline
              events={timelineEvents}
              onSelectDocument={handleSelectDocument}
              onRefreshEvents={refreshAllData}
            />
          )}

          {currentRoute === 'assistant' && (
            <AIAssistant
              initialPrompt={assistantInitialPrompt}
              onAddDoctorQuestion={async (q) => {
                await api.addQuestion(q, 'Understanding the result');
                refreshAllData();
              }}
            />
          )}

          {currentRoute === 'doctor-questions' && (
            <DoctorQuestions
              questions={doctorQuestions}
              onRefreshQuestions={refreshAllData}
            />
          )}

          {currentRoute === 'medications' && (
            <MedicationOrganizer
              medications={medications}
              onRefreshMedications={refreshAllData}
            />
          )}

          {currentRoute === 'profile' && (
            <ProfilePage
              user={user}
              onLogout={handleLogout}
              onUserUpdated={(u) => setUser(u)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

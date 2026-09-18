import { 
  MedicalDocument, 
  MarkerTrend, 
  ReportComparisonResult, 
  TimelineEvent, 
  Medication, 
  DoctorQuestion,
  ChatSession,
  User
} from "../types";

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("medai_token") || null;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("medai_token", token);
    } else {
      localStorage.removeItem("medai_token");
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async login(email: string): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(userData: { name: string; email: string; date_of_birth?: string; gender?: string }): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    this.setToken(data.token);
    return data;
  }

  async loginGoogle(userData: { id: string; name: string; email: string }): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    this.setToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    await this.request("/api/auth/logout", { method: "POST" }).catch(() => {});
    this.setToken(null);
  }

  async getMe(): Promise<{ user: User; profile: any }> {
    return this.request<{ user: User; profile: any }>("/api/users/me");
  }

  async deleteAccount(): Promise<void> {
    await this.request("/api/users/me", { method: "DELETE" });
    this.setToken(null);
  }

  // Documents
  async getDocuments(): Promise<{ documents: MedicalDocument[] }> {
    return this.request<{ documents: MedicalDocument[] }>("/api/documents");
  }

  async getDocument(id: string): Promise<{ document: MedicalDocument }> {
    return this.request<{ document: MedicalDocument }>(`/api/documents/${id}`);
  }

  async deleteDocument(id: string): Promise<void> {
    await this.request(`/api/documents/${id}`, { method: "DELETE" });
  }

  async uploadDocument(payload: {
    filename: string;
    rawText: string;
    file_size?: number;
    mime_type?: string;
    report_date?: string;
  }): Promise<{ document: MedicalDocument }> {
    return this.request<{ document: MedicalDocument }>("/api/documents/upload", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Trends
  async getTrends(): Promise<{ trends: MarkerTrend[] }> {
    return this.request<{ trends: MarkerTrend[] }>("/api/trends");
  }

  async getTrend(marker: string): Promise<{ trend: MarkerTrend }> {
    return this.request<{ trend: MarkerTrend }>(`/api/trends/${marker}`);
  }

  // Comparison
  async compareReports(reportAId: string, reportBId: string): Promise<{ comparison: ReportComparisonResult }> {
    return this.request<{ comparison: ReportComparisonResult }>("/api/reports/compare", {
      method: "POST",
      body: JSON.stringify({ reportAId, reportBId }),
    });
  }

  // Timeline
  async getTimeline(): Promise<{ events: TimelineEvent[] }> {
    return this.request<{ events: TimelineEvent[] }>("/api/timeline");
  }

  async addTimelineEvent(event: Partial<TimelineEvent>): Promise<{ event: TimelineEvent }> {
    return this.request<{ event: TimelineEvent }>("/api/timeline", {
      method: "POST",
      body: JSON.stringify(event),
    });
  }

  // Assistant
  async sendChatMessage(message: string, sessionId?: string): Promise<{
    reply: string;
    sources: any[];
    session: ChatSession;
  }> {
    return this.request("/api/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ message, sessionId }),
    });
  }

  async getChatSessions(): Promise<{ sessions: ChatSession[] }> {
    return this.request<{ sessions: ChatSession[] }>("/api/assistant/sessions");
  }

  // Doctor Questions
  async getQuestions(): Promise<{ questions: DoctorQuestion[] }> {
    return this.request<{ questions: DoctorQuestion[] }>("/api/questions");
  }

  async addQuestion(question: string, category: string, document_id?: string): Promise<{ question: DoctorQuestion }> {
    return this.request<{ question: DoctorQuestion }>("/api/questions", {
      method: "POST",
      body: JSON.stringify({ question, category, document_id }),
    });
  }

  async toggleQuestion(id: string, is_completed: boolean): Promise<{ question: DoctorQuestion }> {
    return this.request<{ question: DoctorQuestion }>(`/api/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_completed }),
    });
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.request(`/api/questions/${id}`, { method: "DELETE" });
  }

  // Medications
  async getMedications(): Promise<{ medications: Medication[] }> {
    return this.request<{ medications: Medication[] }>("/api/medications");
  }

  async addMedication(med: Partial<Medication>): Promise<{ medication: Medication }> {
    return this.request<{ medication: Medication }>("/api/medications", {
      method: "POST",
      body: JSON.stringify(med),
    });
  }

  async deleteMedication(id: string): Promise<void> {
    await this.request(`/api/medications/${id}`, { method: "DELETE" });
  }

  // Audit
  async getAuditLogs(): Promise<{ logs: any[] }> {
    return this.request<{ logs: any[] }>("/api/audit-logs");
  }
}

export const api = new ApiService();

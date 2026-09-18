import { 
  User, 
  UserProfile, 
  MedicalDocument, 
  MedicalMarker, 
  TimelineEvent, 
  Medication, 
  DoctorQuestion,
  ChatSession,
  ChatMessage,
  AuditLog,
  ReportComparisonResult,
  MarkerTrend
} from "../src/types";

class MemoryDatabase {
  users: Map<string, User> = new Map();
  userProfiles: Map<string, UserProfile> = new Map();
  documents: Map<string, MedicalDocument> = new Map();
  markers: Map<string, MedicalMarker> = new Map();
  timelineEvents: Map<string, TimelineEvent> = new Map();
  medications: Map<string, Medication> = new Map();
  doctorQuestions: Map<string, DoctorQuestion> = new Map();
  chatSessions: Map<string, ChatSession> = new Map();
  auditLogs: AuditLog[] = [];

  constructor() {
    // Initialized empty - user data is populated upon user login and document uploads
  }

  // User methods
  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  createUser(data: { name: string; email: string; date_of_birth?: string; gender?: string }): User {
    const user: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      email: data.email,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      created_at: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    this.userProfiles.set(user.id, {
      id: `prof_${user.id}`,
      user_id: user.id,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      preferences: {
        notifications: true,
        highContrast: false,
        educationalDetail: "comprehensive",
      },
    });
    this.auditLogs.push({
      id: `log_${Date.now()}`,
      user_id: user.id,
      action: "USER_REGISTERED",
      resource_type: "USER",
      resource_id: user.id,
      created_at: new Date().toISOString(),
    });
    return user;
  }

  upsertGoogleUser(data: { id: string; name: string; email: string }): User {
    let user = this.users.get(data.id) || this.getUserByEmail(data.email);
    if (!user) {
      user = {
        id: data.id,
        name: data.name,
        email: data.email,
        created_at: new Date().toISOString(),
      };
      this.users.set(user.id, user);
      this.userProfiles.set(user.id, {
        id: `prof_${user.id}`,
        user_id: user.id,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        preferences: {
          notifications: true,
          highContrast: false,
          educationalDetail: "comprehensive",
        },
      });
      this.auditLogs.push({
        id: `log_${Date.now()}`,
        user_id: user.id,
        action: "GOOGLE_USER_AUTHENTICATED",
        resource_type: "USER",
        resource_id: user.id,
        created_at: new Date().toISOString(),
      });
    } else {
      user.name = data.name || user.name;
      user.email = data.email || user.email;
      this.users.set(user.id, user);
    }
    return user;
  }

  // Documents
  getUserDocuments(userId: string): MedicalDocument[] {
    return Array.from(this.documents.values())
      .filter((d) => d.user_id === userId)
      .sort((a, b) => new Date(b.report_date || b.uploaded_at).getTime() - new Date(a.report_date || a.uploaded_at).getTime());
  }

  getDocument(docId: string): MedicalDocument | undefined {
    const doc = this.documents.get(docId);
    if (!doc) return undefined;
    const docMarkers = Array.from(this.markers.values()).filter((m) => m.document_id === docId);
    return { ...doc, markers: docMarkers };
  }

  saveDocument(doc: MedicalDocument, markers: MedicalMarker[] = []): MedicalDocument {
    this.documents.set(doc.id, doc);
    for (const m of markers) {
      this.markers.set(m.id, m);
    }
    this.auditLogs.push({
      id: `log_${Date.now()}`,
      user_id: doc.user_id,
      action: "DOCUMENT_UPLOADED",
      resource_type: "DOCUMENT",
      resource_id: doc.id,
      created_at: new Date().toISOString(),
    });
    return this.getDocument(doc.id)!;
  }

  deleteDocument(docId: string, userId: string): boolean {
    const doc = this.documents.get(docId);
    if (!doc || doc.user_id !== userId) return false;

    // Delete associated markers
    for (const [mId, m] of this.markers.entries()) {
      if (m.document_id === docId) {
        this.markers.delete(mId);
      }
    }

    // Delete associated timeline events
    for (const [eId, e] of this.timelineEvents.entries()) {
      if (e.document_id === docId) {
        this.timelineEvents.delete(eId);
      }
    }

    this.documents.delete(docId);
    this.auditLogs.push({
      id: `log_${Date.now()}`,
      user_id: userId,
      action: "DOCUMENT_DELETED",
      resource_type: "DOCUMENT",
      resource_id: docId,
      created_at: new Date().toISOString(),
    });
    return true;
  }

  // Trends
  getUserTrends(userId: string): MarkerTrend[] {
    const userDocs = this.getUserDocuments(userId).sort(
      (a, b) => new Date(a.report_date || a.uploaded_at).getTime() - new Date(b.report_date || b.uploaded_at).getTime()
    );

    const markerMap = new Map<string, { name: string; category: any; unit: string; points: any[] }>();

    for (const doc of userDocs) {
      const docMarkers = Array.from(this.markers.values()).filter((m) => m.document_id === doc.id);
      for (const m of docMarkers) {
        if (m.value_numeric === null) continue;
        if (!markerMap.has(m.normalized_name)) {
          markerMap.set(m.normalized_name, {
            name: m.name,
            category: m.category,
            unit: m.unit,
            points: [],
          });
        }
        markerMap.get(m.normalized_name)!.points.push({
          date: m.recorded_date || doc.report_date || doc.uploaded_at.split("T")[0],
          document_id: doc.id,
          document_title: doc.filename,
          value: m.value_numeric,
          unit: m.unit,
          reference_min: m.reference_min,
          reference_max: m.reference_max,
          status: m.status,
        });
      }
    }

    const trends: MarkerTrend[] = [];
    for (const [normName, data] of markerMap.entries()) {
      let direction: MarkerTrend["direction"] = "insufficient_data";
      let observation = "Not enough historical data to establish a trend.";

      if (data.points.length >= 2) {
        const first = data.points[0].value;
        const last = data.points[data.points.length - 1].value;
        const diff = last - first;

        if (Math.abs(diff) < 0.05 * first) {
          direction = "stable";
          observation = `Recorded values remained stable around ${last} ${data.unit} across ${data.points.length} reports.`;
        } else if (diff > 0) {
          direction = "increased";
          observation = `Your recorded values have increased from ${first} to ${last} ${data.unit} across the available reports.`;
        } else {
          direction = "decreased";
          observation = `Your recorded values have decreased from ${first} to ${last} ${data.unit} across the available reports.`;
        }
      }

      trends.push({
        marker_name: data.name,
        normalized_name: normName,
        category: data.category,
        unit: data.unit,
        points: data.points,
        direction,
        observation,
      });
    }

    return trends;
  }

  // Comparison
  compareReports(reportAId: string, reportBId: string, userId: string): ReportComparisonResult | null {
    const rA = this.getDocument(reportAId);
    const rB = this.getDocument(reportBId);
    if (!rA || !rB || rA.user_id !== userId || rB.user_id !== userId) return null;

    const markersA = rA.markers || [];
    const markersB = rB.markers || [];

    const mapA = new Map(markersA.map((m) => [m.normalized_name, m]));
    const mapB = new Map(markersB.map((m) => [m.normalized_name, m]));

    const increased: any[] = [];
    const decreased: any[] = [];
    const enteredNormal: any[] = [];
    const leftNormal: any[] = [];
    const unchanged: any[] = [];
    const newMarkers: any[] = [];
    const removedMarkers: any[] = [];

    for (const [key, mb] of mapB.entries()) {
      if (!mapA.has(key)) {
        if (mb.value_numeric !== null) {
          newMarkers.push({ name: mb.name, valB: mb.value_numeric, unit: mb.unit, statusB: mb.status });
        }
      } else {
        const ma = mapA.get(key)!;
        if (ma.value_numeric !== null && mb.value_numeric !== null) {
          const delta = mb.value_numeric - ma.value_numeric;
          if (delta > 0.001) {
            increased.push({ name: mb.name, valA: ma.value_numeric, valB: mb.value_numeric, unit: mb.unit, change: delta });
          } else if (delta < -0.001) {
            decreased.push({ name: mb.name, valA: ma.value_numeric, valB: mb.value_numeric, unit: mb.unit, change: delta });
          } else {
            unchanged.push({ name: mb.name, valA: ma.value_numeric, valB: mb.value_numeric, unit: mb.unit });
          }

          if (ma.status !== "NORMAL_RANGE" && mb.status === "NORMAL_RANGE") {
            enteredNormal.push({ name: mb.name, valA: ma.value_numeric, valB: mb.value_numeric, unit: mb.unit, statusA: ma.status, statusB: mb.status });
          } else if (ma.status === "NORMAL_RANGE" && mb.status !== "NORMAL_RANGE") {
            leftNormal.push({ name: mb.name, valA: ma.value_numeric, valB: mb.value_numeric, unit: mb.unit, statusA: ma.status, statusB: mb.status });
          }
        }
      }
    }

    for (const [key, ma] of mapA.entries()) {
      if (!mapB.has(key) && ma.value_numeric !== null) {
        removedMarkers.push({ name: ma.name, valA: ma.value_numeric, unit: ma.unit, statusA: ma.status });
      }
    }

    const summary = `Comparison between ${rA.filename} (${rA.report_date}) and ${rB.filename} (${rB.report_date}): ${enteredNormal.length} marker(s) entered normal reference limits, ${leftNormal.length} left normal limits, ${increased.length} increased, and ${decreased.length} decreased.`;

    return {
      reportA: rA,
      reportB: rB,
      increased,
      decreased,
      enteredNormal,
      leftNormal,
      unchanged,
      newMarkers,
      removedMarkers,
      summary,
    };
  }

  // Timeline
  getUserTimeline(userId: string): TimelineEvent[] {
    return Array.from(this.timelineEvents.values())
      .filter((e) => e.user_id === userId)
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
  }

  addTimelineEvent(event: TimelineEvent): TimelineEvent {
    this.timelineEvents.set(event.id, event);
    return event;
  }

  // Doctor Questions
  getQuestions(userId: string): DoctorQuestion[] {
    return Array.from(this.doctorQuestions.values())
      .filter((q) => q.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addQuestion(q: DoctorQuestion): DoctorQuestion {
    this.doctorQuestions.set(q.id, q);
    return q;
  }

  updateQuestion(id: string, updates: Partial<DoctorQuestion>): DoctorQuestion | null {
    const q = this.doctorQuestions.get(id);
    if (!q) return null;
    const updated = { ...q, ...updates };
    this.doctorQuestions.set(id, updated);
    return updated;
  }

  deleteQuestion(id: string): boolean {
    return this.doctorQuestions.delete(id);
  }

  // Medications
  getMedications(userId: string): Medication[] {
    return Array.from(this.medications.values())
      .filter((m) => m.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addMedication(med: Medication): Medication {
    this.medications.set(med.id, med);
    return med;
  }

  updateMedication(id: string, updates: Partial<Medication>): Medication | null {
    const m = this.medications.get(id);
    if (!m) return null;
    const updated = { ...m, ...updates, updated_at: new Date().toISOString() };
    this.medications.set(id, updated);
    return updated;
  }

  deleteMedication(id: string): boolean {
    return this.medications.delete(id);
  }

  // Chat
  getUserSessions(userId: string): ChatSession[] {
    return Array.from(this.chatSessions.values())
      .filter((s) => s.user_id === userId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.chatSessions.get(sessionId);
  }

  saveSession(session: ChatSession): ChatSession {
    this.chatSessions.set(session.id, session);
    return session;
  }

  // Audit
  getAuditLogs(userId: string): AuditLog[] {
    return this.auditLogs
      .filter((l) => l.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Account deletion
  deleteUserAccount(userId: string): boolean {
    this.users.delete(userId);
    this.userProfiles.delete(userId);
    for (const [id, d] of this.documents.entries()) {
      if (d.user_id === userId) this.documents.delete(id);
    }
    for (const [id, m] of this.markers.entries()) {
      if (m.user_id === userId) this.markers.delete(id);
    }
    for (const [id, e] of this.timelineEvents.entries()) {
      if (e.user_id === userId) this.timelineEvents.delete(id);
    }
    for (const [id, med] of this.medications.entries()) {
      if (med.user_id === userId) this.medications.delete(id);
    }
    for (const [id, q] of this.doctorQuestions.entries()) {
      if (q.user_id === userId) this.doctorQuestions.delete(id);
    }
    for (const [id, s] of this.chatSessions.entries()) {
      if (s.user_id === userId) this.chatSessions.delete(id);
    }
    return true;
  }
}

export const db = new MemoryDatabase();

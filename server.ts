import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./server/dbStore";
import { extractMarkersWithAI, askMedicalAssistant } from "./server/aiService";
import { MedicalDocument, MedicalMarker, TimelineEvent } from "./src/types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Helper auth resolver
  function getUserId(req: express.Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token.startsWith("token_")) {
        const id = token.replace("token_", "");
        if (db.getUser(id)) return id;
      }
      if (db.getUser(token)) {
        return token;
      }
    }
    return null;
  }

  // ================= API ROUTES =================

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, date_of_birth, gender } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const user = db.createUser({ name, email, date_of_birth, gender });
    res.json({
      user,
      token: `token_${user.id}`,
      token_type: "Bearer",
      expires_in: 86400,
    });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email } = req.body;
    const user = db.getUserByEmail(email || "");
    if (!user) {
      return res.status(401).json({ error: "No account found with this email. Please register or continue with Google." });
    }
    res.json({
      user,
      token: `token_${user.id}`,
      token_type: "Bearer",
      expires_in: 86400,
    });
  });

  app.post("/api/auth/google", (req, res) => {
    const { id, name, email } = req.body;
    if (!id || !email) {
      return res.status(400).json({ error: "Missing required Google user details" });
    }
    const user = db.upsertGoogleUser({ id, name: name || "Patient", email });
    res.json({
      user,
      token: user.id,
      token_type: "Bearer",
      expires_in: 86400,
    });
  });

  app.post("/api/auth/refresh", (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    res.json({
      token: `token_${userId}`,
      token_type: "Bearer",
      expires_in: 86400,
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  // Users
  app.get("/api/users/me", (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const user = db.getUser(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const profile = db.userProfiles.get(userId);
    res.json({ user, profile });
  });

  app.patch("/api/users/me", (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const user = db.getUser(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { name, date_of_birth, gender } = req.body;
    if (name) user.name = name;
    if (date_of_birth) user.date_of_birth = date_of_birth;
    if (gender) user.gender = gender;
    res.json({ user });
  });

  app.delete("/api/users/me", (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    db.deleteUserAccount(userId);
    res.json({ message: "Account and all associated health documents deleted permanently" });
  });

  // Documents
  app.get("/api/documents", (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.json({ documents: [] });
    const docs = db.getUserDocuments(userId);
    res.json({ documents: docs });
  });

  app.get("/api/documents/:id", (req, res) => {
    const doc = db.getDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json({ document: doc });
  });

  app.delete("/api/documents/:id", (req, res) => {
    const userId = getUserId(req);
    const success = db.deleteDocument(req.params.id, userId);
    if (!success) return res.status(404).json({ error: "Document not found or unauthorized" });
    res.json({ message: "Document deleted successfully" });
  });

  // Document Upload & AI Processing
  app.post("/api/documents/upload", async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Authentication required" });
      const { filename, rawText, file_size, mime_type, report_date } = req.body;

      if (!filename) {
        return res.status(400).json({ error: "Filename is required" });
      }

      const docId = `doc_${Date.now()}`;
      const textToAnalyze = rawText || `Sample Report for ${filename}\nHemoglobin: 12.5 g/dL (12.0-16.0)\nGlucose: 95 mg/dL (70-99)\nTotal Cholesterol: 210 mg/dL (<200)`;

      // Call AI Extraction Service
      const aiExtraction = await extractMarkersWithAI(textToAnalyze, filename);

      const markers: MedicalMarker[] = aiExtraction.markers.map((m, idx) => ({
        id: `m_${Date.now()}_${idx}`,
        document_id: docId,
        user_id: userId,
        name: m.name,
        normalized_name: m.normalized_name,
        value_numeric: m.value_numeric,
        value_text: m.value_text,
        unit: m.unit,
        reference_min: m.reference_min,
        reference_max: m.reference_max,
        reference_text: m.reference_text,
        status: m.status,
        category: m.category,
        confidence: m.confidence,
        source_page: 1,
        explanation: m.explanation,
        recorded_date: report_date || aiExtraction.report_date || new Date().toISOString().split("T")[0],
      }));

      const newDoc: MedicalDocument = {
        id: docId,
        user_id: userId,
        filename,
        original_filename: filename,
        document_type: (aiExtraction.document_type as any) || "Blood test",
        mime_type: mime_type || "application/pdf",
        file_size: file_size || 145000,
        storage_path: `/storage/${userId}/${docId}`,
        upload_status: "completed",
        uploaded_at: new Date().toISOString(),
        report_date: report_date || aiExtraction.report_date || new Date().toISOString().split("T")[0],
        facility_name: aiExtraction.facility_name,
        markers,
        analysis: {
          id: `an_${Date.now()}`,
          document_id: docId,
          user_id: userId,
          summary: aiExtraction.summary,
          key_findings: markers
            .filter((m) => m.status !== "NORMAL_RANGE")
            .map((m) => ({
              marker_name: m.name,
              status: m.status,
              value: `${m.value_text} ${m.unit}`,
              note: `Recorded ${m.status === "LOW" ? "below" : "above"} the provided reference range (${m.reference_text}).`,
            })),
          doctor_questions: aiExtraction.doctor_questions,
          model_name: "gemini-3.8-flash",
          created_at: new Date().toISOString(),
        },
      };

      const saved = db.saveDocument(newDoc, markers);

      // Automatically add to timeline
      const timelineEvent: TimelineEvent = {
        id: `ev_${Date.now()}`,
        user_id: userId,
        document_id: docId,
        event_type: "Lab test",
        event_date: saved.report_date,
        title: `${saved.document_type}: ${saved.filename}`,
        description: `${markers.length} markers processed. ${markers.filter((m) => m.status !== "NORMAL_RANGE").length} outside reference bounds.`,
        created_at: new Date().toISOString(),
        category: saved.document_type,
      };
      db.addTimelineEvent(timelineEvent);

      // Automatically populate doctor questions
      for (const qText of aiExtraction.doctor_questions) {
        db.addQuestion({
          id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          user_id: userId,
          document_id: docId,
          question: qText,
          category: "Understanding the result",
          is_completed: false,
          created_at: new Date().toISOString(),
        });
      }

      res.status(201).json({ document: saved });
    } catch (error: any) {
      console.error("Document upload processing error:", error);
      res.status(500).json({ error: "Failed to process medical document" });
    }
  });

  // Markers
  app.get("/api/documents/:id/markers", (req, res) => {
    const doc = db.getDocument(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json({ markers: doc.markers || [] });
  });

  // Trends
  app.get("/api/trends", (req, res) => {
    const userId = getUserId(req);
    const trends = db.getUserTrends(userId);
    res.json({ trends });
  });

  app.get("/api/trends/:marker", (req, res) => {
    const userId = getUserId(req);
    const trends = db.getUserTrends(userId);
    const match = trends.find((t) => t.normalized_name.toLowerCase() === req.params.marker.toLowerCase());
    if (!match) return res.status(404).json({ error: "Marker trend not found" });
    res.json({ trend: match });
  });

  // Comparison
  app.post("/api/reports/compare", (req, res) => {
    const userId = getUserId(req);
    const { reportAId, reportBId } = req.body;
    if (!reportAId || !reportBId) {
      return res.status(400).json({ error: "Both reportAId and reportBId are required" });
    }
    const comparison = db.compareReports(reportAId, reportBId, userId);
    if (!comparison) {
      return res.status(404).json({ error: "One or both reports not found" });
    }
    res.json({ comparison });
  });

  // Timeline
  app.get("/api/timeline", (req, res) => {
    const userId = getUserId(req);
    const events = db.getUserTimeline(userId);
    res.json({ events });
  });

  app.post("/api/timeline", (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Authentication required" });
    const { title, description, event_date, event_type, category } = req.body;
    const event: TimelineEvent = {
      id: `ev_${Date.now()}`,
      user_id: userId,
      event_date: event_date || new Date().toISOString().split("T")[0],
      event_type: event_type || "Note",
      title,
      description,
      category: category || "Personal Note",
      created_at: new Date().toISOString(),
    };
    db.addTimelineEvent(event);
    res.status(201).json({ event });
  });

  // AI Assistant Chat
  app.post("/api/assistant/chat", async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: "Authentication required" });
      const { message, sessionId } = req.body;
      if (!message) return res.status(400).json({ error: "Message is required" });

      const userDocs = db.getUserDocuments(userId);
      const session = sessionId ? db.getSession(sessionId) : null;
      const history = (session?.messages || []).map((m) => ({ role: m.role, content: m.content }));

      const { reply, sources } = await askMedicalAssistant(message, userDocs, history);

      let activeSession = session;
      if (!activeSession) {
        activeSession = {
          id: `sess_${Date.now()}`,
          user_id: userId,
          title: message.slice(0, 30) + (message.length > 30 ? "..." : ""),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: [],
        };
      }

      const userMsg: any = {
        id: `msg_${Date.now()}_u`,
        session_id: activeSession.id,
        role: "user",
        content: message,
        created_at: new Date().toISOString(),
      };
      const assistantMsg: any = {
        id: `msg_${Date.now()}_a`,
        session_id: activeSession.id,
        role: "assistant",
        content: reply,
        sources,
        created_at: new Date().toISOString(),
      };

      activeSession.messages.push(userMsg, assistantMsg);
      activeSession.updated_at = new Date().toISOString();
      db.saveSession(activeSession);

      res.json({
        reply,
        sources,
        session: activeSession,
      });
    } catch (err) {
      console.error("Assistant chat error:", err);
      res.status(500).json({ error: "Failed to generate AI assistant reply" });
    }
  });

  app.get("/api/assistant/sessions", (req, res) => {
    const userId = getUserId(req);
    const sessions = db.getUserSessions(userId);
    res.json({ sessions });
  });

  app.get("/api/assistant/sessions/:id", (req, res) => {
    const session = db.getSession(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({ session });
  });

  // Doctor Questions
  app.get("/api/questions", (req, res) => {
    const userId = getUserId(req);
    const questions = db.getQuestions(userId);
    res.json({ questions });
  });

  app.post("/api/questions", (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Authentication required" });
    const { question, category, document_id } = req.body;
    if (!question) return res.status(400).json({ error: "Question text is required" });
    const q = db.addQuestion({
      id: `q_${Date.now()}`,
      user_id: userId,
      document_id: document_id || null,
      question,
      category: category || "Understanding the result",
      is_completed: false,
      created_at: new Date().toISOString(),
    });
    res.status(201).json({ question: q });
  });

  app.patch("/api/questions/:id", (req, res) => {
    const updated = db.updateQuestion(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Question not found" });
    res.json({ question: updated });
  });

  app.delete("/api/questions/:id", (req, res) => {
    const deleted = db.deleteQuestion(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Question not found" });
    res.json({ message: "Question deleted" });
  });

  // Medications
  app.get("/api/medications", (req, res) => {
    const userId = getUserId(req);
    const medications = db.getMedications(userId);
    res.json({ medications });
  });

  app.post("/api/medications", (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Authentication required" });
    const { name, dose, frequency, start_date, end_date, notes } = req.body;
    if (!name || !dose || !frequency) {
      return res.status(400).json({ error: "Name, dose, and frequency are required" });
    }
    const med = db.addMedication({
      id: `med_${Date.now()}`,
      user_id: userId,
      name,
      dose,
      frequency,
      start_date: start_date || new Date().toISOString().split("T")[0],
      end_date,
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    res.status(201).json({ medication: med });
  });

  app.patch("/api/medications/:id", (req, res) => {
    const updated = db.updateMedication(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Medication not found" });
    res.json({ medication: updated });
  });

  app.delete("/api/medications/:id", (req, res) => {
    const deleted = db.deleteMedication(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Medication not found" });
    res.json({ message: "Medication removed" });
  });

  // Audit logs
  app.get("/api/audit-logs", (req, res) => {
    const userId = getUserId(req);
    const logs = db.getAuditLogs(userId);
    res.json({ logs });
  });

  // ================= VITE / FRONTEND SERVING =================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MEDAI server listening on port ${PORT}`);
  });
}

startServer();

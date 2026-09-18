import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ShieldAlert, 
  FileText, 
  Copy, 
  Check, 
  Plus, 
  HelpCircle,
  Stethoscope,
  Clock
} from 'lucide-react';
import { ChatMessage, ChatSession } from '../types';
import { api } from '../services/api';
import { MedicalDisclaimer } from './MedicalDisclaimer';

interface AIAssistantProps {
  initialPrompt?: string;
  onAddDoctorQuestion: (q: string) => void;
}

const SUGGESTED_PROMPTS = [
  'What changed between my last two reports?',
  'What does LDL mean and why is it measured?',
  'Why is my hemoglobin at 11.9 g/dL?',
  'What questions should I ask my doctor about my lipid panel?',
  'Explain my fasting glucose result in plain terms.',
];

export const AIAssistant: React.FC<AIAssistantProps> = ({
  initialPrompt,
  onAddDoctorQuestion,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>(initialPrompt || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialChat();
  }, []);

  useEffect(() => {
    if (initialPrompt) {
      setInputPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadInitialChat = async () => {
    try {
      const res = await api.getChatSessions();
      if (res.sessions && res.sessions.length > 0) {
        const session = res.sessions[0];
        setSessionId(session.id);
        setMessages(session.messages || []);
      } else {
        // Initial welcome message
        setMessages([
          {
            id: 'msg_welcome',
            session_id: 'default',
            role: 'assistant',
            content: `Hello! I am MEDAI, your medical report assistant. I can explain what your lab markers mean, compare your results across reports, and suggest questions for your physician.\n\n*Important Safety Notice: I provide educational document explanations only and do not provide medical diagnoses or prescribe medications.*`,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load chat session:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      session_id: sessionId || 'default',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(text, sessionId);
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        session_id: res.session?.id || sessionId || 'default',
        role: 'assistant',
        content: res.reply,
        sources: res.sources,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (res.session?.id) setSessionId(res.session.id);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        session_id: sessionId || 'default',
        role: 'assistant',
        content: `Sorry, I encountered an issue retrieving your medical records: ${err.message || 'Network error'}. Please verify your connection or try again.`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[600px] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Medical Report AI Assistant
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              ✦ RAG Grounded
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Ask questions about your uploaded documents, lab terms, or changes over time.
          </p>
        </div>
      </div>

      <MedicalDisclaimer compact />

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] font-semibold text-slate-500 shrink-0">Suggested:</span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-teal-700 border border-slate-200 text-[11px] whitespace-nowrap transition-colors shadow-sm cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2.5 shadow-sm ${
                  isUser
                    ? 'bg-teal-600 text-white font-medium'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Grounded Sources Citing Document Data */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Grounded in Document Records:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white text-[10px] text-slate-700 border border-slate-200 shadow-sm font-medium"
                        >
                          {src.document_title} ({src.date})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!isUser && (
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span>Educational analysis only &bull; Discuss with doctor</span>
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="hover:text-slate-700 flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-teal-600" />
                          <span className="text-teal-600 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 text-xs leading-relaxed justify-start">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-teal-600" />
              <span>Reviewing your medical document records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="relative shrink-0"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask a question about your medical reports or lab terms..."
          className="w-full py-3.5 pl-4 pr-12 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 shadow-sm"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || loading}
          className="absolute right-2 top-2 p-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

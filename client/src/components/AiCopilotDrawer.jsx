import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Trash2,
  Minimize2,
  Maximize2,
  ChevronRight,
  HelpCircle,
  BedDouble,
  FlaskConical,
  Users,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock
} from 'lucide-react';

export default function AiCopilotDrawer({
  isOpen,
  onClose,
  onNavigateTab,
  selectedDate
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `### 👋 Welcome to Helix\n\nI am **Helix**, your **Hospital Operations Intelligence Assistant**. I have complete access to the reconciled dataset covering **01-Jul to 30-Jul-2026** (HIS Admissions, Diagnostic Labs & Manual Bed Sheets).\n\nAsk me any operational question, such as:\n- **"How many ICU beds are available?"**\n- **"What is the total hospital occupancy?"**\n- **"How many lab tests are pending or delayed?"**\n- **"Show active high-severity operational alerts"**`,
      suggestions: [
        "How many ICU beds are available?",
        "What is the total hospital bed occupancy?",
        "How many lab tests are pending or delayed?",
        "Show active operational alerts"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg = {
      id: userMessageId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          date: selectedDate || '2026-07-30'
        })
      });

      const json = await res.json();
      if (json.success) {
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: json.data.answer,
          suggestions: json.data.suggestions,
          actionTab: json.data.actionTab,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(json.error || 'Failed to generate response');
      }
    } catch (err) {
      console.error('AI query error:', err);
      const errorMsg = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ *I encountered an issue retrieving real-time data.* Please try asking about **ICU beds**, **bed occupancy**, **patient flow**, or **lab turnaround times**.`,
        suggestions: ["How many ICU beds are available?", "What is total bed occupancy?"],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: `### 🏥 Helix Reset\n\nI am ready for your next question. Context is synchronized with **${selectedDate}**.`,
        suggestions: [
          "How many ICU beds are available?",
          "What is the total hospital occupancy?",
          "Show delayed lab orders"
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Basic markdown parser for bold, headers and bullet points
  const formatMarkdown = (content) => {
    if (!content) return '';
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-extrabold text-slate-900 text-sm mt-1 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h5 key={idx} className="font-bold text-slate-800 text-xs mt-1">{line.replace(/\*\*/g, '')}</h5>;
      }
      if (line.startsWith('- ')) {
        const parts = line.replace('- ', '').split('**');
        return (
          <li key={idx} className="text-xs text-slate-700 ml-3 list-disc my-0.5 leading-relaxed">
            {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-slate-900 font-bold">{p}</strong> : p)}
          </li>
        );
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
        const parts = line.split('**');
        return (
          <p key={idx} className="text-xs text-slate-700 my-0.5 leading-relaxed">
            {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-slate-900 font-bold">{p}</strong> : p)}
          </p>
        );
      }
      if (!line.trim()) return <div key={idx} className="h-1.5" />;
      
      const parts = line.split('**');
      return (
        <p key={idx} className="text-xs text-slate-700 my-0.5 leading-relaxed">
          {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-slate-900 font-bold">{p}</strong> : p)}
        </p>
      );
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onClose}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white shadow-2xl shadow-sky-900/30 ring-4 ring-sky-100 transition-all hover:scale-105 active:scale-95 cursor-pointer font-sans"
        title="Open Helix AI Assistant"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
        <span className="text-xs font-extrabold tracking-tight">Helix</span>
      </button>
    );
  }

  return (
    <aside className="fixed top-0 right-0 bottom-0 w-84 sm:w-96 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col font-sans select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-700 to-cyan-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-slate-900">Helix</h3>
              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold border border-emerald-200">
                LIVE SYNC
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Operations Intelligence Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            title="Reset conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            title="Close assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Context Banner */}
      <div className="px-4 py-2 bg-sky-50/80 border-b border-sky-100 flex items-center justify-between text-[11px] text-sky-900 font-semibold">
        <div className="flex items-center gap-1.5 truncate">
          <Clock className="w-3.5 h-3.5 text-sky-700 shrink-0" />
          <span className="truncate">Context: {selectedDate} • Shift Ledger</span>
        </div>
        <span className="text-[10px] text-sky-800 font-bold bg-white px-2 py-0.5 rounded border border-sky-200">
          3 Systems
        </span>
      </div>

      {/* Message History Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2 max-w-[92%]">
              {msg.sender === 'ai' && (
                <div className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  HX
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs ${
                  msg.sender === 'user'
                    ? 'bg-sky-700 text-white shadow-md rounded-tr-xs font-medium'
                    : 'bg-white text-slate-800 border border-slate-200/90 shadow-sm rounded-tl-xs space-y-1'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="leading-relaxed">{msg.text}</p>
                ) : (
                  <div>{formatMarkdown(msg.text)}</div>
                )}

                {/* Direct Action Link if provided */}
                {msg.actionTab && (
                  <div className="pt-2 mt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => onNavigateTab(msg.actionTab)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
                    >
                      <span>Open {msg.actionTab.toUpperCase()} View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
              {msg.timestamp}
            </span>

            {/* Quick Suggestion Chips */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 pl-8 max-w-[95%]">
                {msg.suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSendMessage(sug)}
                    className="text-[10px] font-semibold bg-white hover:bg-sky-50 text-sky-800 hover:text-sky-950 border border-sky-200 hover:border-sky-300 px-2.5 py-1 rounded-full transition shadow-2xs text-left cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 animate-pulse">
              HX
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 shadow-sm flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">Analyzing reconciled hospital records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask Helix about ICU beds, occupancy, lab TAT..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-600 font-medium"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className={`p-2.5 rounded-xl text-white transition shadow-sm cursor-pointer ${
              inputQuery.trim() && !isLoading
                ? 'bg-sky-700 hover:bg-sky-800 active:bg-sky-900'
                : 'bg-slate-300 cursor-not-allowed text-slate-500'
            }`}
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-1.5 font-medium">
          Context-aware Helix • 100% grounded in hospital datasets
        </p>
      </div>
    </aside>
  );
}

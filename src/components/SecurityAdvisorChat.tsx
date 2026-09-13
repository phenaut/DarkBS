import React, { useState } from "react";
import { Bot, Send, User, Sparkles, Shield, AlertTriangle, RefreshCw, HelpCircle } from "lucide-react";
import { ScanResult } from "../types";

interface Message {
  role: "user" | "advisor";
  content: string;
  time: string;
}

interface SecurityAdvisorChatProps {
  currentScanResult?: ScanResult | null;
  initialQuestion?: string;
}

const PRESET_QUESTIONS = [
  "Quels sont les premiers réflexes si mon email a fuité ?",
  "Est-ce risqué si seul mon email et mon nom sont dans la fuite ?",
  "Comment savoir si mon compte bancaire est en danger ?",
  "Qu'est-ce qu'une attaque par Credential Stuffing et comment s'en prémunir ?",
];

export const SecurityAdvisorChat: React.FC<SecurityAdvisorChatProps> = ({
  currentScanResult,
  initialQuestion,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "advisor",
      content:
        "Bonjour ! Je suis votre conseiller en cybersécurité et analyse de cybermenaces. Vous pouvez me poser toutes vos questions concernant vos fuites de données, les attaques Dark Web, ou la sécurisation de vos comptes en ligne.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState(initialQuestion || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (questionToSend?: string) => {
    const text = questionToSend !== undefined ? questionToSend : inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ask-security-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          context: currentScanResult
            ? {
                email: currentScanResult.email,
                breachesCount: currentScanResult.breachesCount,
                riskScore: currentScanResult.riskScore,
                found: currentScanResult.found,
              }
            : null,
        }),
      });

      const data = await res.json();
      const advisorMsg: Message = {
        role: "advisor",
        content: data.answer || "Désolé, une erreur est survenue lors de l'analyse.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, advisorMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "advisor",
          content:
            "Erreur réseau lors de la consultation. Pour vous protéger : changez votre mot de passe et activez l'authentification à double facteur (2FA).",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
          <Bot className="w-3.5 h-3.5 text-purple-400" />
          <span>Consultant Cybersécurité & Dark Web IA</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">
          Posez vos questions à l'analyste en <span className="text-purple-400">Cybermenaces</span>
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Comprenez les risques concrets et obtenez des directives pas-à-pas pour contrer les pirates informatiques.
        </p>
      </div>

      {/* Context Banner if an email was already scanned */}
      {currentScanResult && (
        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Contexte actif : <strong>{currentScanResult.email}</strong> ({currentScanResult.breachesCount} fuites, score {currentScanResult.riskScore}/100)
            </span>
          </div>
          <span className="font-mono text-[10px] bg-purple-500/20 px-2 py-0.5 rounded text-purple-300">
            Audit synchronisé
          </span>
        </div>
      )}

      {/* Chat Container */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed space-y-2 ${
                    isUser
                      ? "bg-rose-600 text-white rounded-tr-none shadow-md"
                      : "bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-md"
                  }`}
                >
                  <p className="whitespace-pre-line text-xs sm:text-sm">{msg.content}</p>
                  <span
                    className={`block text-[10px] font-mono text-right ${
                      isUser ? "text-rose-200" : "text-slate-500"
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 text-slate-400 rounded-2xl rounded-tl-none p-3.5 text-xs font-mono flex items-center gap-2">
                <span>L'expert IA analyse votre situation...</span>
              </div>
            </div>
          )}
        </div>

        {/* Preset Suggestions */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] font-mono text-slate-500 shrink-0">Suggestions :</span>
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="advisor-chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Posez votre question de cybersécurité à l'analyste..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
            <button
              id="advisor-chat-send-btn"
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

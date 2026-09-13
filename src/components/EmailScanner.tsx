import React, { useState, useEffect } from "react";
import { Search, ShieldAlert, Sparkles, Database, Lock, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";

interface EmailScannerProps {
  onScan: (email: string) => void;
  isLoading: boolean;
  currentEmail?: string;
}

const SCAN_STEPS = [
  "Interrogation des bases de données Dark Web & forums cybercriminels...",
  "Vérification des listes de diffusion de malwares infostealers (Lumma, RedLine)...",
  "Recherche dans les dépôts de pastes et fuites publiques...",
  "Analyse de criticité des mots de passe compromis...",
  "Génération du diagnostic de sécurité et du plan de remédiation IA...",
];

export const EmailScanner: React.FC<EmailScannerProps> = ({
  onScan,
  isLoading,
  currentEmail = "",
}) => {
  const [emailInput, setEmailInput] = useState(currentEmail);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (currentEmail) {
      setEmailInput(currentEmail);
    }
  }, [currentEmail]);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setCurrentStepIndex(0);
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev + 1) % SCAN_STEPS.length);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = emailInput.trim();
    if (!clean) {
      setValidationError("Veuillez saisir une adresse email.");
      return;
    }
    if (!clean.includes("@") || !clean.includes(".")) {
      setValidationError("Veuillez saisir une adresse email valide (ex: contact@exemple.fr).");
      return;
    }
    setValidationError("");
    onScan(clean);
  };

  const handleQuickTest = (email: string) => {
    setEmailInput(email);
    setValidationError("");
    onScan(email);
  };

  return (
    <div className="w-full">
      {/* Scanner Card */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Glow ambient decoration */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-10 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Scanner d'exposition d'identifiants Dark Web & Cyberattaques
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            Mon adresse email est-elle dans des <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-500 to-amber-400">bases pirates</span> ?
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Analysez instantanément si vos identifiants, mots de passe en clair ou données personnelles circulent sur des forums cybercriminels, malwares voleurs de sessions ou fuites publiques.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="relative flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  id="email-scanner-input"
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (validationError) setValidationError("");
                  }}
                  disabled={isLoading}
                  placeholder="Entrez votre email (ex: prenom.nom@domaine.com)..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-mono text-sm sm:text-base disabled:opacity-50"
                />
              </div>

              <button
                id="email-scanner-submit-btn"
                type="submit"
                disabled={isLoading}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Scan en cours...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-white" />
                    <span>Lancer le scan</span>
                  </>
                )}
              </button>
            </div>

            {validationError && (
              <div className="flex items-center justify-center gap-1.5 mt-2 text-rose-400 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{validationError}</span>
              </div>
            )}
          </form>

          {/* Quick Test Demo Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-slate-400">
            <span className="text-slate-500 font-mono">Essai rapide :</span>
            <button
              id="quick-test-breached-btn"
              type="button"
              onClick={() => handleQuickTest("test@example.com")}
              className="px-2.5 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors font-mono cursor-pointer"
            >
              Adresse avec fuites (test@example.com)
            </button>
            <button
              id="quick-test-clean-btn"
              type="button"
              onClick={() => handleQuickTest(`clean.user.${Math.floor(Date.now() / 1000)}@securite-mail.fr`)}
              className="px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors font-mono cursor-pointer"
            >
              Adresse saine (non fuitée)
            </button>
          </div>

          {/* Radar scan progress display */}
          {isLoading && (
            <div className="mt-6 p-4 rounded-xl bg-slate-950/90 border border-rose-500/30 text-left max-w-xl mx-auto space-y-3 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between text-xs font-mono text-rose-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  RADAR DARK WEB ACTIF
                </span>
                <span>Analyse en temps réel</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 h-full rounded-full animate-pulse w-3/4" />
              </div>
              <p className="text-xs text-slate-300 font-mono flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400 shrink-0" />
                <span>{SCAN_STEPS[currentStepIndex]}</span>
              </p>
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 text-left">
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/40">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Vie privée préservée</h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Aucun mot de passe demandé. Email scanné sans stockage.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/40">
              <Database className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-slate-200">14+ Milliards d'enregistrements</h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Compilations Dark Web, stealer logs, breaches vérifiées.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/40">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Audit & Diagnostic IA</h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Évaluation d'impact et plan d'action immédiat par Gemini.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from "react";
import {
  ScanResult,
  BreachDetail,
} from "../types";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  FileText,
  Calendar,
  Layers,
  CheckCircle2,
  ExternalLink,
  Printer,
  Bell,
  Search,
  Filter,
  Bot,
  Flame,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

interface ScanResultViewProps {
  result: ScanResult;
  onAddToWatchlist: (email: string) => void;
  isInWatchlist: boolean;
  onSwitchToPasswordTab: () => void;
  onAskAI: (question: string) => void;
}

export const ScanResultView: React.FC<ScanResultViewProps> = ({
  result,
  onAddToWatchlist,
  isInWatchlist,
  onSwitchToPasswordTab,
  onAskAI,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedDataType, setSelectedDataType] = useState<string>("all");
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});

  const toggleAction = (idx: number) => {
    setCompletedActions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Collect unique years from breaches
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    result.breaches.forEach((b) => {
      if (b.xposed_date) {
        // extract 4 digits if present
        const match = b.xposed_date.match(/\b(19|20)\d{2}\b/);
        if (match) years.add(match[0]);
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [result.breaches]);

  // Collect common data types
  const availableDataTypes = useMemo(() => {
    const types = new Set<string>();
    result.breaches.forEach((b) => {
      if (b.xposed_data) {
        b.xposed_data.split(";").forEach((t) => {
          const clean = t.trim();
          if (clean) types.add(clean);
        });
      }
    });
    return Array.from(types).slice(0, 10);
  }, [result.breaches]);

  // Filter breaches
  const filteredBreaches = useMemo(() => {
    return result.breaches.filter((b) => {
      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = b.breach.toLowerCase().includes(q);
        const matchDetails = (b.details || "").toLowerCase().includes(q);
        const matchData = (b.xposed_data || "").toLowerCase().includes(q);
        if (!matchName && !matchDetails && !matchData) return false;
      }
      // Year filter
      if (selectedYear !== "all") {
        if (!b.xposed_date || !b.xposed_date.includes(selectedYear)) {
          return false;
        }
      }
      // Data type filter
      if (selectedDataType !== "all") {
        if (!b.xposed_data || !b.xposed_data.includes(selectedDataType)) {
          return false;
        }
      }
      return true;
    });
  }, [result.breaches, searchQuery, selectedYear, selectedDataType]);

  // Print / Export
  const handlePrint = () => {
    window.print();
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITIQUE":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "ÉLEVÉ":
        return "bg-orange-500/20 text-orange-300 border-orange-500/40";
      case "MODÉRÉ":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-rose-400";
    if (score >= 50) return "text-orange-400";
    if (score >= 25) return "text-amber-400";
    return "text-emerald-400";
  };

  const getRiskBg = (score: number) => {
    if (score >= 80) return "bg-rose-500";
    if (score >= 50) return "bg-orange-500";
    if (score >= 25) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Status Banner */}
      <div
        className={`rounded-2xl border p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden ${
          result.found
            ? "bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-950 border-rose-500/40 shadow-rose-950/50 shadow-2xl"
            : "bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border-emerald-500/40 shadow-emerald-950/50 shadow-2xl"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3.5 rounded-2xl shrink-0 border ${
                result.found
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {result.found ? (
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              ) : (
                <ShieldCheck className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {result.email}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getSeverityBadge(
                    result.aiAssessment?.severity || (result.found ? "ÉLEVÉ" : "AUCUN")
                  )}`}
                >
                  NIVEAU : {result.aiAssessment?.severity || (result.found ? "ÉLEVÉ" : "SÉCURISÉ")}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {result.aiAssessment?.headline ||
                  (result.found
                    ? `${result.breachesCount} fuites détectées sur le Dark Web`
                    : "Aucune compromission identifiée")}
              </h2>

              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                {result.found
                  ? `Cette adresse email figure dans au moins ${result.breachesCount} base(s) de données issues de cyberattaques ou de dumps pirates.`
                  : "Votre adresse email n'apparaît dans aucune violation de données répertoriée par nos capteurs Dark Web. Vos informations semblent bien protégées."}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              id="add-watchlist-btn"
              onClick={() => onAddToWatchlist(result.email)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isInWatchlist
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isInWatchlist ? "Dans votre veille" : "Surveiller cet email"}</span>
            </button>

            <button
              id="export-print-btn"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Exporter le rapport</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid (if breaches found) */}
      {result.found && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Risk Score */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Score de Risque Global</span>
              <Flame className={`w-4 h-4 ${getRiskColor(result.riskScore)}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-mono ${getRiskColor(result.riskScore)}`}>
                {result.riskScore}
              </span>
              <span className="text-slate-500 text-xs font-mono">/ 100</span>
            </div>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getRiskBg(result.riskScore)}`}
                style={{ width: `${Math.max(result.riskScore, 5)}%` }}
              />
            </div>
          </div>

          {/* PlainText Passwords Exposure */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Mots de passe en clair</span>
              <AlertTriangle
                className={`w-4 h-4 ${
                  result.passwordStats?.PlainText > 0 ? "text-rose-400 animate-bounce" : "text-slate-500"
                }`}
              />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-3xl font-extrabold font-mono ${
                  result.passwordStats?.PlainText > 0 ? "text-rose-400" : "text-slate-200"
                }`}
              >
                {result.passwordStats?.PlainText ?? 0}
              </span>
              <span className="text-xs text-slate-400">bases en texte brut</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {result.passwordStats?.PlainText > 0
                ? "DANGER CRITIQUE : ces mots de passe sont lisibles immédiatement sans déchiffrement."
                : "Aucun mot de passe enregistré en texte brut non chiffré."}
            </p>
          </div>

          {/* Easy to Crack Passwords */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Faciles à craquer</span>
              <KeyRound className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-amber-400">
                {result.passwordStats?.EasyToCrack ?? 0}
              </span>
              <span className="text-xs text-slate-400">hachages faibles (MD5/SHA1)</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Cassables en quelques secondes via des tables d'arc-en-ciel (rainbow tables).
            </p>
          </div>

          {/* Breaches & Pastes Volume */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Total Fuites & Dumps</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-blue-400">
                {result.breachesCount}
              </span>
              <span className="text-xs text-slate-400">violations vérifiées</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {result.pastesCount > 0
                ? `Plus ${result.pastesCount} dump(s) brut(s) Dark Web / Pastebin.`
                : "Indexé dans des répertoires de données compromises vérifiées."}
            </p>
          </div>
        </div>
      )}

      {/* 3. Gemini AI Cyber Threat Assessment Panel */}
      {result.aiAssessment && (
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-purple-500/30 p-6 sm:p-8 space-y-6 shadow-xl relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Diagnostic d'Exposition & Analyse de Menace IA</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    GEMINI CYBER ENGINE
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Modélisation des vecteurs d'attaque et recommandations adaptées
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                onAskAI(
                  `Mon email ${result.email} est apparu dans ${result.breachesCount} fuites avec un score de ${result.riskScore}/100. Que dois-je faire en priorité absolue ?`
                )
              }
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Approfondir avec l'IA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Threat Explanation */}
          <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 text-sm text-slate-300 leading-relaxed">
            <p className="whitespace-pre-line">{result.aiAssessment.threatAnalysis}</p>
          </div>

          {/* Critical Findings & Phishing Scams (2 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Critical Findings */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold font-mono text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Points de Vulnérabilité Majeurs</span>
              </h4>
              <ul className="space-y-2">
                {result.aiAssessment.criticalFindings?.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-rose-500 mt-0.5">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phishing Scams to Expect */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>Arnaques & Phishing à Anticiper</span>
              </h4>
              <ul className="space-y-2">
                {result.aiAssessment.phishingThreats?.map((threat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{threat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Remediation Checklist */}
          {result.aiAssessment.remediationPlan?.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Plan d'Action Immédiat (Cochez les étapes effectuées)</span>
                </h4>
                <span className="text-xs font-mono text-emerald-400">
                  {Object.values(completedActions).filter(Boolean).length} /{" "}
                  {result.aiAssessment.remediationPlan.length} complété(s)
                </span>
              </div>

              <div className="space-y-2.5">
                {result.aiAssessment.remediationPlan.map((step, idx) => {
                  const isDone = completedActions[idx] || false;
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleAction(idx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isDone
                          ? "bg-emerald-950/30 border-emerald-500/40 text-slate-400 line-through"
                          : "bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleAction(idx)}
                        className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/30 bg-slate-900 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                              step.priority === "URGENT"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : step.priority === "IMPORTANT"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {step.priority}
                          </span>
                          <span className="text-sm font-semibold text-white">{step.action}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{step.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggest checking password */}
          {result.found && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-xs text-slate-300">
                  Voulez-vous vérifier si votre <span className="font-semibold text-white">mot de passe habituel</span> a lui aussi fuité ? (Vérification 100% anonyme sans jamais envoyer votre mot de passe).
                </p>
              </div>
              <button
                onClick={onSwitchToPasswordTab}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition-all cursor-pointer shadow"
              >
                Tester un mot de passe
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. Breaches Explorer (if breaches found) */}
      {result.found && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Détail des {result.breachesCount} Fuites Recensées</span>
                <span className="text-xs font-mono text-slate-400">
                  ({filteredBreaches.length} affichée(s))
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Explorez chaque compromission pour identifier les services d'où proviennent vos données
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrer par service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono w-44"
                />
              </div>

              {/* Year Select */}
              {availableYears.length > 0 && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                >
                  <option value="all">Toutes les années</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      Année {yr}
                    </option>
                  ))}
                </select>
              )}

              {/* Data Type Select */}
              {availableDataTypes.length > 0 && (
                <select
                  value={selectedDataType}
                  onChange={(e) => setSelectedDataType(e.target.value)}
                  className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                >
                  <option value="all">Tous types de données</option>
                  {availableDataTypes.map((dt) => (
                    <option key={dt} value={dt}>
                      {dt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Breaches List */}
          {filteredBreaches.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Aucune fuite ne correspond à vos filtres de recherche.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBreaches.map((breach: BreachDetail, idx: number) => {
                const exposedItems = breach.xposed_data ? breach.xposed_data.split(";") : [];
                const hasPassword = exposedItems.some((i) =>
                  i.toLowerCase().includes("password") || i.toLowerCase().includes("mot de passe")
                );

                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all p-5 space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {breach.logo ? (
                          <img
                            src={breach.logo}
                            alt={breach.breach}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                            className="w-10 h-10 rounded-lg object-contain bg-slate-900 p-1 border border-slate-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold text-sm font-mono">
                            {breach.breach.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="text-base font-bold text-white font-sans group-hover:text-rose-400 transition-colors">
                            {breach.breach}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            {breach.domain && <span>{breach.domain}</span>}
                            {breach.industry && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                {breach.industry}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {breach.xposed_date && (
                          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {breach.xposed_date}
                          </span>
                        )}
                        {breach.xposed_records && (
                          <span className="text-[11px] font-mono text-slate-500 block">
                            {breach.xposed_records.toLocaleString()} comptes
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Breach Details Description */}
                    {breach.details && (
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                        {breach.details.replace(/<\/?[^>]+(>|$)/g, "")}
                      </p>
                    )}

                    {/* Exposed Data Badges */}
                    {exposedItems.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          Données divulguées :
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {exposedItems.map((item, itemIdx) => {
                            const isPwd =
                              item.toLowerCase().includes("password") ||
                              item.toLowerCase().includes("mot de passe");
                            return (
                              <span
                                key={itemIdx}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                  isPwd
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold"
                                    : "bg-slate-900 text-slate-400 border border-slate-800"
                                }`}
                              >
                                {item.trim()}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Breach footer advice */}
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                      {hasPassword ? (
                        <span className="text-rose-400 font-medium flex items-center gap-1">
                          <KeyRound className="w-3 h-3" />
                          Mot de passe à changer
                        </span>
                      ) : (
                        <span className="text-slate-500">Mots de passe non divulgués</span>
                      )}

                      <button
                        onClick={() =>
                          onAskAI(
                            `Que s'est-il passé lors du piratage de ${breach.breach} et que dois-je faire spécifiquement pour sécuriser mes comptes ?`
                          )
                        }
                        className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer font-mono"
                      >
                        <span>Conseils pour {breach.breach}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

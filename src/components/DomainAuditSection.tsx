import React, { useState } from "react";
import { 
  Building2, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet,
  Layers,
  Info,
  Sparkles,
  RefreshCw,
  Mail,
  ShieldCheck,
  ShieldX,
  Lock,
  ExternalLink,
  Calendar,
  Users
} from "lucide-react";
import { DomainAuditResult } from "../types";

export const DomainAuditSection: React.FC = () => {
  const [domainInput, setDomainInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<DomainAuditResult | null>(null);

  const handleScanDomain = async (e?: React.FormEvent, explicitDomain?: string) => {
    if (e) e.preventDefault();
    const targetDomain = (explicitDomain !== undefined ? explicitDomain : domainInput).trim();
    if (!targetDomain) {
      setError("Veuillez renseigner un nom de domaine valide (ex: airfrance.fr, sncf.com, free.fr)");
      return;
    }

    if (explicitDomain !== undefined) {
      setDomainInput(explicitDomain);
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scan-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: targetDomain }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Impossible d'effectuer l'audit réel du domaine.");
      }

      const data: DomainAuditResult = await response.json();
      setAuditResult(data);
    } catch (err: any) {
      setError(err.message || "Erreur de communication avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!auditResult) return;
    const headers = "Domaine,Organisation,Secteur,Score_Risque,Note_Securite,SPF,DMARC,Incidents_Connus_Nombre\n";
    const row = `"${auditResult.domain}","${auditResult.companyName}","${auditResult.sector}","${auditResult.overallRiskScore}","${auditResult.securityRating}","${auditResult.dnsPosture.spfValid ? 'Configuré' : 'Absent'}","${auditResult.dnsPosture.dmarcPolicy}","${auditResult.knownIncidents.length}"\n\nIncidents:\nTitre,Date,Victimes_Estimees,Gravite,Donnees_Exposees,Source\n`;
    
    const incidentRows = auditResult.knownIncidents.map(i => 
      `"${i.title}","${i.date}","${i.recordsCount || 'Non précisé'}","${i.severity}","${i.exposedData.join('; ')}","${i.source}"`
    ).join("\n");

    const blob = new Blob([headers + row + incidentRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `audit_posture_reelle_${auditResult.domain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8" id="domain-audit-container">
      {/* En-tête */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Données 100% Réelles & Vérifiées (DNS & Incidents Publics)</span>
          <span className="text-emerald-500/50">•</span>
          <span>Auteur : <strong className="text-emerald-200">Pierre HENAUT</strong></span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">
          Audit de Posture Réelle & <span className="text-indigo-400">Incidents Historiques</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Évaluez la configuration de sécurité réelle du domaine (serveurs MX, politiques anti-usurpation SPF & DMARC) et consultez l'historique avéré des fuites et cyberattaques ayant touché l'organisation.
        </p>
      </div>

      {/* Formulaire de recherche */}
      <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative backdrop-blur">
        <form onSubmit={handleScanDomain} className="space-y-4">
          <div>
            <label htmlFor="domain-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nom de domaine de l'organisation
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Building2 className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="domain-input"
                placeholder="ex: airfrance.fr, sncf.com, free.fr, lemonde.fr"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className="w-full pl-11 pr-32 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm"
              />
              <button
                type="submit"
                id="btn-scan-domain"
                disabled={loading}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Auditer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              Résolution DNS en direct + croisement avec les bases de failles publiques
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500">Tester :</span>
              {["airfrance.fr", "sncf.com", "bnp.fr", "free.fr", "lemonde.fr", "doctolib.fr"].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => handleScanDomain(undefined, sample)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-300 text-slate-300 font-mono text-[11px] transition-colors cursor-pointer border border-slate-700/60 hover:border-indigo-500/40"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* RÉSULTATS DE L'AUDIT RÉEL */}
      {auditResult && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Bannière de résumé du domaine */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-xl font-bold text-white font-mono">@{auditResult.domain}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                    auditResult.securityRating === "A" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                    auditResult.securityRating === "B" ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" :
                    auditResult.securityRating === "C" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                    "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  }`}>
                    NOTE DE SÉCURITÉ : {auditResult.securityRating}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono ${
                    auditResult.overallRiskScore >= 60 ? "bg-rose-500/15 text-rose-300" : "bg-slate-800 text-slate-300"
                  }`}>
                    Indice de vulnérabilité : {auditResult.overallRiskScore}/100
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
                  <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-md font-medium">
                    Organisation : {auditResult.companyName}
                  </span>
                  <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-md">
                    Secteur : {auditResult.sector}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    Audit DNS effectué le {new Date(auditResult.auditedAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>

                <p className="text-xs text-slate-400 pt-0.5">
                  Analyse technique objective sans simulation • Développé par Pierre HENAUT
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  id="btn-refresh-domain"
                  disabled={loading}
                  onClick={() => handleScanDomain(undefined, auditResult.domain)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Réactualiser les requêtes DNS en direct"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? "animate-spin" : ""}`} />
                  <span>Réactualiser DNS</span>
                </button>

                <button
                  type="button"
                  id="btn-export-csv"
                  onClick={handleExportCSV}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Exporter Rapport</span>
                </button>
              </div>
            </div>

            {/* Statistiques clés réelles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
                <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                  <span>Protection Anti-Phishing</span>
                  <Mail className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-xl font-bold font-mono flex items-center gap-2">
                  {auditResult.dnsPosture.dmarcPolicy === "reject" ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" /> DMARC Strict
                    </span>
                  ) : auditResult.dnsPosture.dmarcPolicy === "quarantine" ? (
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-5 h-5 text-amber-400" /> Quarantaine
                    </span>
                  ) : auditResult.dnsPosture.dmarcPolicy === "none" ? (
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-5 h-5 text-amber-400" /> Passif (none)
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <ShieldX className="w-5 h-5 text-rose-400" /> Non protégé
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  SPF : {auditResult.dnsPosture.spfValid ? "Actif" : "Non configuré"} • DMARC : {auditResult.dnsPosture.dmarcPolicy}
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
                <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                  <span>Incidents Publics Confirmés</span>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {auditResult.knownIncidents.length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {auditResult.knownIncidents.length > 0 
                    ? "Fuites ou intrusions documentées" 
                    : "Aucun incident public répertorié"}
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
                <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                  <span>Serveurs Mail Détectés</span>
                  <Layers className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-indigo-400 font-mono">
                  {auditResult.dnsPosture.mxServers.length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Enregistrements MX actifs</div>
              </div>
            </div>
          </div>

          {/* Section 1 : Vérification Réelle des Enregistrements DNS & Anti-Spoofing */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                <span>Diagnostic Réel de Sécurité DNS (Anti-Usurpation & Messagerie)</span>
              </h4>
              <p className="text-xs text-slate-400">
                Résolution en temps réel des enregistrements DNS autoritatifs pour @{auditResult.domain}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {auditResult.dnsPosture.checks.map((chk, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-xl p-4 border flex flex-col justify-between ${
                    chk.status === "SECURE" ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200" :
                    chk.status === "WARNING" ? "bg-amber-950/20 border-amber-500/30 text-amber-200" :
                    "bg-rose-950/20 border-rose-500/30 text-rose-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-950/80 border border-current">
                        Enregistrement {chk.recordType}
                      </span>
                      {chk.status === "SECURE" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : chk.status === "WARNING" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ShieldX className="w-4 h-4 text-rose-400" />
                      )}
                    </div>

                    <p className="text-xs font-medium leading-snug mb-2">
                      {chk.summary}
                    </p>

                    <div className="p-2 bg-slate-950/80 rounded border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
                      {chk.value}
                    </div>
                  </div>

                  {chk.recommendation && (
                    <div className="mt-3 pt-2 border-t border-current/20 text-[11px] opacity-90">
                      💡 {chk.recommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {auditResult.dnsPosture.mxServers.length > 0 && (
              <div className="mt-4 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Serveurs MX résolus (Routage email officiel) :</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {auditResult.dnsPosture.mxServers.map((mx, idx) => (
                    <span key={idx} className="font-mono text-[11px] px-2 py-1 bg-slate-900 text-slate-300 rounded border border-slate-700/70">
                      {mx}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2 : Incidents et Fuites Réels Documentés */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Incidents & Fuites Publiques Documentées</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Événements de sécurité avérés répertoriés par les autorités (CNIL, CERT) ou les catalogues officiels de data breaches.
                </p>
              </div>

              <div className="text-xs font-mono px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                {auditResult.knownIncidents.length} incident(s) vérifié(s)
              </div>
            </div>

            {auditResult.knownIncidents.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h5 className="text-white font-semibold text-sm">Aucun incident public répertorié pour ce domaine</h5>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Aucune brèche majeure ou exfiltration publique n'a été signalée pour <strong>@{auditResult.domain}</strong> dans les catalogues officiels de sécurité.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {auditResult.knownIncidents.map((incident, idx) => (
                  <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          incident.severity === "Critique" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                          incident.severity === "Élevé" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                          "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        }`}>
                          {incident.severity.toUpperCase()}
                        </span>
                        <h5 className="text-sm font-bold text-white">{incident.title}</h5>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {incident.date}
                        </span>
                        {incident.recordsCount && (
                          <span className="flex items-center gap-1 text-indigo-300">
                            <Users className="w-3.5 h-3.5 text-indigo-400" />
                            ~{incident.recordsCount.toLocaleString("fr-FR")} victimes
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {incident.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-slate-400 text-[11px]">Données compromises :</span>
                      {incident.exposedData.map((data, dIdx) => (
                        <span key={dIdx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                          {data}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Source : <strong className="text-slate-400">{incident.source}</strong></span>
                      <span className="text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Fait avéré
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommandations Opérationnelles pour le RSSI */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Recommandations & Plan d'Action Opérationnel</h4>
                <p className="text-xs text-slate-400">Mesures correctives prioritaires pour le domaine @{auditResult.domain}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {auditResult.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

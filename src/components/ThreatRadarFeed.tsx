import React, { useState, useEffect } from "react";
import { ThreatIntelData, NotableLeak } from "../types";
import { Radio, AlertOctagon, ShieldAlert, Cpu, Bug, ExternalLink, RefreshCw, Layers, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

export const ThreatRadarFeed: React.FC = () => {
  const [intelData, setIntelData] = useState<ThreatIntelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLeakId, setExpandedLeakId] = useState<string | null>("free-2024");

  useEffect(() => {
    fetch("/api/threat-intel")
      .then((r) => r.json())
      .then((data) => {
        setIntelData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Threat intel fetch error:", err);
        setIsLoading(false);
      });
  }, []);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITIQUE":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "ÉLEVÉ":
        return "bg-orange-500/20 text-orange-300 border-orange-500/40";
      default:
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Feed Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
          <span>Surveillance Globale des Fuites Dark Web & Campagnes Cyber</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">
          Radar des Méga-Fuites & <span className="text-blue-400">Cyberattaques Récentes</span>
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Consultez les violations de données massives ayant touché la France et l'international, ainsi que les modes opératoires des cybercriminels.
        </p>
      </div>

      {/* Infostealer Warning Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-500/30 p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0 mt-1">
            <Bug className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                MENACE MAJEURE 2024-2026
              </span>
              <span className="text-xs font-mono text-slate-400">Malwares Infostealers</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Comment les malwares (Lumma, RedLine) volent vos accès sans pirater les sites
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Contrairement aux fuites de serveurs traditionnelles, les <span className="text-rose-400 font-semibold">Infostealers</span> s'exécutent directement sur l'ordinateur de la victime (via de faux installateurs ou jeux piratés). Ils aspirent instantanément les <strong>cookies de session</strong>, l'historique et les mots de passe enregistrés dans Chrome, Edge ou Firefox, permettant aux pirates de se connecter à vos comptes sans même déclencher l'A2F.
            </p>
          </div>
        </div>

        {/* Active malware strains */}
        {intelData?.activeMalwareCampaigns && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {intelData.activeMalwareCampaigns.map((malware, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-rose-400 font-mono">{malware.name}</span>
                <p className="text-slate-300 text-[11px] leading-tight">{malware.target}</p>
                <p className="text-emerald-400 text-[10px] pt-1">Protection : {malware.prevention}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaks Feed List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Violations de Données Majeures Surveillées</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {intelData?.leaks.length || 0} rapports audités
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 font-mono">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>Chargement des données du Dark Web...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {intelData?.leaks.map((leak: NotableLeak) => {
              const isExpanded = expandedLeakId === leak.id;
              return (
                <div
                  key={leak.id}
                  className="rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedLeakId(isExpanded ? null : leak.id)}
                    className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                        <AlertOctagon className="w-5 h-5 text-rose-400" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-white font-sans">{leak.name}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono border ${getSeverityBadge(
                              leak.severity
                            )}`}
                          >
                            {leak.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                          <span>{leak.date}</span>
                          <span>•</span>
                          <span className="text-rose-400 font-semibold">{leak.records} comptes</span>
                          <span>•</span>
                          <span className="text-slate-500">{leak.origin}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 text-xs text-slate-300 animate-fade-in bg-slate-950/40">
                      <div>
                        <span className="font-mono text-slate-400 text-[11px] uppercase block mb-1">
                          Contexte de l'attaque :
                        </span>
                        <p className="leading-relaxed text-slate-300">{leak.description}</p>
                      </div>

                      {/* Exposed items */}
                      <div>
                        <span className="font-mono text-slate-400 text-[11px] uppercase block mb-1.5">
                          Données divulguées dans la fuite :
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {leak.exposed.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono text-[11px]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 space-y-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Mesures de protection recommandées :
                        </span>
                        <p className="text-[11px] leading-relaxed text-slate-300">{leak.recommendations}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

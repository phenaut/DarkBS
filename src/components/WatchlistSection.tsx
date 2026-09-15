import React, { useState } from "react";
import { WatchlistEntry } from "../types";
import { Bell, Plus, Trash2, RefreshCw, ShieldAlert, ShieldCheck, AlertCircle } from "lucide-react";

interface WatchlistSectionProps {
  watchlist: WatchlistEntry[];
  onAdd: (email: string, label: string) => void;
  onRemove: (email: string) => void;
  onScanEmail: (email: string) => void;
}

export const WatchlistSection: React.FC<WatchlistSectionProps> = ({
  watchlist,
  onAdd,
  onRemove,
  onScanEmail,
}) => {
  const [newEmail, setNewEmail] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }
    setError("");
    onAdd(cleanEmail, newLabel.trim() || "Compte");
    setNewEmail("");
    setNewLabel("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
          <Bell className="w-3.5 h-3.5 text-emerald-400" />
          <span>Surveillance Continue & Veille Dark Web</span>
          <span className="text-emerald-500/50">•</span>
          <span>Auteur : <strong className="text-emerald-200">Pierre HENAUT</strong></span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">
          Gestion de votre <span className="text-emerald-400">Liste de Veille</span>
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Enregistrez vos adresses importantes (email personnel, professionnel, famille) pour surveiller leur exposition et les réanalyser en un clic.
        </p>
      </div>

      {/* Add to Watchlist Form */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Ajouter une adresse à la surveillance</span>
        </h3>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <input
              type="email"
              placeholder="Adresse email (ex: contact@domaine.com)"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                if (error) setError("");
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <div className="sm:col-span-4">
            <input
              type="text"
              placeholder="Libellé (ex: Personnel, Pro)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="text-rose-400 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Watchlist Table / Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider">
          Adresses surveillées ({watchlist.length})
        </h3>

        {watchlist.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-sm">
            Votre liste de veille est vide pour le moment. Ajoutez une adresse ci-dessus ou scannez un email pour l'enregistrer.
          </div>
        ) : (
          <div className="space-y-2.5">
            {watchlist.map((entry) => {
              const hasBreaches = (entry.breachesCount || 0) > 0;
              return (
                <div
                  key={entry.email}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 ${
                        hasBreaches
                          ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                          : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      }`}
                    >
                      {hasBreaches ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm font-mono">{entry.email}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {entry.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                        {entry.lastScanned && <span>Scanné le {entry.lastScanned}</span>}
                        {entry.breachesCount !== undefined && (
                          <span className={hasBreaches ? "text-rose-400 font-bold" : "text-emerald-400"}>
                            {entry.breachesCount} fuite(s)
                          </span>
                        )}
                        {entry.riskScore !== undefined && hasBreaches && (
                          <span className="text-amber-400">Score {entry.riskScore}/100</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onScanEmail(entry.email)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Scanner</span>
                    </button>
                    <button
                      onClick={() => onRemove(entry.email)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Supprimer de la veille"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

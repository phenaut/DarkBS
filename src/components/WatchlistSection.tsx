import React, { useState, useRef } from "react";
import { WatchlistEntry } from "../types";
import {
  Bell,
  Plus,
  Trash2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  UploadCloud,
  FileText,
  CheckCircle2,
  X,
} from "lucide-react";

interface WatchlistSectionProps {
  watchlist: WatchlistEntry[];
  onAdd: (email: string, label: string) => void;
  onAddMultiple?: (entries: { email: string; label: string }[]) => void;
  onRemove: (email: string) => void;
  onScanEmail: (email: string) => void;
  onRefreshAll?: () => Promise<void> | void;
  isRefreshingAll?: boolean;
  refreshProgress?: { current: number; total: number; currentEmail: string } | null;
}

export const WatchlistSection: React.FC<WatchlistSectionProps> = ({
  watchlist,
  onAdd,
  onAddMultiple,
  onRemove,
  onScanEmail,
  onRefreshAll,
  isRefreshingAll = false,
  refreshProgress = null,
}) => {
  const [newEmail, setNewEmail] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState("");
  const [importStatus, setImportStatus] = useState<{
    count: number;
    skipped: number;
    fileName: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }
    setError("");
    onAdd(cleanEmail, newLabel.trim() || "Compte");
    setNewEmail("");
    setNewLabel("");
  };

  const processFileContent = (content: string, fileName: string) => {
    // Split lines by newline (CRLF or LF)
    const lines = content.split(/\r?\n/);
    const validEmails: string[] = [];
    let skipped = 0;

    const existingEmails = new Set(watchlist.map((w) => w.email.toLowerCase()));

    for (const rawLine of lines) {
      const line = rawLine.trim();
      // Skip empty lines or comment lines starting with #
      if (!line || line.startsWith("#")) continue;

      // Extract email: support either plain email or "email,label" or "email;label"
      const firstToken = line.split(/[,;\s]+/)[0].trim().toLowerCase();
      if (emailRegex.test(firstToken)) {
        if (!existingEmails.has(firstToken) && !validEmails.includes(firstToken)) {
          validEmails.push(firstToken);
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    if (validEmails.length === 0) {
      setError(
        skipped > 0
          ? `Aucune nouvelle adresse email valide trouvée (${skipped} ligne(s) ignorée(s) ou déjà dans votre veille).`
          : "Le fichier ne contient aucune adresse email valide."
      );
      return;
    }

    const labelBase = fileName.replace(/\.[^/.]+$/, "").slice(0, 20);
    const newEntries = validEmails.map((email) => ({
      email,
      label: `Import: ${labelBase}`,
    }));

    if (onAddMultiple) {
      onAddMultiple(newEntries);
    } else {
      newEntries.forEach((entry) => onAdd(entry.email, entry.label));
    }

    setError("");
    setImportStatus({
      count: validEmails.length,
      skipped,
      fileName,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processFileContent(content, file.name);
      }
    };
    reader.onerror = () => {
      setError("Erreur lors de la lecture du fichier.");
    };
    reader.readAsText(file);

    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processFileContent(content, file.name);
      }
    };
    reader.onerror = () => {
      setError("Erreur lors de la lecture du fichier glissé-déposé.");
    };
    reader.readAsText(file);
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
          Enregistrez vos adresses importantes individuellement ou par importation de fichier (1 email par ligne) pour surveiller leur exposition en continu.
        </p>
      </div>

      {/* Add Methods Container (Form + File Import) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Individual Add to Watchlist Form (7 cols) */}
        <div className="md:col-span-7 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Ajouter une adresse unique</span>
            </h3>
            <p className="text-xs text-slate-400">
              Saisissez manuellement un email et son étiquette.
            </p>
          </div>

          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <input
                id="watchlist-single-email"
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
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <input
                  id="watchlist-single-label"
                  type="text"
                  placeholder="Libellé (ex: Personnel, Pro)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-4">
                <button
                  id="watchlist-add-btn"
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="text-rose-400 text-xs flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right: File Import Zone (5 cols) */}
        <div
          id="watchlist-file-import-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`md:col-span-5 rounded-2xl border-2 border-dashed p-5 sm:p-6 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 relative ${
            isDragging
              ? "border-emerald-400 bg-emerald-950/20"
              : "border-slate-800 hover:border-emerald-500/50 bg-slate-900/60 hover:bg-slate-900/90"
          }`}
        >
          <input
            id="watchlist-file-input"
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv,.list,text/plain,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UploadCloud className="w-6 h-6 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white font-sans flex items-center justify-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Importer un fichier</span>
            </h4>
            <p className="text-xs text-slate-400">
              Format texte : <strong className="text-emerald-300">1 email par ligne</strong>
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-500 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
            .txt, .csv ou glisser-déposer
          </div>
        </div>
      </div>

      {/* Import feedback alert */}
      {importStatus && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>{importStatus.count}</strong> adresse(s) importée(s) avec succès depuis{" "}
              <span className="font-mono underline">{importStatus.fileName}</span>.
              {importStatus.skipped > 0 && (
                <span className="text-slate-400 ml-1.5">
                  ({importStatus.skipped} doublon(s) ou ligne(s) invalide(s) ignorée(s))
                </span>
              )}
            </span>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-slate-400 hover:text-white p-1"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Watchlist Table / Cards */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider">
              Adresses surveillées ({watchlist.length})
            </h3>
            {watchlist.length > 0 && (
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                • Stockage local sécurisé
              </span>
            )}
          </div>

          {watchlist.length > 0 && onRefreshAll && (
            <button
              id="watchlist-refresh-all-btn"
              onClick={() => onRefreshAll()}
              disabled={isRefreshingAll}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                isRefreshingAll
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40 cursor-not-allowed opacity-80"
                  : "bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border-emerald-500/30 shadow-sm"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshingAll ? "animate-spin" : ""}`} />
              <span>
                {isRefreshingAll
                  ? refreshProgress
                    ? `Actualisation (${refreshProgress.current}/${refreshProgress.total})...`
                    : "Actualisation en cours..."
                  : "Tout rafraîchir"}
              </span>
            </button>
          )}
        </div>

        {/* Global refresh progress banner */}
        {isRefreshingAll && refreshProgress && (
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-emerald-300 font-mono">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Analyse en cours : <strong className="text-white">{refreshProgress.currentEmail}</strong></span>
              </span>
              <span>{Math.round((refreshProgress.current / refreshProgress.total) * 100)}% ({refreshProgress.current}/{refreshProgress.total})</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${(refreshProgress.current / refreshProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {watchlist.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-sm space-y-2">
            <p>Votre liste de veille est vide pour le moment.</p>
            <p className="text-xs text-slate-600">
              Ajoutez une adresse manuellement ou importez un fichier .txt (1 email par ligne).
            </p>
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

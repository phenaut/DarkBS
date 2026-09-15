import React from "react";
import { ShieldAlert, KeyRound, Bell, Building2 } from "lucide-react";

interface HeaderProps {
  activeTab: "scanner" | "domain" | "password" | "watchlist";
  setActiveTab: (tab: "scanner" | "domain" | "password" | "watchlist") => void;
  watchlistCount: number;
  lastScannedEmail?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  watchlistCount,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-600/10 border border-rose-500/30 text-rose-400 shadow-inner">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white font-sans">
                  DarkWeb<span className="text-rose-500">Scan</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  LIVE THREAT INTEL
                </span>
                <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  Auteur : <span className="text-white font-semibold">Pierre HENAUT</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Détection de fuites d'identifiants & analyse d'exposition pirate • Par Pierre HENAUT
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            <button
              id="tab-scanner-btn"
              onClick={() => setActiveTab("scanner")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "scanner"
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Scanner d'Email</span>
            </button>

            <button
              id="tab-domain-btn"
              onClick={() => setActiveTab("domain")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "domain"
                  ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">Audit Domaine</span>
              <span className="md:hidden">Domaine</span>
            </button>

            <button
              id="tab-password-btn"
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "password"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
              }`}
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Mots de passe</span>
            </button>

            <button
              id="tab-watchlist-btn"
              onClick={() => setActiveTab("watchlist")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "watchlist"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
              }`}
            >
              <Bell className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Veille</span>
              {watchlistCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-500/30">
                  {watchlistCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

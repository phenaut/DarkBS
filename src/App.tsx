/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { EmailScanner } from "./components/EmailScanner";
import { ScanResultView } from "./components/ScanResultView";
import { PasswordLeakChecker } from "./components/PasswordLeakChecker";
import { ThreatRadarFeed } from "./components/ThreatRadarFeed";
import { SecurityAdvisorChat } from "./components/SecurityAdvisorChat";
import { WatchlistSection } from "./components/WatchlistSection";
import { ScanResult, WatchlistEntry } from "./types";
import { ShieldAlert, ShieldCheck, AlertCircle } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "scanner" | "password" | "radar" | "advisor" | "watchlist"
  >("scanner");
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [advisorInitialQuestion, setAdvisorInitialQuestion] = useState("");
  const [scanError, setScanError] = useState("");

  // Watchlist stored in localStorage
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>(() => {
    try {
      const saved = localStorage.getItem("cyberdark_watchlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cyberdark_watchlist", JSON.stringify(watchlist));
    } catch (e) {
      console.error("Failed to save watchlist to localStorage:", e);
    }
  }, [watchlist]);

  // Handle email scan
  const handleScanEmail = async (emailToScan: string) => {
    const cleanEmail = emailToScan.trim().toLowerCase();
    setCurrentEmail(cleanEmail);
    setIsLoading(true);
    setScanError("");
    setActiveTab("scanner");

    try {
      const res = await fetch("/api/scan-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (!res.ok) {
        throw new Error("Impossible de joindre le serveur d'analyse.");
      }

      const data: ScanResult = await res.json();
      setScanResult(data);

      // Update watchlist item if present
      setWatchlist((prev) =>
        prev.map((item) =>
          item.email === cleanEmail
            ? {
                ...item,
                lastScanned: new Date().toLocaleDateString("fr-FR"),
                breachesCount: data.breachesCount,
                riskScore: data.riskScore,
              }
            : item
        )
      );
    } catch (err: any) {
      console.error("Scan error:", err);
      setScanError(
        err.message || "Une erreur est survenue lors de la communication avec le réseau Dark Web."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Watchlist actions
  const handleAddToWatchlist = (email: string) => {
    const clean = email.trim().toLowerCase();
    if (watchlist.some((w) => w.email === clean)) return;

    const newEntry: WatchlistEntry = {
      email: clean,
      label: "Compte surveillé",
      lastScanned: scanResult?.email === clean ? new Date().toLocaleDateString("fr-FR") : undefined,
      breachesCount: scanResult?.email === clean ? scanResult.breachesCount : undefined,
      riskScore: scanResult?.email === clean ? scanResult.riskScore : undefined,
    };
    setWatchlist((prev) => [newEntry, ...prev]);
  };

  const handleRemoveFromWatchlist = (email: string) => {
    setWatchlist((prev) => prev.filter((w) => w.email !== email));
  };

  const isInWatchlist = !!(scanResult && watchlist.some((w) => w.email === scanResult.email));

  const handleAskAI = (question: string) => {
    setAdvisorInitialQuestion(question);
    setActiveTab("advisor");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        watchlistCount={watchlist.length}
        lastScannedEmail={scanResult?.email}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {activeTab === "scanner" && (
          <div className="space-y-10">
            {/* Scanner Input & Animation */}
            <EmailScanner
              onScan={handleScanEmail}
              isLoading={isLoading}
              currentEmail={currentEmail}
            />

            {/* Error Message */}
            {scanError && (
              <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}

            {/* Result View */}
            {scanResult && !isLoading && (
              <ScanResultView
                result={scanResult}
                onAddToWatchlist={handleAddToWatchlist}
                isInWatchlist={isInWatchlist}
                onSwitchToPasswordTab={() => setActiveTab("password")}
                onAskAI={handleAskAI}
              />
            )}
          </div>
        )}

        {activeTab === "password" && <PasswordLeakChecker />}

        {activeTab === "radar" && <ThreatRadarFeed />}

        {activeTab === "advisor" && (
          <SecurityAdvisorChat
            currentScanResult={scanResult}
            initialQuestion={advisorInitialQuestion}
          />
        )}

        {activeTab === "watchlist" && (
          <WatchlistSection
            watchlist={watchlist}
            onAdd={(email, label) => {
              const clean = email.trim().toLowerCase();
              if (!watchlist.some((w) => w.email === clean)) {
                setWatchlist((prev) => [{ email: clean, label }, ...prev]);
              }
            }}
            onRemove={handleRemoveFromWatchlist}
            onScanEmail={handleScanEmail}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-sans">DarkWebScan</span>
            <span>•</span>
            <span>Analyse de sécurité & protection contre les violations de données</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-slate-400">
            <span>Zéro journalisation des mots de passe</span>
            <span>•</span>
            <span>Cryptographie k-Anonymat SHA-1</span>
            <span>•</span>
            <span>IA Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

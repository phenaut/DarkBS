import React, { useState } from "react";
import { KeyRound, ShieldAlert, ShieldCheck, Eye, EyeOff, Lock, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, HelpCircle } from "lucide-react";

export const PasswordLeakChecker: React.FC = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    checked: boolean;
    pwned: boolean;
    count: number;
    sha1Prefix?: string;
  } | null>(null);
  const [error, setError] = useState("");

  // SHA-1 helper in browser using Web Crypto API
  const computeSha1 = async (str: string): Promise<string> => {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-1", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  };

  const handleCheck = async (pwdToCheck?: string) => {
    const target = pwdToCheck !== undefined ? pwdToCheck : password;
    if (!target) {
      setError("Veuillez saisir un mot de passe à tester.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      // 1. Calculate SHA-1 client-side
      const fullHash = await computeSha1(target);
      const prefix = fullHash.substring(0, 5);
      const suffix = fullHash.substring(5);

      // 2. Query endpoint with 5-char prefix (k-anonymity)
      const res = await fetch("/api/check-password-pwned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix, suffix }),
      });

      if (!res.ok) {
        throw new Error("Erreur de communication avec la base de données");
      }

      const data = await res.json();
      setCheckResult({
        checked: true,
        pwned: data.pwned,
        count: data.count || 0,
        sha1Prefix: prefix,
      });
    } catch (err: any) {
      setError(err.message || "Impossible de vérifier le mot de passe.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength assessment
  const evaluateStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "Vide", color: "text-slate-500", crackTime: "0s" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: "Très Faible", color: "text-rose-400", bg: "bg-rose-500", crackTime: "Instantané" };
    if (score <= 3) return { score, label: "Faible", color: "text-orange-400", bg: "bg-orange-500", crackTime: "Quelques minutes" };
    if (score <= 4) return { score, label: "Moyen", color: "text-amber-400", bg: "bg-amber-500", crackTime: "Quelques jours" };
    if (score <= 5) return { score, label: "Fort", color: "text-emerald-400", bg: "bg-emerald-500", crackTime: "Plusieurs siècles" };
    return { score, label: "Exceptionnel", color: "text-emerald-300", bg: "bg-emerald-400", crackTime: "Milliards d'années" };
  };

  const strength = evaluateStrength(password);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Intro Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Vérificateur de Dictionnaires Pirates (k-Anonymat NIST)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">
          Ce mot de passe circule-t-il sur le <span className="text-amber-400">Dark Web</span> ?
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Vérifiez si un mot de passe a été aspiré lors d'une fuite et figure dans les dictionnaires d'attaques par force brute.
        </p>
      </div>

      {/* Security Privacy Explainer Card */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
        <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <h4 className="font-semibold text-white">Confidentialité Mathématique Garantie (k-Anonymat)</h4>
          <p className="text-slate-400 leading-relaxed">
            Votre mot de passe <span className="text-white font-medium">ne transite JAMAIS sur Internet</span>. Votre navigateur calcule son empreinte SHA-1 en local et n'envoie que les <span className="text-emerald-300 font-mono">5 premiers caractères</span>. Le serveur nous renvoie une liste anonymisée et la comparaison finale s'effectue dans votre navigateur.
          </p>
        </div>
      </div>

      {/* Main Password Input Card */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
            Mot de passe à tester
          </label>
          <div className="relative">
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setCheckResult(null);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCheck();
                }
              }}
              placeholder="Saisissez un mot de passe pour tester s'il a fuité..."
              className="w-full px-4 py-3.5 pr-24 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Strength gauge (if password entered) */}
        {password && (
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Robustesse intrinsèque :</span>
              <span className={`font-bold font-mono ${strength.color}`}>
                {strength.label} (Temps estimé pour casser : {strength.crackTime})
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`h-full flex-1 rounded-full transition-all ${
                    step <= strength.score ? strength.bg : "bg-slate-800"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="password-check-submit-btn"
            type="button"
            onClick={() => handleCheck()}
            disabled={isLoading || !password}
            className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Interrogation des bases compromises...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Vérifier la présence dans les fuites</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="text-rose-400 text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick test presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span className="text-slate-500 font-mono">Tester des exemples connus :</span>
          <button
            type="button"
            onClick={() => {
              setPassword("password123");
              handleCheck("password123");
            }}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
          >
            password123
          </button>
          <button
            type="button"
            onClick={() => {
              setPassword("azerty123");
              handleCheck("azerty123");
            }}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
          >
            azerty123
          </button>
          <button
            type="button"
            onClick={() => {
              setPassword("K9#mQ$8x!vL2@zW7p");
              handleCheck("K9#mQ$8x!vL2@zW7p");
            }}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono cursor-pointer"
          >
            Mot de passe robuste aléatoire
          </button>
        </div>
      </div>

      {/* Result Card */}
      {checkResult && checkResult.checked && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-xl space-y-4 animate-fade-in ${
            checkResult.pwned
              ? "bg-rose-950/40 border-rose-500/50 shadow-2xl shadow-rose-950/50"
              : "bg-emerald-950/40 border-emerald-500/50 shadow-2xl shadow-emerald-950/50"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-2xl shrink-0 border ${
                checkResult.pwned
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              }`}
            >
              {checkResult.pwned ? (
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              ) : (
                <ShieldCheck className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    checkResult.pwned
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {checkResult.pwned ? "COMPROMIS DANS DES FUITES" : "NON RÉPERTORIÉ"}
                </span>
                {checkResult.sha1Prefix && (
                  <span className="text-[11px] font-mono text-slate-400">
                    Préfixe SHA-1 anonymisé : {checkResult.sha1Prefix}
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {checkResult.pwned
                  ? `Ce mot de passe a été exposé ${checkResult.count.toLocaleString()} fois !`
                  : "Ce mot de passe n'apparaît dans aucune fuite connue."}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {checkResult.pwned ? (
                  <>
                    <strong className="text-rose-400">Ne l'utilisez jamais !</strong> Les cybercriminels disposent de ce mot de passe dans leurs dictionnaires d'attaques automatisées (dictionnaires rockyou, comb, etc.). Si vous l'utilisez actuellement sur des comptes, changez-le immédiatement.
                  </>
                ) : (
                  <>
                    Ce mot de passe n'a pas été trouvé dans les milliards de mots de passe divulgués répertoriés. Veillez toutefois à ce qu'il soit unique et composé d'au moins 14 caractères variés.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

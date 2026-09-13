export interface BreachDetail {
  breach: string;
  details: string;
  domain?: string;
  industry?: string;
  logo?: string;
  password_risk?: string;
  references?: string;
  searchable?: string;
  verified?: string;
  xposed_data?: string;
  xposed_date?: string;
  xposed_records?: number;
  added?: string;
}

export interface PasteDetail {
  id?: string;
  title?: string;
  date?: string;
  source?: string;
}

export interface PasswordStats {
  EasyToCrack: number;
  PlainText: number;
  StrongHash: number;
  Unknown: number;
}

export interface RemediationStep {
  priority: "URGENT" | "IMPORTANT" | "RECOMMANDÉ";
  action: string;
  detail: string;
}

export interface AIAssessment {
  severity: "CRITIQUE" | "ÉLEVÉ" | "MODÉRÉ" | "FAIBLE" | "AUCUN";
  headline: string;
  threatAnalysis: string;
  criticalFindings: string[];
  phishingThreats: string[];
  remediationPlan: RemediationStep[];
}

export interface ScanResult {
  email: string;
  found: boolean;
  breachesCount: number;
  pastesCount: number;
  riskScore: number;
  passwordStats: PasswordStats;
  breaches: BreachDetail[];
  pastes: PasteDetail[];
  aiAssessment: AIAssessment;
  scannedAt: string;
}

export interface NotableLeak {
  id: string;
  name: string;
  date: string;
  records: string;
  origin: string;
  severity: "CRITIQUE" | "ÉLEVÉ" | "MODÉRÉ";
  exposed: string[];
  description: string;
  recommendations: string;
}

export interface ThreatIntelData {
  leaks: NotableLeak[];
  lastUpdate: string;
  activeMalwareCampaigns: {
    name: string;
    type: string;
    target: string;
    prevention: string;
  }[];
}

export interface WatchlistEntry {
  email: string;
  label: string;
  lastScanned?: string;
  breachesCount?: number;
  riskScore?: number;
}

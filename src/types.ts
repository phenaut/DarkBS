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

export interface DnsSecurityCheck {
  recordType: "MX" | "SPF" | "DMARC" | "DNSSEC";
  status: "SECURE" | "WARNING" | "CRITICAL" | "INFO";
  value: string;
  summary: string;
  recommendation?: string;
}

export interface DomainKnownBreach {
  breachID: string;
  title: string;
  date: string;
  recordsCount?: number;
  severity: "Critique" | "Élevé" | "Moyen" | "Faible";
  exposedData: string[];
  description: string;
  verified: boolean;
  source: string;
}

export interface DomainAuditResult {
  domain: string;
  companyName: string;
  sector: string;
  overallRiskScore: number;
  securityRating: "A" | "B" | "C" | "D" | "F";
  dnsPosture: {
    mxServers: string[];
    spfRecord: string | null;
    spfValid: boolean;
    dmarcRecord: string | null;
    dmarcPolicy: "reject" | "quarantine" | "none" | "missing";
    hasDkimOrSecurityTxt: boolean;
    checks: DnsSecurityCheck[];
  };
  knownIncidents: DomainKnownBreach[];
  historicalExposuresCount: number;
  recommendations: string[];
  auditedAt: string;
}

import guardrailsConfig from './PRICING_GUARDRAILS.json';

export interface MarginRules {
  minimumGrossMargin: number;
  warningThreshold: number;
  description: string;
}

export interface TravelRules {
  flyOutDistanceThreshold: number;
  minimumFlyOutCost: number;
  requireTravelCostForRemote: boolean;
  perDiemRate: number;
  hotelNightRate: number;
  description: string;
}

export interface LodPremiums {
  description: string;
  "200": number;
  "300": number;
  "350": number;
  tolerancePercent: number;
}

export interface ScanDurationRules {
  description: string;
  productivity: Record<string, number>;
  buildingTypeComplexity: Record<string, string>;
  minimumHoursPerProject: number;
  tolerancePercent: number;
}

export interface HistoricalRules {
  description: string;
  pricePerSqftVarianceWarning: number;
  pricePerSqftVarianceBlock: number;
  lookbackQuotes: number;
}

export interface SqftAuditRules {
  description: string;
  tolerancePercent: number;
  flagIfNoHistory: boolean;
}

export interface SeverityLevel {
  code: string;
  blocking: boolean;
  description: string;
}

export interface PricingGuardrails {
  version: string;
  description: string;
  marginRules: MarginRules;
  travelRules: TravelRules;
  lodPremiums: LodPremiums;
  scanDurationRules: ScanDurationRules;
  historicalRules: HistoricalRules;
  sqftAuditRules: SqftAuditRules;
  overrideRoles: { description: string; approvers: string[] };
  severityLevels: Record<string, SeverityLevel>;
}

export const GUARDRAILS: PricingGuardrails = guardrailsConfig as PricingGuardrails;

export type IntegrityStatus = 'pass' | 'warning' | 'blocked';

export interface IntegrityFlag {
  code: string;
  severity: 'info' | 'warning' | 'error';
  category: 'logic' | 'policy' | 'historical' | 'travel' | 'sqft';
  title: string;
  message: string;
  details?: Record<string, any>;
}

export interface AuditReport {
  status: IntegrityStatus;
  flags: IntegrityFlag[];
  auditedAt: string;
  requiresOverride: boolean;
  overrideApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export function createEmptyAuditReport(): AuditReport {
  return {
    status: 'pass',
    flags: [],
    auditedAt: new Date().toISOString(),
    requiresOverride: false,
    overrideApproved: false,
  };
}

export function determineStatus(flags: IntegrityFlag[]): IntegrityStatus {
  const hasError = flags.some(f => f.severity === 'error');
  const hasWarning = flags.some(f => f.severity === 'warning');
  
  if (hasError) return 'blocked';
  if (hasWarning) return 'warning';
  return 'pass';
}

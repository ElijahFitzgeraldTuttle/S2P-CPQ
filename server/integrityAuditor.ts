import { GUARDRAILS, IntegrityFlag, AuditReport, determineStatus, createEmptyAuditReport } from '../shared/config/guardrails';
import type { Quote } from '@shared/schema';

interface Area {
  id: string;
  name: string;
  buildingType: string;
  squareFeet: string;
  scope: string;
  disciplines: string[];
  disciplineLods: Record<string, string>;
  includeCad?: boolean;
}

interface PricingBreakdown {
  basePrice?: number;
  upteamCost?: number;
  totalPrice?: number;
  [key: string]: any;
}

interface HistoricalQuote {
  id: string;
  clientName: string | null;
  projectAddress: string;
  totalPrice: string | null;
  areas: any;
  createdAt: Date;
}

interface ProjectActual {
  normalizedAddress: string;
  actualSqft: number;
  lastScanDate: Date;
}

export class IntegrityAuditor {
  private flags: IntegrityFlag[] = [];
  
  constructor() {
    this.flags = [];
  }
  
  /**
   * Run all integrity checks on a quote
   */
  async auditQuote(
    quote: Partial<Quote>,
    historicalQuotes?: HistoricalQuote[],
    projectActual?: ProjectActual | null
  ): Promise<AuditReport> {
    this.flags = [];
    
    const areas = (quote.areas || []) as Area[];
    const pricingBreakdown = (quote.pricingBreakdown || {}) as PricingBreakdown;
    const totalPrice = parseFloat(quote.totalPrice?.toString() || '0');
    const upteamCost = pricingBreakdown.upteamCost || 0;
    
    // Run all checks
    this.checkMarginFloor(totalPrice, upteamCost);
    this.checkTravelRules(quote);
    this.checkLodPremiums(areas);
    this.checkScanDuration(areas);
    this.checkHistoricalPricing(quote, areas, historicalQuotes);
    this.checkSqftAgainstActuals(areas, projectActual);
    
    const status = determineStatus(this.flags);
    const requiresOverride = status === 'blocked';
    
    return {
      status,
      flags: this.flags,
      auditedAt: new Date().toISOString(),
      requiresOverride,
      overrideApproved: false,
    };
  }
  
  /**
   * Check 1: Margin Floor
   * Ensure gross margin meets minimum threshold
   */
  private checkMarginFloor(totalPrice: number, upteamCost: number): void {
    if (totalPrice <= 0) return;
    
    const grossMargin = (totalPrice - upteamCost) / totalPrice;
    const { minimumGrossMargin, warningThreshold } = GUARDRAILS.marginRules;
    
    if (grossMargin < minimumGrossMargin) {
      this.flags.push({
        code: 'MARGIN_BELOW_MINIMUM',
        severity: 'error',
        category: 'policy',
        title: 'Gross Margin Below Policy Minimum',
        message: `This quote has a ${(grossMargin * 100).toFixed(1)}% gross margin. Our policy minimum is ${(minimumGrossMargin * 100).toFixed(0)}%. CEO override required.`,
        details: {
          actualMargin: grossMargin,
          minimumRequired: minimumGrossMargin,
          totalPrice,
          upteamCost,
        },
      });
    } else if (grossMargin < warningThreshold) {
      this.flags.push({
        code: 'MARGIN_BELOW_TARGET',
        severity: 'warning',
        category: 'policy',
        title: 'Gross Margin Below Target',
        message: `This quote has a ${(grossMargin * 100).toFixed(1)}% gross margin, which is below our ${(warningThreshold * 100).toFixed(0)}% target.`,
        details: {
          actualMargin: grossMargin,
          targetMargin: warningThreshold,
        },
      });
    }
  }
  
  /**
   * Check 2: Travel Rules
   * Validate travel costs for fly-out scenarios
   */
  private checkTravelRules(quote: Partial<Quote>): void {
    const { flyOutDistanceThreshold, minimumFlyOutCost, requireTravelCostForRemote } = GUARDRAILS.travelRules;
    const distance = quote.distance || 0;
    const dispatch = quote.dispatchLocation || 'troy';
    const customTravelCost = parseFloat(quote.customTravelCost?.toString() || '0');
    
    const isFlyOut = distance > flyOutDistanceThreshold || dispatch === 'remote';
    
    if (isFlyOut && customTravelCost === 0 && requireTravelCostForRemote) {
      this.flags.push({
        code: 'FLYOUT_NO_TRAVEL_COST',
        severity: 'error',
        category: 'travel',
        title: 'Fly-out Scenario Missing Travel Cost',
        message: `This is a fly-out project (${distance} miles, ${dispatch} dispatch) but travel cost is $0. Please add travel expenses.`,
        details: {
          distance,
          dispatch,
          customTravelCost,
          minimumExpected: minimumFlyOutCost,
        },
      });
    } else if (isFlyOut && customTravelCost < minimumFlyOutCost) {
      this.flags.push({
        code: 'FLYOUT_LOW_TRAVEL_COST',
        severity: 'warning',
        category: 'travel',
        title: 'Travel Cost May Be Underestimated',
        message: `Fly-out travel cost of $${customTravelCost.toLocaleString()} seems low for a ${distance}-mile project. Expected minimum: $${minimumFlyOutCost}.`,
        details: {
          distance,
          customTravelCost,
          minimumExpected: minimumFlyOutCost,
        },
      });
    }
  }
  
  /**
   * Check 3: LoD Premiums
   * Verify LoD 350 work is priced higher than LoD 300
   */
  private checkLodPremiums(areas: Area[]): void {
    for (const area of areas) {
      const lods = Object.values(area.disciplineLods || {});
      const hasLod350 = lods.some(lod => lod === '350');
      
      if (hasLod350) {
        // This is informational - the pricing engine should handle premiums
        this.flags.push({
          code: 'LOD_350_DETECTED',
          severity: 'info',
          category: 'policy',
          title: 'High Detail LoD 350 Work',
          message: `Area "${area.name || 'Unnamed'}" includes LoD 350 disciplines. Verify the premium is applied.`,
          details: {
            areaId: area.id,
            areaName: area.name,
            disciplines: area.disciplineLods,
          },
        });
      }
    }
  }
  
  /**
   * Check 4: Scan Duration Logic
   * Verify sqft vs estimated scan time makes sense
   */
  private checkScanDuration(areas: Area[]): void {
    const { productivity, buildingTypeComplexity, tolerancePercent } = GUARDRAILS.scanDurationRules;
    
    let totalSqft = 0;
    let weightedComplexity = 0;
    
    for (const area of areas) {
      const sqft = parseInt(area.squareFeet) || 0;
      totalSqft += sqft;
      
      const complexity = buildingTypeComplexity[area.buildingType] || 'standard';
      const prodRate = productivity[complexity] || productivity.standard;
      weightedComplexity += sqft / prodRate;
    }
    
    if (totalSqft > 0) {
      const expectedHours = weightedComplexity;
      const minHours = GUARDRAILS.scanDurationRules.minimumHoursPerProject;
      
      // Flag if project seems too small for the sqft
      if (expectedHours < minHours && totalSqft > 5000) {
        this.flags.push({
          code: 'SCAN_DURATION_MISMATCH',
          severity: 'warning',
          category: 'logic',
          title: 'Scan Duration Check',
          message: `${totalSqft.toLocaleString()} sqft typically requires ${expectedHours.toFixed(1)} hours of scanning. Verify scope is complete.`,
          details: {
            totalSqft,
            expectedHours,
            minimumHours: minHours,
          },
        });
      }
    }
  }
  
  /**
   * Check 5: Historical Pricing Comparison
   * Compare against previous quotes for same client
   */
  private checkHistoricalPricing(
    quote: Partial<Quote>,
    areas: Area[],
    historicalQuotes?: HistoricalQuote[]
  ): void {
    if (!historicalQuotes || historicalQuotes.length === 0) return;
    
    const { pricePerSqftVarianceWarning, pricePerSqftVarianceBlock } = GUARDRAILS.historicalRules;
    
    const totalSqft = areas.reduce((sum, a) => sum + (parseInt(a.squareFeet) || 0), 0);
    const currentPrice = parseFloat(quote.totalPrice?.toString() || '0');
    
    if (totalSqft === 0 || currentPrice === 0) return;
    
    const currentPricePerSqft = currentPrice / totalSqft;
    
    // Calculate average historical price per sqft
    const historicalPrices: number[] = [];
    for (const hq of historicalQuotes.slice(0, GUARDRAILS.historicalRules.lookbackQuotes)) {
      const hSqft = (hq.areas as Area[]).reduce((sum, a) => sum + (parseInt(a.squareFeet) || 0), 0);
      const hPrice = parseFloat(hq.totalPrice?.toString() || '0');
      if (hSqft > 0 && hPrice > 0) {
        historicalPrices.push(hPrice / hSqft);
      }
    }
    
    if (historicalPrices.length === 0) return;
    
    const avgHistoricalPricePerSqft = historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length;
    const variance = (avgHistoricalPricePerSqft - currentPricePerSqft) / avgHistoricalPricePerSqft;
    
    if (variance > pricePerSqftVarianceBlock) {
      this.flags.push({
        code: 'PRICE_SIGNIFICANTLY_LOWER',
        severity: 'error',
        category: 'historical',
        title: 'Price Significantly Below Historical Average',
        message: `This price per sqft ($${currentPricePerSqft.toFixed(2)}) is ${(variance * 100).toFixed(0)}% lower than the last ${historicalPrices.length} projects for this client ($${avgHistoricalPricePerSqft.toFixed(2)}/sqft avg).`,
        details: {
          currentPricePerSqft,
          avgHistoricalPricePerSqft,
          variancePercent: variance,
          historicalQuoteCount: historicalPrices.length,
        },
      });
    } else if (variance > pricePerSqftVarianceWarning) {
      this.flags.push({
        code: 'PRICE_BELOW_HISTORICAL',
        severity: 'warning',
        category: 'historical',
        title: 'Price Below Historical Average',
        message: `This price per sqft is ${(variance * 100).toFixed(0)}% lower than our last ${historicalPrices.length} projects for this client.`,
        details: {
          currentPricePerSqft,
          avgHistoricalPricePerSqft,
          variancePercent: variance,
        },
      });
    }
  }
  
  /**
   * Check 6: Square Foot Audit
   * Verify sqft matches previous actual scans of same address
   */
  private checkSqftAgainstActuals(areas: Area[], projectActual?: ProjectActual | null): void {
    if (!projectActual) {
      if (GUARDRAILS.sqftAuditRules.flagIfNoHistory) {
        this.flags.push({
          code: 'NO_SQFT_HISTORY',
          severity: 'info',
          category: 'sqft',
          title: 'No Previous Scan History',
          message: 'This address has not been scanned before. Square footage cannot be verified.',
        });
      }
      return;
    }
    
    const totalQuotedSqft = areas.reduce((sum, a) => sum + (parseInt(a.squareFeet) || 0), 0);
    const actualSqft = projectActual.actualSqft;
    const tolerance = GUARDRAILS.sqftAuditRules.tolerancePercent / 100;
    
    const variance = Math.abs(totalQuotedSqft - actualSqft) / actualSqft;
    
    if (variance > tolerance) {
      this.flags.push({
        code: 'SQFT_MISMATCH',
        severity: 'warning',
        category: 'sqft',
        title: 'Square Footage Mismatch',
        message: `Quoted sqft (${totalQuotedSqft.toLocaleString()}) differs from actual scanned sqft (${actualSqft.toLocaleString()}) by ${(variance * 100).toFixed(1)}%. Please verify.`,
        details: {
          quotedSqft: totalQuotedSqft,
          actualSqft,
          variancePercent: variance,
          lastScanDate: projectActual.lastScanDate,
        },
      });
    }
  }
}

export const auditor = new IntegrityAuditor();

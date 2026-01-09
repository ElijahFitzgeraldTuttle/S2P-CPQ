/**
 * CPQ Pricing Engine - Pure Functions for Testing
 * 
 * This module contains all the core pricing calculation logic extracted
 * as pure functions that can be unit tested independently.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

export const SQFT_PER_ACRE = 43560;

export const TRAVEL_RATES = {
  standard: 3,        // $/mile for Troy, Woodstock
  brooklyn: 4,        // $/mile over 20 miles for Brooklyn
  brooklynThreshold: 20,  // miles before extra charges
  scanDayFeeThreshold: 75,  // miles to trigger scan day fee
  scanDayFee: 300,    // daily fee for long distance
};

export const BROOKLYN_BASE_FEES = {
  tierC: 150,   // < 10k sqft
  tierB: 300,   // 10k - 50k sqft
  tierA: 0,     // 50k+ sqft
};

export const RISK_PREMIUMS = {
  occupied: 0.15,     // 15%
  hazardous: 0.25,    // 25%
  no_power: 0.20,     // 20%
};

export const SCOPE_DISCOUNTS = {
  full: 0,
  interior: 0.35,     // 35% discount (exterior portion)
  exterior: 0.65,     // 65% discount (interior portion)
  mixed: 0,           // Uses separate LoDs
};

export const PAYMENT_TERM_PREMIUMS = {
  partner: 0,
  owner: 0,
  net30: 0.05,   // +5%
  net60: 0.10,   // +10%
  net90: 0.15,   // +15%
};

export const TIER_A_THRESHOLD = 50000; // sqft

export const LANDSCAPE_RATES = {
  // Built Landscape (type 14): [<5ac, 5-20ac, 20-50ac, 50-100ac, 100+ac]
  "14": {
    "200": [875, 625, 375, 250, 160],
    "300": [1000, 750, 500, 375, 220],
    "350": [1250, 1000, 750, 500, 260],
  },
  // Natural Landscape (type 15)
  "15": {
    "200": [625, 375, 250, 200, 140],
    "300": [750, 500, 375, 275, 200],
    "350": [1000, 750, 500, 325, 240],
  },
};

// ============================================================================
// AREA TIER FUNCTIONS
// ============================================================================

/**
 * Determine pricing tier based on square footage
 */
export function getAreaTier(sqft: number): string {
  if (sqft < 3000) return "0-3k";
  if (sqft < 5000) return "3k-5k";
  if (sqft < 10000) return "5k-10k";
  if (sqft < 25000) return "10k-25k";
  if (sqft < 50000) return "25k-50k";
  if (sqft < 75000) return "50k-75k";
  if (sqft < 100000) return "75k-100k";
  return "100k+";
}

/**
 * Determine Brooklyn travel tier based on total project sqft
 */
export function getBrooklynTravelTier(totalSqft: number): 'tierA' | 'tierB' | 'tierC' {
  if (totalSqft >= 50000) return 'tierA';
  if (totalSqft >= 10000) return 'tierB';
  return 'tierC';
}

/**
 * Get Brooklyn base fee based on project size tier
 */
export function getBrooklynBaseFee(totalSqft: number): number {
  const tier = getBrooklynTravelTier(totalSqft);
  return BROOKLYN_BASE_FEES[tier];
}

// ============================================================================
// LANDSCAPE FUNCTIONS
// ============================================================================

/**
 * Check if building type is landscape
 */
export function isLandscapeType(buildingTypeId: string): boolean {
  return buildingTypeId === "14" || buildingTypeId === "15";
}

/**
 * Get landscape acreage tier index (0-4)
 */
export function getLandscapeAcreageTierIndex(acres: number): number {
  if (acres >= 100) return 4;
  if (acres >= 50) return 3;
  if (acres >= 20) return 2;
  if (acres >= 5) return 1;
  return 0;  // < 5 acres
}

/**
 * Get per-acre rate for landscape projects
 */
export function getLandscapePerAcreRate(buildingTypeId: string, acres: number, lod: string): number {
  const rates = LANDSCAPE_RATES[buildingTypeId as keyof typeof LANDSCAPE_RATES];
  if (!rates) return 0;
  
  const lodRates = rates[lod as keyof typeof rates] || rates["200"];
  const tierIndex = getLandscapeAcreageTierIndex(acres);
  
  return lodRates[tierIndex];
}

/**
 * Calculate landscape area price
 */
export function calculateLandscapePrice(buildingTypeId: string, acres: number, lod: string): number {
  const perAcreRate = getLandscapePerAcreRate(buildingTypeId, acres, lod);
  return acres * perAcreRate;
}

/**
 * Convert acres to square feet
 */
export function acresToSqft(acres: number): number {
  return Math.round(acres * SQFT_PER_ACRE);
}

// ============================================================================
// TRAVEL FUNCTIONS
// ============================================================================

export interface TravelResult {
  baseCost: number;
  extraMilesCost: number;
  scanDayFee: number;
  totalCost: number;
  label: string;
  tier?: string;
}

/**
 * Calculate travel cost for standard dispatch (Troy, Woodstock)
 */
export function calculateStandardTravel(distance: number): TravelResult {
  const baseCost = distance * TRAVEL_RATES.standard;
  const scanDayFee = distance >= TRAVEL_RATES.scanDayFeeThreshold ? TRAVEL_RATES.scanDayFee : 0;
  const totalCost = baseCost + scanDayFee;
  
  let label = `Travel - ${distance} mi @ $${TRAVEL_RATES.standard}/mi`;
  if (scanDayFee > 0) {
    label += ` + $${TRAVEL_RATES.scanDayFee} scan day fee`;
  }
  
  return {
    baseCost,
    extraMilesCost: 0,
    scanDayFee,
    totalCost,
    label,
  };
}

/**
 * Calculate travel cost for Brooklyn dispatch
 */
export function calculateBrooklynTravel(distance: number, totalProjectSqft: number): TravelResult {
  const tier = getBrooklynTravelTier(totalProjectSqft);
  const tierLabel = tier === 'tierA' ? 'Tier A' : (tier === 'tierB' ? 'Tier B' : 'Tier C');
  const baseCost = getBrooklynBaseFee(totalProjectSqft);
  
  let extraMilesCost = 0;
  if (distance > TRAVEL_RATES.brooklynThreshold) {
    const extraMiles = distance - TRAVEL_RATES.brooklynThreshold;
    extraMilesCost = extraMiles * TRAVEL_RATES.brooklyn;
  }
  
  const totalCost = baseCost + extraMilesCost;
  
  let label = `Travel - Brooklyn ${tierLabel} ($${baseCost} base`;
  if (extraMilesCost > 0) {
    const extraMiles = distance - TRAVEL_RATES.brooklynThreshold;
    label += ` + ${extraMiles} mi @ $${TRAVEL_RATES.brooklyn}/mi`;
  }
  label += ')';
  
  return {
    baseCost,
    extraMilesCost,
    scanDayFee: 0,
    totalCost,
    label,
    tier: tierLabel,
  };
}

/**
 * Calculate travel cost based on dispatch location
 */
export function calculateTravel(
  dispatchLocation: string,
  distance: number,
  totalProjectSqft: number
): TravelResult {
  if (dispatchLocation === 'brooklyn') {
    return calculateBrooklynTravel(distance, totalProjectSqft);
  }
  return calculateStandardTravel(distance);
}

// ============================================================================
// RISK PREMIUM FUNCTIONS
// ============================================================================

/**
 * Calculate total risk premium multiplier from selected risks
 * Note: Risk premiums apply ONLY to Architecture discipline
 */
export function calculateRiskMultiplier(risks: string[]): number {
  let totalPremium = 0;
  
  for (const risk of risks) {
    if (risk in RISK_PREMIUMS) {
      totalPremium += RISK_PREMIUMS[risk as keyof typeof RISK_PREMIUMS];
    }
  }
  
  return 1 + totalPremium;
}

/**
 * Apply risk premium to Architecture subtotal only
 */
export function applyRiskPremium(
  disciplineId: string,
  baseAmount: number,
  risks: string[]
): number {
  // Risk premiums only apply to Architecture
  if (disciplineId !== 'arch') {
    return baseAmount;
  }
  
  const multiplier = calculateRiskMultiplier(risks);
  return baseAmount * multiplier;
}

// ============================================================================
// TIER A FUNCTIONS
// ============================================================================

/**
 * Check if project qualifies as Tier A (≥50k sqft)
 */
export function isTierAProject(totalSqft: number): boolean {
  return totalSqft >= TIER_A_THRESHOLD;
}

/**
 * Calculate Tier A client price from costs and margin
 */
export function calculateTierAPrice(
  scanningCost: number,
  modelingCost: number,
  marginMultiplier: number
): number {
  return (scanningCost + modelingCost) * marginMultiplier;
}

/**
 * Parse Tier A scanning cost from string value
 */
export function parseTierAScanningCost(
  scanningCostValue: string,
  scanningCostOther: string
): number {
  if (scanningCostValue === 'other') {
    return parseFloat(scanningCostOther) || 0;
  }
  return parseFloat(scanningCostValue) || 0;
}

// ============================================================================
// SCOPE DISCOUNT FUNCTIONS
// ============================================================================

/**
 * Get scope discount percentage
 */
export function getScopeDiscount(scope: string): number {
  return SCOPE_DISCOUNTS[scope as keyof typeof SCOPE_DISCOUNTS] || 0;
}

/**
 * Apply scope discount to base price
 */
export function applyScopeDiscount(basePrice: number, scope: string): number {
  const discount = getScopeDiscount(scope);
  return basePrice * (1 - discount);
}

// ============================================================================
// PAYMENT TERM FUNCTIONS
// ============================================================================

/**
 * Get payment term premium percentage
 */
export function getPaymentTermPremium(paymentTerms: string): number {
  return PAYMENT_TERM_PREMIUMS[paymentTerms as keyof typeof PAYMENT_TERM_PREMIUMS] || 0;
}

/**
 * Apply payment term premium to subtotal
 */
export function applyPaymentTermPremium(subtotal: number, paymentTerms: string): number {
  const premium = getPaymentTermPremium(paymentTerms);
  return subtotal * (1 + premium);
}

// ============================================================================
// AGGREGATE FUNCTIONS
// ============================================================================

export interface AreaInput {
  buildingType: string;
  squareFeet: string;
}

/**
 * Calculate total project square footage, converting landscape acres to sqft
 */
export function calculateTotalSqft(areas: AreaInput[]): number {
  return areas.reduce((sum, area) => {
    const isLandscape = isLandscapeType(area.buildingType);
    const inputValue = parseFloat(area.squareFeet) || 0;
    
    if (isLandscape) {
      return sum + acresToSqft(inputValue);
    }
    return sum + inputValue;
  }, 0);
}

// ============================================================================
// INTERIOR CAD ELEVATIONS
// ============================================================================

/**
 * Calculate tiered pricing for additional interior CAD elevations
 * $25/ea for 1-10, $20/ea for 10-20, $15/ea for 20-100, $10/ea for 100-300, $5/ea for 300+
 */
export function calculateAdditionalElevationsPrice(count: number): number {
  if (count <= 0) return 0;
  
  let total = 0;
  let remaining = count;
  
  // Tier 1: 1-10 @ $25
  const tier1 = Math.min(remaining, 10);
  total += tier1 * 25;
  remaining -= tier1;
  
  if (remaining > 0) {
    // Tier 2: 11-20 @ $20
    const tier2 = Math.min(remaining, 10);
    total += tier2 * 20;
    remaining -= tier2;
  }
  
  if (remaining > 0) {
    // Tier 3: 21-100 @ $15
    const tier3 = Math.min(remaining, 80);
    total += tier3 * 15;
    remaining -= tier3;
  }
  
  if (remaining > 0) {
    // Tier 4: 101-300 @ $10
    const tier4 = Math.min(remaining, 200);
    total += tier4 * 10;
    remaining -= tier4;
  }
  
  if (remaining > 0) {
    // Tier 5: 300+ @ $5
    total += remaining * 5;
  }
  
  return total;
}

// ============================================================================
// EXPORT ALL FOR TESTING
// ============================================================================

export const PricingEngine = {
  // Constants
  SQFT_PER_ACRE,
  TRAVEL_RATES,
  BROOKLYN_BASE_FEES,
  RISK_PREMIUMS,
  SCOPE_DISCOUNTS,
  PAYMENT_TERM_PREMIUMS,
  TIER_A_THRESHOLD,
  LANDSCAPE_RATES,
  
  // Functions
  getAreaTier,
  getBrooklynTravelTier,
  getBrooklynBaseFee,
  isLandscapeType,
  getLandscapeAcreageTierIndex,
  getLandscapePerAcreRate,
  calculateLandscapePrice,
  acresToSqft,
  calculateStandardTravel,
  calculateBrooklynTravel,
  calculateTravel,
  calculateRiskMultiplier,
  applyRiskPremium,
  isTierAProject,
  calculateTierAPrice,
  parseTierAScanningCost,
  getScopeDiscount,
  applyScopeDiscount,
  getPaymentTermPremium,
  applyPaymentTermPremium,
  calculateTotalSqft,
  calculateAdditionalElevationsPrice,
};

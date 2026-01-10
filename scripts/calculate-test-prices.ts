/**
 * Calculate Expected Prices for 10 Test Scenarios
 * 
 * Uses the pricing engine functions to compute expected prices
 * for validation against the CPQ Calculator output.
 */

import { PricingEngine } from "../server/lib/pricingEngine";

const {
  getAreaTier,
  calculateAreaPricing,
  calculateLandscapeAreaPricing,
  calculateACTAreaPricing,
  calculateStandardTravel,
  calculateBrooklynTravel,
  calculateRiskMultiplier,
  applyPaymentTermPremium,
  SQFT_PER_ACRE,
  MIN_SQFT_FLOOR,
  UPTEAM_MULTIPLIER_FALLBACK,
  TRAVEL_RATES,
  BROOKLYN_BASE_FEES,
} = PricingEngine;

interface PricingResult {
  scenario: number;
  name: string;
  targetPrice: string;
  modelingTotal: number;
  travelTotal: number;
  servicesTotal: number;
  calculatedTotal: number;
  breakdown: string[];
}

const results: PricingResult[] = [];

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

console.log("=".repeat(80));
console.log("PRICING ENGINE VALIDATION - 10 TEST SCENARIOS");
console.log("=".repeat(80));
console.log("");

// ============================================================================
// SCENARIO 1: Starter Interior
// ============================================================================
console.log("SCENARIO 1: Starter Interior");
console.log("-".repeat(40));
{
  const sqft = 2000;
  const effectiveSqft = Math.max(sqft, MIN_SQFT_FLOOR); // 3000
  const buildingType = "1"; // Residential
  const discipline = "arch";
  const lod = "200";
  const scopePortion = 0.65; // Interior
  const tier = getAreaTier(effectiveSqft);
  
  // Using fallback rates for demonstration
  const baseRate = 2.50; // Architecture default
  const lodMultiplier = 1.0; // LoD 200
  const rate = baseRate * lodMultiplier;
  
  const clientPrice = effectiveSqft * rate * scopePortion;
  const upteamCost = clientPrice * UPTEAM_MULTIPLIER_FALLBACK;
  
  // Travel: Troy, 25 miles
  const travel = calculateStandardTravel(25);
  
  const total = clientPrice + travel.totalCost;
  
  console.log(`  Input sqft: ${sqft} → Effective: ${effectiveSqft} (min floor)`);
  console.log(`  Tier: ${tier}, Rate: $${rate}/sqft, Scope: 65% (interior)`);
  console.log(`  Arch modeling: ${formatCurrency(clientPrice)}`);
  console.log(`  Travel (25mi): ${formatCurrency(travel.totalCost)}`);
  console.log(`  TOTAL: ${formatCurrency(total)}`);
  console.log(`  Target: ~$3K`);
  console.log("");
  
  results.push({
    scenario: 1,
    name: "Starter Interior",
    targetPrice: "~$3K",
    modelingTotal: clientPrice,
    travelTotal: travel.totalCost,
    servicesTotal: 0,
    calculatedTotal: total,
    breakdown: [`Arch: ${formatCurrency(clientPrice)}`, `Travel: ${formatCurrency(travel.totalCost)}`]
  });
}

// ============================================================================
// SCENARIO 2: Multi-Discipline Mid
// ============================================================================
console.log("SCENARIO 2: Multi-Discipline Mid");
console.log("-".repeat(40));
{
  const sqft = 18500;
  const buildingType = "4"; // Office
  const lod = "300";
  const scopePortion = 1.0; // Full
  const tier = getAreaTier(sqft);
  const risks = ["occupied"];
  
  // Default rates with LoD 300 multiplier (1.3×)
  const archRate = 2.50 * 1.3; // 3.25
  const mepfRate = 3.00 * 1.3; // 3.90
  const structRate = 2.00 * 1.3; // 2.60
  
  // Risk multiplier (occupied = +15%) - ONLY on Arch
  const riskMult = calculateRiskMultiplier(risks); // 1.15
  
  const archPrice = sqft * archRate * riskMult;
  const mepfPrice = sqft * mepfRate;
  const structPrice = sqft * structRate;
  const modelingTotal = archPrice + mepfPrice + structPrice;
  
  // Travel: Troy, 40 miles (no scan day fee)
  const travel = calculateStandardTravel(40);
  
  const total = modelingTotal + travel.totalCost;
  
  console.log(`  Sqft: ${sqft}, Tier: ${tier}`);
  console.log(`  Risk multiplier (occupied): ${riskMult}× on Arch only`);
  console.log(`  Arch: ${formatCurrency(archPrice)} (with risk)`);
  console.log(`  MEPF: ${formatCurrency(mepfPrice)}`);
  console.log(`  Structure: ${formatCurrency(structPrice)}`);
  console.log(`  Modeling subtotal: ${formatCurrency(modelingTotal)}`);
  console.log(`  Travel (40mi): ${formatCurrency(travel.totalCost)}`);
  console.log(`  TOTAL: ${formatCurrency(total)}`);
  console.log(`  Target: ~$35-45K`);
  console.log("");
  
  results.push({
    scenario: 2,
    name: "Multi-Discipline Mid",
    targetPrice: "~$35-45K",
    modelingTotal,
    travelTotal: travel.totalCost,
    servicesTotal: 0,
    calculatedTotal: total,
    breakdown: [`Arch+Risk: ${formatCurrency(archPrice)}`, `MEPF: ${formatCurrency(mepfPrice)}`, `Struct: ${formatCurrency(structPrice)}`]
  });
}

// ============================================================================
// SCENARIO 3: Exterior Retrofit
// ============================================================================
console.log("SCENARIO 3: Exterior Retrofit");
console.log("-".repeat(40));
{
  const sqft = 12000;
  const buildingType = "5"; // Retail
  const lod = "350";
  const scopePortion = 0.35; // Exterior
  const tier = getAreaTier(sqft);
  
  // LoD 350 = 1.5× multiplier
  const archRate = 2.50 * 1.5; // 3.75
  const archPrice = sqft * archRate * scopePortion;
  
  // Travel: Woodstock, 120 miles (includes scan day fee)
  const travel = calculateStandardTravel(120);
  
  const total = archPrice + travel.totalCost;
  
  console.log(`  Sqft: ${sqft}, Tier: ${tier}, Scope: 35% (exterior)`);
  console.log(`  LoD 350 = 1.5× multiplier`);
  console.log(`  Arch: ${formatCurrency(archPrice)}`);
  console.log(`  Travel (120mi + scan day): ${formatCurrency(travel.totalCost)}`);
  console.log(`    Base: ${formatCurrency(travel.baseCost)}, Scan day fee: ${formatCurrency(travel.scanDayFee)}`);
  console.log(`  TOTAL: ${formatCurrency(total)}`);
  console.log(`  Target: ~$25-35K`);
  console.log("");
  
  results.push({
    scenario: 3,
    name: "Exterior Retrofit",
    targetPrice: "~$25-35K",
    modelingTotal: archPrice,
    travelTotal: travel.totalCost,
    servicesTotal: 0,
    calculatedTotal: total,
    breakdown: [`Arch (exterior): ${formatCurrency(archPrice)}`, `Travel+ScanDay: ${formatCurrency(travel.totalCost)}`]
  });
}

// ============================================================================
// SCENARIO 4: Roof/Facade Package
// ============================================================================
console.log("SCENARIO 4: Roof/Facade Package");
console.log("-".repeat(40));
{
  const sqft = 6500;
  const buildingType = "9"; // Mixed Use
  const lod = "300";
  const scopePortion = 0.35; // Exterior
  const tier = getAreaTier(sqft);
  
  const archRate = 2.50 * 1.3; // LoD 300
  const archPrice = sqft * archRate * scopePortion;
  
  // Brooklyn travel, 15 miles, tier B (6500 < 10k = tier C)
  const travel = calculateBrooklynTravel(15, sqft);
  
  // CAD package - assume $2,500 typical
  const cadPrice = 2500;
  
  const total = archPrice + travel.totalCost + cadPrice;
  
  console.log(`  Sqft: ${sqft}, Tier: ${tier}, Scope: 35% (exterior)`);
  console.log(`  Arch: ${formatCurrency(archPrice)}`);
  console.log(`  Brooklyn travel (Tier C, 15mi): ${formatCurrency(travel.totalCost)}`);
  console.log(`  CAD Package: ${formatCurrency(cadPrice)}`);
  console.log(`  TOTAL: ${formatCurrency(total)}`);
  console.log(`  Target: ~$15K`);
  console.log("");
  
  results.push({
    scenario: 4,
    name: "Roof/Facade Package",
    targetPrice: "~$15K",
    modelingTotal: archPrice,
    travelTotal: travel.totalCost,
    servicesTotal: cadPrice,
    calculatedTotal: total,
    breakdown: [`Arch: ${formatCurrency(archPrice)}`, `Brooklyn: ${formatCurrency(travel.totalCost)}`, `CAD: ${formatCurrency(cadPrice)}`]
  });
}

// ============================================================================
// SCENARIO 5: Landscape Campus
// ============================================================================
console.log("SCENARIO 5: Landscape Campus");
console.log("-".repeat(40));
{
  const acres = 3.2;
  const buildingType = "14"; // Built Landscape
  const lod = "300";
  
  // Landscape pricing from PRICING_ENGINE_SPEC
  // Built Landscape, <5 ac, LoD 300 = $1,000/acre
  const perAcreRate = 1000;
  const landscapePrice = acres * perAcreRate;
  const upteamCost = landscapePrice * UPTEAM_MULTIPLIER_FALLBACK;
  
  // Travel: Troy, 30 miles
  const travel = calculateStandardTravel(30);
  
  const total = landscapePrice + travel.totalCost;
  
  console.log(`  Acres: ${acres} (${Math.round(acres * SQFT_PER_ACRE)} sqft equivalent)`);
  console.log(`  Built Landscape, <5 ac, LoD 300 = $1,000/acre`);
  console.log(`  Landscape modeling: ${formatCurrency(landscapePrice)}`);
  console.log(`  Travel (30mi): ${formatCurrency(travel.totalCost)}`);
  console.log(`  TOTAL: ${formatCurrency(total)}`);
  console.log(`  Target: ~$20K`);
  console.log("");
  
  results.push({
    scenario: 5,
    name: "Landscape Campus",
    targetPrice: "~$20K",
    modelingTotal: landscapePrice,
    travelTotal: travel.totalCost,
    servicesTotal: 0,
    calculatedTotal: total,
    breakdown: [`Landscape: ${formatCurrency(landscapePrice)}`]
  });
}

// ============================================================================
// SCENARIO 6: Large Campus Mix
// ============================================================================
console.log("SCENARIO 6: Large Campus Mix");
console.log("-".repeat(40));
{
  // Healthcare building: 45K sqft
  const healthcareSqft = 45000;
  const tier = getAreaTier(healthcareSqft);
  
  // LoD 300 = 1.3× multiplier
  const archRate = 2.50 * 1.3;
  const mepfRate = 3.00 * 1.3;
  const structRate = 2.00 * 1.3;
  
  const healthcareArch = healthcareSqft * archRate;
  const healthcareMepf = healthcareSqft * mepfRate;
  const healthcareStruct = healthcareSqft * structRate;
  const healthcareTotal = healthcareArch + healthcareMepf + healthcareStruct;
  
  // Natural Landscape: 1.5 acres
  const acres = 1.5;
  // Natural Landscape, <5 ac, LoD 300 = $750/acre
  const landscapePrice = acres * 750;
  
  const modelingTotal = healthcareTotal + landscapePrice;
  
  // Custom travel
  const customTravel = 4500;
  
  const total = modelingTotal + customTravel;
  
  console.log(`  Healthcare (45K sqft): ${formatCurrency(healthcareTotal)}`);
  console.log(`    Arch: ${formatCurrency(healthcareArch)}, MEPF: ${formatCurrency(healthcareMepf)}, Struct: ${formatCurrency(healthcareStruct)}`);
  console.log(`  Natural Landscape (1.5 ac): ${formatCurrency(landscapePrice)}`);
  console.log(`  Custom travel (fly-out): ${formatCurrency(customTravel)}`);
  console.log(`  TOTAL: ${formatCurrency(total)}`);
  console.log(`  Target: ~$90-110K`);
  console.log("");
  
  results.push({
    scenario: 6,
    name: "Large Campus Mix",
    targetPrice: "~$90-110K",
    modelingTotal,
    travelTotal: customTravel,
    servicesTotal: 0,
    calculatedTotal: total,
    breakdown: [`Healthcare: ${formatCurrency(healthcareTotal)}`, `Landscape: ${formatCurrency(landscapePrice)}`, `Travel: ${formatCurrency(customTravel)}`]
  });
}

// ============================================================================
// SCENARIO 7: Risk-Stacked Industrial
// ============================================================================
console.log("SCENARIO 7: Risk-Stacked Industrial");
console.log("-".repeat(40));
{
  const sqft = 55000;
  const buildingType = "11"; // Warehouse
  const lod = "350";
  const tier = getAreaTier(sqft);
  const risks = ["hazardous", "no_power"]; // +25% + 20% = +45% on Arch only
  
  // LoD 350 = 1.5× multiplier
  const archRate = 2.50 * 1.5;
  const mepfRate = 3.00 * 1.5;
  const structRate = 2.00 * 1.5;
  
  // Risk multiplier for Arch
  const riskMult = calculateRiskMultiplier(risks); // 1.45
  
  const archPrice = sqft * archRate * riskMult;
  const mepfPrice = sqft * mepfRate;
  const structPrice = sqft * structRate;
  const modelingTotal = archPrice + mepfPrice + structPrice;
  
  // Travel: Boise, 400 miles (includes scan day fee)
  const travel = calculateStandardTravel(400);
  
  const total = modelingTotal + travel.totalCost;
  
  console.log(`  Sqft: ${sqft} (Tier A), Tier: ${tier}`);
  console.log(`  Risk multiplier (hazardous+no_power): ${riskMult}× on Arch only`);
  console.log(`  Arch: ${formatCurrency(archPrice)} (with risk)`);
  console.log(`  MEPF: ${formatCurrency(mepfPrice)}`);
  console.log(`  Structure: ${formatCurrency(structPrice)}`);
  console.log(`  Modeling subtotal: ${formatCurrency(modelingTotal)}`);
  console.log(`  Travel (400mi + scan day): ${formatCurrency(travel.totalCost)}`);
  console.log(`  TOTAL: ${formatCurrency(total)}`);
  console.log(`  Target: ~$120-150K`);
  console.log(`  NOTE: This is a Tier A project (>50k sqft) - may use manual pricing`);
  console.log("");
  
  results.push({
    scenario: 7,
    name: "Risk-Stacked Industrial",
    targetPrice: "~$120-150K",
    modelingTotal,
    travelTotal: travel.totalCost,
    servicesTotal: 0,
    calculatedTotal: total,
    breakdown: [`Arch+Risk: ${formatCurrency(archPrice)}`, `MEPF: ${formatCurrency(mepfPrice)}`, `Struct: ${formatCurrency(structPrice)}`]
  });
}

// ============================================================================
// SCENARIO 8: Tier A Baseline
// ============================================================================
console.log("SCENARIO 8: Tier A Baseline");
console.log("-".repeat(40));
{
  const sqft = 80000;
  const scanningCost = 35000;
  const modelingCost = 55000;
  const marginMultiplier = 1.55;
  
  // Tier A manual pricing
  const tierAPrice = (scanningCost + modelingCost) * marginMultiplier;
  
  // Custom travel
  const customTravel = 8500;
  
  const total = tierAPrice + customTravel;
  
  console.log(`  Sqft: ${sqft} (Tier A manual pricing)`);
  console.log(`  Scanning: ${formatCurrency(scanningCost)}`);
  console.log(`  Modeling: ${formatCurrency(modelingCost)}`);
  console.log(`  Margin multiplier: ${marginMultiplier}×`);
  console.log(`  Tier A price: (${formatCurrency(scanningCost)} + ${formatCurrency(modelingCost)}) × ${marginMultiplier} = ${formatCurrency(tierAPrice)}`);
  console.log(`  Custom travel: ${formatCurrency(customTravel)}`);
  console.log(`  TOTAL: ${formatCurrency(total)}`);
  console.log(`  Target: ~$140K`);
  console.log("");
  
  results.push({
    scenario: 8,
    name: "Tier A Baseline",
    targetPrice: "~$140K",
    modelingTotal: tierAPrice,
    travelTotal: customTravel,
    servicesTotal: 0,
    calculatedTotal: total,
    breakdown: [`Tier A: ${formatCurrency(tierAPrice)}`, `Travel: ${formatCurrency(customTravel)}`]
  });
}

// ============================================================================
// SCENARIO 9: Tier A High
// ============================================================================
console.log("SCENARIO 9: Tier A High");
console.log("-".repeat(40));
{
  const sqft = 150000;
  const scanningCost = 70000;
  const modelingCost = 95000;
  const marginMultiplier = 1.42;
  
  // Tier A manual pricing
  const tierAPrice = (scanningCost + modelingCost) * marginMultiplier;
  
  // Custom travel
  const customTravel = 12000;
  
  const total = tierAPrice + customTravel;
  
  console.log(`  Sqft: ${sqft} (Tier A manual pricing)`);
  console.log(`  Scanning: ${formatCurrency(scanningCost)}`);
  console.log(`  Modeling: ${formatCurrency(modelingCost)}`);
  console.log(`  Margin multiplier: ${marginMultiplier}×`);
  console.log(`  Tier A price: (${formatCurrency(scanningCost)} + ${formatCurrency(modelingCost)}) × ${marginMultiplier} = ${formatCurrency(tierAPrice)}`);
  console.log(`  Custom travel: ${formatCurrency(customTravel)}`);
  console.log(`  TOTAL: ${formatCurrency(total)}`);
  console.log(`  Target: ~$235K`);
  console.log("");
  
  results.push({
    scenario: 9,
    name: "Tier A High",
    targetPrice: "~$235K",
    modelingTotal: tierAPrice,
    travelTotal: customTravel,
    servicesTotal: 0,
    calculatedTotal: total,
    breakdown: [`Tier A: ${formatCurrency(tierAPrice)}`, `Travel: ${formatCurrency(customTravel)}`]
  });
}

// ============================================================================
// SCENARIO 10: Mixed-Scope Specialty
// ============================================================================
console.log("SCENARIO 10: Mixed-Scope Specialty");
console.log("-".repeat(40));
{
  const sqft = 28000;
  const buildingType = "8"; // Hospitality
  
  // Mixed scope: 65% interior at LoD 350, 35% exterior at LoD 300
  const interiorPortion = 0.65;
  const exteriorPortion = 0.35;
  
  // Interior LoD 350
  const archRateInterior = 2.50 * 1.5;
  const mepfRateInterior = 3.00 * 1.5;
  
  // Exterior LoD 300
  const archRateExterior = 2.50 * 1.3;
  const mepfRateExterior = 3.00 * 1.3;
  
  const interiorArch = sqft * archRateInterior * interiorPortion;
  const interiorMepf = sqft * mepfRateInterior * interiorPortion;
  const exteriorArch = sqft * archRateExterior * exteriorPortion;
  const exteriorMepf = sqft * mepfRateExterior * exteriorPortion;
  
  const hotelTotal = interiorArch + interiorMepf + exteriorArch + exteriorMepf;
  
  // ACT area: 15,000 sqft at interior (65%)
  const actSqft = 15000;
  const actPrice = actSqft * 2.00 * 0.65; // ACT rate $2.00, interior scope
  
  const modelingTotal = hotelTotal + actPrice;
  
  // Brooklyn travel, 35 miles, tier B (28k sqft)
  const travel = calculateBrooklynTravel(35, sqft);
  
  const total = modelingTotal + travel.totalCost;
  
  console.log(`  Hotel (28K sqft, mixed scope):`);
  console.log(`    Interior (65%, LoD 350): Arch ${formatCurrency(interiorArch)}, MEPF ${formatCurrency(interiorMepf)}`);
  console.log(`    Exterior (35%, LoD 300): Arch ${formatCurrency(exteriorArch)}, MEPF ${formatCurrency(exteriorMepf)}`);
  console.log(`    Hotel subtotal: ${formatCurrency(hotelTotal)}`);
  console.log(`  ACT (15K sqft, interior): ${formatCurrency(actPrice)}`);
  console.log(`  Modeling total: ${formatCurrency(modelingTotal)}`);
  console.log(`  Brooklyn travel (Tier B, 35mi): ${formatCurrency(travel.totalCost)}`);
  console.log(`  TOTAL: ${formatCurrency(total)}`);
  console.log(`  Target: ~$55-65K`);
  console.log("");
  
  results.push({
    scenario: 10,
    name: "Mixed-Scope Specialty",
    targetPrice: "~$55-65K",
    modelingTotal,
    travelTotal: travel.totalCost,
    servicesTotal: 0,
    calculatedTotal: total,
    breakdown: [`Hotel mixed: ${formatCurrency(hotelTotal)}`, `ACT: ${formatCurrency(actPrice)}`, `Brooklyn: ${formatCurrency(travel.totalCost)}`]
  });
}

// ============================================================================
// SUMMARY TABLE
// ============================================================================
console.log("=".repeat(80));
console.log("SUMMARY: EXPECTED VS TARGET PRICES");
console.log("=".repeat(80));
console.log("");
console.log("| # | Scenario                | Target      | Calculated  | Status |");
console.log("|---|-------------------------|-------------|-------------|--------|");

for (const r of results) {
  const status = "CHECK";
  console.log(`| ${r.scenario.toString().padStart(1)} | ${r.name.padEnd(23)} | ${r.targetPrice.padEnd(11)} | ${formatCurrency(r.calculatedTotal).padEnd(11)} | ${status.padEnd(6)} |`);
}

console.log("");
console.log("NOTE: These calculations use default fallback rates. Actual prices from the");
console.log("CPQ Calculator may vary based on database pricing matrix rates.");
console.log("");
console.log("=".repeat(80));

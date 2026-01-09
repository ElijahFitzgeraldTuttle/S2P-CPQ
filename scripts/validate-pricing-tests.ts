#!/usr/bin/env npx tsx
/**
 * Pricing Test Validator
 * 
 * Validates pricing engine calculations against golden expected results.
 * Run with: npx tsx scripts/validate-pricing-tests.ts
 * 
 * Options:
 *   --json          Output results as JSON
 *   --output FILE   Write results to file
 */

import {
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
  calculateRiskMultiplier,
  applyRiskPremium,
  isTierAProject,
  calculateTierAPrice,
  getScopeDiscount,
  applyScopeDiscount,
  getPaymentTermPremium,
  applyPaymentTermPremium,
  calculateAdditionalElevationsPrice,
  calculateAreaPricing,
  calculateLandscapeAreaPricing,
  calculateACTAreaPricing,
  calculateMatterportPricing,
  calculateProfitMargin,
  LOD_MULTIPLIERS,
  DEFAULT_BASE_RATES,
} from '../server/lib/pricingEngine';

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestResult {
  category: string;
  test: string;
  input: any;
  expected: any;
  actual: any;
  passed: boolean;
  delta?: number;
}

interface ValidationReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  results: TestResult[];
}

function runTest(category: string, test: string, input: any, expected: any): TestResult {
  let actual: any;
  
  try {
    switch (category) {
      case 'areaTier':
        actual = getAreaTier(input);
        break;
      case 'brooklynTier':
        actual = getBrooklynTravelTier(input);
        break;
      case 'brooklynBaseFee':
        actual = getBrooklynBaseFee(input);
        break;
      case 'landscape':
        actual = isLandscapeType(input);
        break;
      case 'acresToSqft':
        actual = acresToSqft(input);
        break;
      case 'landscapeTier':
        actual = getLandscapeAcreageTierIndex(input);
        break;
      case 'landscapeRate':
        actual = getLandscapePerAcreRate(input.type, input.acres, input.lod);
        break;
      case 'landscapePrice':
        actual = calculateLandscapePrice(input.type, input.acres, input.lod);
        break;
      case 'standardTravel':
        const travelResult = calculateStandardTravel(input);
        actual = {
          baseCost: travelResult.baseCost,
          scanDayFee: travelResult.scanDayFee,
          totalCost: travelResult.totalCost,
        };
        break;
      case 'brooklynTravel':
        const bkResult = calculateBrooklynTravel(input.distance, input.sqft);
        actual = {
          baseCost: bkResult.baseCost,
          extraMilesCost: bkResult.extraMilesCost,
          totalCost: bkResult.totalCost,
        };
        break;
      case 'riskMultiplier':
        actual = calculateRiskMultiplier(input);
        break;
      case 'riskPremium':
        actual = applyRiskPremium(input.discipline, input.base, input.risks);
        break;
      case 'tierA':
        actual = isTierAProject(input);
        break;
      case 'tierAPrice':
        actual = calculateTierAPrice(input.scanning, input.modeling, input.margin);
        break;
      case 'scopeDiscount':
        actual = getScopeDiscount(input);
        break;
      case 'applyScopeDiscount':
        actual = applyScopeDiscount(input.price, input.scope);
        break;
      case 'paymentTerm':
        actual = getPaymentTermPremium(input);
        break;
      case 'applyPaymentTerm':
        actual = applyPaymentTermPremium(input.subtotal, input.terms);
        break;
      case 'elevations':
        actual = calculateAdditionalElevationsPrice(input);
        break;
      case 'modelingCost':
        const areaResult = calculateAreaPricing({
          buildingTypeId: '1',
          sqft: input.sqft,
          discipline: input.discipline,
          lod: input.lod,
          clientRatePerSqft: input.clientRate,
          upteamRatePerSqft: input.upteamRate,
          scopePortion: input.scope,
        });
        actual = {
          clientPrice: areaResult.clientPrice,
          upteamCost: areaResult.upteamCost,
          effectiveSqft: areaResult.effectiveSqft,
        };
        break;
      case 'actPricing':
        const actResult = calculateACTAreaPricing(input);
        actual = {
          clientPrice: actResult.clientPrice,
          upteamCost: actResult.upteamCost,
          effectiveSqft: actResult.effectiveSqft,
        };
        break;
      case 'matterportPricing':
        const mpResult = calculateMatterportPricing(input);
        actual = {
          clientPrice: mpResult.clientPrice,
          upteamCost: mpResult.upteamCost,
          effectiveSqft: mpResult.effectiveSqft,
        };
        break;
      case 'landscapeAreaPricing':
        const landscapeResult = calculateLandscapeAreaPricing(input.type, input.acres, input.lod);
        actual = {
          clientPrice: landscapeResult.clientPrice,
          upteamCost: landscapeResult.upteamCost,
        };
        break;
      case 'profitMargin':
        const marginResult = calculateProfitMargin(input.clientPrice, input.upteamCost);
        actual = {
          margin: marginResult.margin,
          grossMarginPercent: marginResult.grossMarginPercent,
        };
        break;
      case 'lodMultiplier':
        actual = LOD_MULTIPLIERS[input as keyof typeof LOD_MULTIPLIERS];
        break;
      case 'defaultBaseRate':
        actual = DEFAULT_BASE_RATES[input as keyof typeof DEFAULT_BASE_RATES];
        break;
      default:
        actual = null;
    }
  } catch (e: any) {
    actual = `ERROR: ${e.message}`;
  }
  
  // Compare results
  let passed: boolean;
  let delta: number | undefined;
  
  if (typeof expected === 'object' && expected !== null) {
    // For object comparisons, check each expected key
    passed = Object.keys(expected).every(key => {
      if (typeof expected[key] === 'number' && typeof actual?.[key] === 'number') {
        return Math.abs(expected[key] - actual[key]) < 0.01;
      }
      return expected[key] === actual?.[key];
    });
  } else if (typeof expected === 'number' && typeof actual === 'number') {
    delta = Math.abs(expected - actual);
    passed = delta < 0.01;
  } else {
    passed = expected === actual;
  }
  
  return { category, test, input, expected, actual, passed, delta };
}

function loadGoldenResults(): any {
  const goldenPath = path.join(__dirname, '../server/lib/pricingEngine.golden.json');
  const content = fs.readFileSync(goldenPath, 'utf-8');
  return JSON.parse(content);
}

function runValidation(): ValidationReport {
  const golden = loadGoldenResults();
  const results: TestResult[] = [];
  
  for (const testCase of golden.testResults) {
    const result = runTest(
      testCase.category,
      testCase.test,
      testCase.input,
      testCase.expected
    );
    results.push(result);
  }
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed,
    failed,
    results,
  };
}

function printReport(report: ValidationReport, jsonOutput: boolean) {
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 CPQ PRICING VALIDATION REPORT');
  console.log('═'.repeat(60));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Total Tests: ${report.totalTests}`);
  console.log(`Passed: ${report.passed}`);
  console.log(`Failed: ${report.failed}`);
  console.log('─'.repeat(60));
  
  // Group by category
  const categories = [...new Set(report.results.map(r => r.category))];
  
  for (const category of categories) {
    const categoryResults = report.results.filter(r => r.category === category);
    const categoryPassed = categoryResults.every(r => r.passed);
    const icon = categoryPassed ? '✓' : '✗';
    
    console.log(`\n${icon} ${category.toUpperCase()}`);
    
    for (const result of categoryResults) {
      const status = result.passed ? '  ✓' : '  ✗';
      console.log(`${status} ${result.test}`);
      
      if (!result.passed) {
        console.log(`      Expected: ${JSON.stringify(result.expected)}`);
        console.log(`      Actual:   ${JSON.stringify(result.actual)}`);
        if (result.delta !== undefined) {
          console.log(`      Delta:    ${result.delta}`);
        }
      }
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  if (report.failed === 0) {
    console.log('✅ ALL VALIDATIONS PASSED');
  } else {
    console.log(`❌ ${report.failed} VALIDATION(S) FAILED`);
  }
  console.log('═'.repeat(60) + '\n');
}

// Main execution
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const outputIndex = args.indexOf('--output');
const outputFile = outputIndex >= 0 ? args[outputIndex + 1] : null;

const report = runValidation();
printReport(report, jsonOutput);

if (outputFile) {
  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
  console.log(`Results written to: ${outputFile}`);
}

process.exit(report.failed > 0 ? 1 : 0);

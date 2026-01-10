/**
 * Create 10 Test Quotes for Pricing Engine Validation
 * 
 * These test scenarios cover the full range of pricing logic:
 * - Minimum floor pricing (2,000 sqft → 3,000 billable)
 * - Multi-discipline with risk premiums
 * - Travel calculations (standard + Brooklyn)
 * - Landscape per-acre pricing
 * - Tier A manual pricing
 * - Mixed scope with split LoDs
 * - ACT and special services
 */

import { db } from "../server/db";
import { quotes } from "../shared/schema";
import { eq } from "drizzle-orm";

interface TestScenario {
  id: number;
  name: string;
  size: string;
  type: string;
  buildingTypeId: string;
  keyFeatures: string;
  targetPrice: string;
  areas: any[];
  risks: string[];
  dispatchLocation: string;
  distance: number;
  customTravelCost?: number;
  services?: any;
}

const testScenarios: TestScenario[] = [
  {
    id: 1,
    name: "Starter Interior",
    size: "2,000 sqft",
    type: "Residential",
    buildingTypeId: "1",
    keyFeatures: "Arch only, Interior, LOD 200",
    targetPrice: "~$3K (min floor)",
    areas: [{
      id: "area-test-1",
      buildingType: "1",
      squareFootage: 2000,
      scope: "interior",
      lod: "200",
      disciplines: ["arch"],
      name: "Main Building"
    }],
    risks: [],
    dispatchLocation: "troy",
    distance: 25
  },
  {
    id: 2,
    name: "Multi-Discipline Mid",
    size: "18,500 sqft",
    type: "Office",
    buildingTypeId: "4",
    keyFeatures: "Arch+MEP+Struct, Full, LOD 300, Occupied",
    targetPrice: "~$35-45K",
    areas: [{
      id: "area-test-2",
      buildingType: "4",
      squareFootage: 18500,
      scope: "full",
      lod: "300",
      disciplines: ["arch", "mepf", "structure"],
      name: "Office Building"
    }],
    risks: ["occupied"],
    dispatchLocation: "troy",
    distance: 40
  },
  {
    id: 3,
    name: "Exterior Retrofit",
    size: "12,000 sqft",
    type: "Retail",
    buildingTypeId: "5",
    keyFeatures: "Arch, Exterior, LOD 350, 120mi travel",
    targetPrice: "~$25-35K",
    areas: [{
      id: "area-test-3",
      buildingType: "5",
      squareFootage: 12000,
      scope: "exterior",
      lod: "350",
      disciplines: ["arch"],
      name: "Retail Storefront"
    }],
    risks: [],
    dispatchLocation: "woodstock",
    distance: 120
  },
  {
    id: 4,
    name: "Roof/Facade Package",
    size: "6,500 sqft",
    type: "Mixed Use",
    buildingTypeId: "9",
    keyFeatures: "Arch, Roof scope, LOD 300, CAD",
    targetPrice: "~$15K",
    areas: [{
      id: "area-test-4",
      buildingType: "9",
      squareFootage: 6500,
      scope: "exterior",
      lod: "300",
      disciplines: ["arch"],
      name: "Facade & Roof"
    }],
    risks: [],
    dispatchLocation: "brooklyn",
    distance: 15,
    services: { cadPackage: "cad-package-1" }
  },
  {
    id: 5,
    name: "Landscape Campus",
    size: "3.2 acres",
    type: "Built Landscape",
    buildingTypeId: "14",
    keyFeatures: "LOD 300, landscape pricing",
    targetPrice: "~$20K",
    areas: [{
      id: "area-test-5",
      buildingType: "14",
      squareFootage: 139392, // 3.2 acres × 43560 sqft/acre
      acres: 3.2,
      scope: "full",
      lod: "300",
      disciplines: ["site"],
      name: "Campus Grounds"
    }],
    risks: [],
    dispatchLocation: "troy",
    distance: 30
  },
  {
    id: 6,
    name: "Large Campus Mix",
    size: "45K sqft + 1.5 ac",
    type: "Healthcare + Natural",
    buildingTypeId: "9",
    keyFeatures: "Multi-area, custom travel $4,500",
    targetPrice: "~$90-110K",
    areas: [
      {
        id: "area-test-6a",
        buildingType: "9",
        squareFootage: 45000,
        scope: "full",
        lod: "300",
        disciplines: ["arch", "mepf", "structure"],
        name: "Healthcare Building"
      },
      {
        id: "area-test-6b",
        buildingType: "15",
        squareFootage: 65340, // 1.5 acres × 43560
        acres: 1.5,
        scope: "full",
        lod: "300",
        disciplines: ["site"],
        name: "Natural Landscape"
      }
    ],
    risks: [],
    dispatchLocation: "fly-out",
    distance: 0,
    customTravelCost: 4500
  },
  {
    id: 7,
    name: "Risk-Stacked Industrial",
    size: "55,000 sqft",
    type: "Warehouse",
    buildingTypeId: "11",
    keyFeatures: "Hazardous+NoPower+Height, 400mi",
    targetPrice: "~$120-150K",
    areas: [{
      id: "area-test-7",
      buildingType: "11",
      squareFootage: 55000,
      scope: "full",
      lod: "350",
      disciplines: ["arch", "mepf", "structure"],
      name: "Industrial Warehouse"
    }],
    risks: ["hazardous", "no_power"],
    dispatchLocation: "boise",
    distance: 400
  },
  {
    id: 8,
    name: "Tier A Baseline",
    size: "80,000 sqft",
    type: "Office",
    buildingTypeId: "4",
    keyFeatures: "Manual: Scan $35K, Model $55K",
    targetPrice: "~$140K",
    areas: [{
      id: "area-test-8",
      buildingType: "4",
      squareFootage: 80000,
      scope: "full",
      lod: "300",
      disciplines: ["arch", "mepf", "structure"],
      name: "Corporate Tower",
      tierAManualPricing: {
        scanningCost: 35000,
        modelingCost: 55000,
        marginMultiplier: 1.55
      }
    }],
    risks: [],
    dispatchLocation: "fly-out",
    distance: 0,
    customTravelCost: 8500
  },
  {
    id: 9,
    name: "Tier A High",
    size: "150,000 sqft",
    type: "Data Center",
    buildingTypeId: "10",
    keyFeatures: "Manual: Scan $70K, Model $95K",
    targetPrice: "~$235K",
    areas: [{
      id: "area-test-9",
      buildingType: "10",
      squareFootage: 150000,
      scope: "full",
      lod: "350",
      disciplines: ["arch", "mepf", "structure"],
      name: "Data Center Complex",
      tierAManualPricing: {
        scanningCost: 70000,
        modelingCost: 95000,
        marginMultiplier: 1.42
      }
    }],
    risks: [],
    dispatchLocation: "fly-out",
    distance: 0,
    customTravelCost: 12000
  },
  {
    id: 10,
    name: "Mixed-Scope Specialty",
    size: "28,000 sqft",
    type: "Hospitality",
    buildingTypeId: "8",
    keyFeatures: "Split LODs, Site, ACT",
    targetPrice: "~$55-65K",
    areas: [
      {
        id: "area-test-10a",
        buildingType: "8",
        squareFootage: 28000,
        scope: "mixed",
        mixedInteriorLod: "350",
        mixedExteriorLod: "300",
        lod: "300",
        disciplines: ["arch", "mepf"],
        name: "Hotel Main"
      },
      {
        id: "area-test-10b",
        buildingType: "16",
        squareFootage: 15000,
        scope: "interior",
        lod: "300",
        disciplines: [],
        name: "ACT Survey"
      }
    ],
    risks: [],
    dispatchLocation: "brooklyn",
    distance: 35
  }
];

async function createTestQuotes() {
  console.log("=".repeat(70));
  console.log("CREATING 10 TEST QUOTES FOR PRICING VALIDATION");
  console.log("=".repeat(70));
  console.log("");

  for (const scenario of testScenarios) {
    const quoteNumber = `TEST-2026-${String(scenario.id).padStart(3, '0')}`;
    
    try {
      // Check if quote already exists
      const existing = await db.select().from(quotes).where(
        eq(quotes.quoteNumber, quoteNumber)
      );
      
      if (existing.length > 0) {
        console.log(`[${scenario.id}] ${scenario.name} - Already exists (${quoteNumber})`);
        continue;
      }

      // Create the quote
      await db.insert(quotes).values({
        quoteNumber,
        clientName: `Test Client ${scenario.id}`,
        projectName: scenario.name,
        projectAddress: `${scenario.id}00 Test Street, Test City`,
        typeOfBuilding: scenario.type,
        areas: scenario.areas,
        risks: scenario.risks,
        dispatchLocation: scenario.dispatchLocation,
        distance: scenario.distance,
        customTravelCost: scenario.customTravelCost ? String(scenario.customTravelCost) : null,
        services: scenario.services || {},
        scopingMode: false,
        totalPrice: "0",
        pricingBreakdown: {},
        integrityStatus: "pending"
      });

      console.log(`[${scenario.id}] ${scenario.name} - Created (${quoteNumber})`);
      console.log(`    Size: ${scenario.size}, Type: ${scenario.type}`);
      console.log(`    Features: ${scenario.keyFeatures}`);
      console.log(`    Target: ${scenario.targetPrice}`);
      console.log("");
    } catch (error) {
      console.error(`[${scenario.id}] ${scenario.name} - ERROR:`, error);
    }
  }

  console.log("=".repeat(70));
  console.log("TEST QUOTES CREATED - Open each in CPQ Calculator to verify pricing");
  console.log("=".repeat(70));
}

// Run the script
createTestQuotes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to create test quotes:", error);
    process.exit(1);
  });

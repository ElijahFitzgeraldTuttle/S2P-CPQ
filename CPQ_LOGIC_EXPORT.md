# CPQ Logic Export - Technical Documentation

This document exports the core pricing logic from the Scan2Plan CPQ application for verification against external systems.

---

## 1. The Pricing Engine (The Math)

### Main Calculation Function: `calculatePricing()`

Located in: `client/src/pages/Calculator.tsx`

```typescript
const calculatePricing = () => {
  const items: PricingLineItem[] = [];
  let archBaseTotal = 0;
  let otherDisciplinesTotal = 0;
  let upteamCost = 0; // Track internal vendor costs
  
  // Fallback upteam multiplier if database rate not found
  const UPTEAM_MULTIPLIER_FALLBACK = 0.65;

  areas.forEach((area) => {
    const isLandscape = area.buildingType === "14" || area.buildingType === "15";
    const isACT = area.buildingType === "16";
    const inputValue = isLandscape ? parseFloat(area.squareFeet) || 0 : parseInt(area.squareFeet) || 0;
    
    const scope = area.scope || "full";
    const disciplines = isLandscape ? ["site"] : isACT ? ["mepf"] : (area.disciplines.length > 0 ? area.disciplines : []);
    
    // Helper function to calculate pricing for a discipline
    const calculateDisciplinePricing = (discipline: string, lod: string, scopePortion: number, scopeType: string) => {
      let lineTotal = 0;
      let areaLabel = "";
      let upteamLineCost = 0;
      
      if (isLandscape) {
        const acres = inputValue;
        const sqft = Math.round(acres * 43560);
        const perAcreRate = getLandscapePerAcreRate(area.buildingType, acres, lod);
        lineTotal = acres * perAcreRate * scopePortion;
        areaLabel = `${acres} acres (${sqft.toLocaleString()} sqft)`;
        upteamLineCost = lineTotal * UPTEAM_MULTIPLIER_FALLBACK;
      } else if (isACT) {
        const sqft = Math.max(inputValue, 3000);
        lineTotal = sqft * 2.00 * scopePortion;
        areaLabel = `${sqft.toLocaleString()} sqft`;
        upteamLineCost = lineTotal * UPTEAM_MULTIPLIER_FALLBACK;
      } else if (discipline === "matterport") {
        const sqft = Math.max(inputValue, 3000);
        lineTotal = sqft * 0.10;
        areaLabel = `${sqft.toLocaleString()} sqft`;
        upteamLineCost = lineTotal * UPTEAM_MULTIPLIER_FALLBACK;
      } else {
        const sqft = Math.max(inputValue, 3000);  // MINIMUM BILLING: 3,000 sqft
        const ratePerSqft = getPricingRate(area.buildingType, sqft, discipline, lod);
        
        if (ratePerSqft > 0) {
          lineTotal = sqft * ratePerSqft * scopePortion;
        } else {
          // Fallback rates if database not available
          let baseRatePerSqft = 2.50;
          if (discipline === "mepf") baseRatePerSqft = 3.00;
          else if (discipline === "structure") baseRatePerSqft = 2.00;
          else if (discipline === "site") baseRatePerSqft = 1.50;
          
          const lodMultiplier: Record<string, number> = { "200": 1.0, "300": 1.3, "350": 1.5 };
          const multiplier = lodMultiplier[lod] || 1.0;
          lineTotal = sqft * baseRatePerSqft * multiplier * scopePortion;
        }
        
        const upteamRatePerSqft = getUpteamPricingRate(area.buildingType, sqft, discipline, lod);
        if (upteamRatePerSqft > 0) {
          upteamLineCost = sqft * upteamRatePerSqft * scopePortion;
        } else {
          upteamLineCost = lineTotal * UPTEAM_MULTIPLIER_FALLBACK;
        }
        
        areaLabel = `${sqft.toLocaleString()} sqft`;
      }
      
      return { lineTotal, areaLabel, upteamLineCost };
    };
    
    // ... discipline iteration continues
  });
  
  const baseSubtotal = archBaseTotal + otherDisciplinesTotal;
  // ... continues with risk premiums, travel, services
};
```

### Risk Premium Calculation (CRITICAL CHECK)

**Risk premiums apply ONLY to the Architecture discipline's base total, NOT the entire project total.**

```typescript
let archAfterRisk = archBaseTotal;
if (risks.length > 0) {
  risks.forEach((risk) => {
    let riskPercent = 0.15; // Default: Occupied
    if (risk === "hazardous") {
      riskPercent = 0.25;
    } else if (risk === "noPower") {
      riskPercent = 0.20;
    }
    
    // APPLIES ONLY TO archBaseTotal (Architecture discipline)
    const premium = archBaseTotal * riskPercent;
    archAfterRisk += premium;
    
    const riskLabel = risk === "occupied" ? "Occupied" : risk === "hazardous" ? "Hazardous" : "No Power";
    items.push({
      label: `Risk Premium - ${riskLabel} (+${Math.round(riskPercent * 100)}% on Architecture)`,
      value: premium,
      editable: true,
    });
  });
}

let runningTotal = archAfterRisk + otherDisciplinesTotal;
```

**Risk Premium Rates:**
| Risk Factor | Percentage | Applied To |
|-------------|------------|------------|
| Occupied Building | 15% | Architecture Only |
| Hazardous Conditions | 25% | Architecture Only |
| No Power/HVAC | 20% | Architecture Only |

**ANSWER: Risk premiums multiply ONLY the Architecture discipline subtotal, NOT the entire project total.**

---

## 2. Landscape Logic (The Missing Link)

### Acres vs Square Feet Toggle

**There is NO explicit toggle.** The system determines input type based on building type ID:
- Building Type 14 = "Built Landscape" → Input is ACRES
- Building Type 15 = "Natural Landscape" → Input is ACRES
- All other building types → Input is SQUARE FEET

```typescript
const isLandscape = area.buildingType === "14" || area.buildingType === "15";
const inputValue = isLandscape ? parseFloat(area.squareFeet) || 0 : parseInt(area.squareFeet) || 0;
```

### Acres to Square Feet Conversion

```typescript
if (isLandscape) {
  const acres = inputValue;
  const sqft = Math.round(acres * 43560);  // CONVERSION: 1 acre = 43,560 sqft
  const perAcreRate = getLandscapePerAcreRate(area.buildingType, acres, lod);
  lineTotal = acres * perAcreRate * scopePortion;
  areaLabel = `${acres} acres (${sqft.toLocaleString()} sqft)`;
}
```

### Landscape Per-Acre Pricing Rates

```typescript
const getLandscapePerAcreRate = (buildingType: string, acres: number, lod: string): number => {
  // Landscape pricing still uses hardcoded rates (building types 14-15)
  const builtLandscapeRates: Record<string, number[]> = {
    "200": [875, 625, 375, 250, 160],   // [<5ac, 5-20ac, 20-50ac, 50-100ac, 100+ac]
    "300": [1000, 750, 500, 375, 220],
    "350": [1250, 1000, 750, 500, 260],
  };
  
  const naturalLandscapeRates: Record<string, number[]> = {
    "200": [625, 375, 250, 200, 140],
    "300": [750, 500, 375, 275, 200],
    "350": [1000, 750, 500, 325, 240],
  };
  
  const rates = buildingType === "14" ? builtLandscapeRates : naturalLandscapeRates;
  const lodRates = rates[lod] || rates["200"];
  
  // Tiered lookup based on acreage
  if (acres >= 100) return lodRates[4];
  if (acres >= 50) return lodRates[3];
  if (acres >= 20) return lodRates[2];
  if (acres >= 5) return lodRates[1];
  return lodRates[0];  // < 5 acres
};
```

### Landscape Pricing Matrix ($/acre)

| Acreage Tier | Built LoD 200 | Built LoD 300 | Built LoD 350 | Natural LoD 200 | Natural LoD 300 | Natural LoD 350 |
|--------------|---------------|---------------|---------------|-----------------|-----------------|-----------------|
| < 5 acres    | $875          | $1,000        | $1,250        | $625            | $750            | $1,000          |
| 5-20 acres   | $625          | $750          | $1,000        | $375            | $500            | $750            |
| 20-50 acres  | $375          | $500          | $750          | $250            | $375            | $500            |
| 50-100 acres | $250          | $375          | $500          | $200            | $275            | $325            |
| 100+ acres   | $160          | $220          | $260          | $140            | $200            | $240            |

---

## 3. Travel & Constants

### Travel Rate Configuration

Travel rates are **HARDCODED** in the pricing calculation, not pulled from a config file:

```typescript
// Located in calculatePricing() function

// Brooklyn Dispatch Logic
if (dispatch === "brooklyn") {
  // Tiered base pricing based on project size
  // Tier C: 0-9,999 sqft = $150 base
  // Tier B: 10,000-49,999 sqft = $300 base
  const isTierB = totalSqft >= 10000 && totalSqft < 50000;
  const isTierC = totalSqft < 10000;
  const baseTravelCost = isTierB ? 300 : (isTierC ? 150 : 0);
  
  travelCost = baseTravelCost;
  
  if (distance > 20) {
    const extraMiles = distance - 20;
    const extraMilesCost = extraMiles * 4;  // $4/mile over 20 miles
    travelCost += extraMilesCost;
  }
} else {
  // Non-Brooklyn dispatch: standard per-mile rate
  const ratePerMile = 3;  // $3/mile
  travelCost = distance * ratePerMile;
  
  // Scan day fee for distant projects
  if (distance > 75 && estimatedScanDays >= 2) {
    travelCost += 300 * estimatedScanDays;  // $300/day scan day fee
  }
}
```

### Travel Constants Summary

| Constant | Value | Location |
|----------|-------|----------|
| Standard Rate Per Mile | $3.00 | Hardcoded in Calculator.tsx |
| Brooklyn Over-20mi Rate | $4.00 | Hardcoded in Calculator.tsx |
| Brooklyn Tier B Base | $300 | Hardcoded (10k-50k sqft) |
| Brooklyn Tier C Base | $150 | Hardcoded (<10k sqft) |
| Scan Day Fee | $300/day | Hardcoded in Calculator.tsx |
| Distance Threshold | 75 miles | Hardcoded (triggers scan day fee) |
| Brooklyn Distance Threshold | 20 miles | Hardcoded (triggers per-mile charge) |

### Additional Service Rates (Hardcoded)

```typescript
const serviceRates: Record<string, number> = {
  georeferencing: 1000,      // $1,000 flat fee
  expeditedService: 0,       // 20% of total (calculated dynamically)
  actSqft: 5,                // $5/sqft
  scanningFullDay: 2500,     // $2,500/day
  scanningHalfDay: 1500,     // $1,500/half-day
};
```

---

## 4. The Data Model

### Area Interface (Form Inputs)

```typescript
interface Facade {
  id: string;
  label: string;
}

interface Area {
  id: string;
  name: string;
  buildingType: string;          // Building type ID (1-16)
  squareFeet: string;            // Square footage OR acres for landscape
  scope: string;                 // "full" | "interior" | "exterior" | "roof" | "mixed"
  disciplines: string[];         // ["architecture", "structure", "mepf", "site", "matterport"]
  disciplineLods: Record<string, string>;  // { "architecture": "300", "mepf": "200" }
  mixedInteriorLod: string;      // LoD for interior portion of mixed scope
  mixedExteriorLod: string;      // LoD for exterior portion of mixed scope
  numberOfRoofs: number;         // For roof/facades scope
  facades: Facade[];             // Individual facade entries
  gradeAroundBuilding: boolean;  // Include site/grade work
  gradeLod: string;              // LoD for grade work
  includeCad: boolean;           // Include CAD deliverable
  additionalElevations: number;  // Extra elevation drawings
}
```

### Pricing Line Item Interface

```typescript
interface PricingLineItem {
  label: string;
  value: number;
  editable?: boolean;
  isDiscount?: boolean;
  isTotal?: boolean;
  upteamCost?: number;  // Internal vendor cost for margin calculation
}
```

### Database Quote Schema (Drizzle ORM)

```typescript
// From shared/schema.ts
export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteNumber: text("quote_number").notNull().unique(),
  
  // Project details
  clientName: text("client_name"),
  projectName: text("project_name").notNull(),
  projectAddress: text("project_address").notNull(),
  specificBuilding: text("specific_building"),
  typeOfBuilding: text("type_of_building").notNull(),
  hasBasement: boolean("has_basement").default(false),
  hasAttic: boolean("has_attic").default(false),
  notes: text("notes"),
  
  // Mode
  scopingMode: boolean("scoping_mode").default(false).notNull(),
  
  // Areas (stored as JSON)
  areas: jsonb("areas").notNull(),
  
  // Risk factors
  risks: jsonb("risks").default('[]').notNull(),
  
  // Travel
  dispatchLocation: text("dispatch_location").notNull(),
  distance: integer("distance"),
  customTravelCost: decimal("custom_travel_cost", { precision: 12, scale: 2 }),
  
  // Additional services
  services: jsonb("services").default('{}').notNull(),
  
  // Scoping data (only if scoping mode enabled)
  scopingData: jsonb("scoping_data"),
  
  // Calculated pricing
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

---

## 5. Tier Determination Logic

The system uses a tiered pricing matrix based on square footage. The tier is determined by the `getAreaTier()` function:

```typescript
const getAreaTier = (sqft: number): string => {
  if (sqft <= 5000) return "0-5k";
  if (sqft <= 10000) return "5k-10k";
  if (sqft <= 20000) return "10k-20k";
  if (sqft <= 30000) return "20k-30k";
  if (sqft <= 40000) return "30k-40k";
  if (sqft <= 50000) return "40k-50k";
  if (sqft <= 75000) return "50k-75k";
  if (sqft <= 100000) return "75k-100k";
  return "100k+";
};
```

### Tier Lookup Process

1. **Input**: Square footage (with 3,000 sqft minimum applied)
2. **Tier Selection**: Match sqft to tier range using `getAreaTier()`
3. **Rate Lookup**: Query `pricing_matrix` table with:
   - `buildingTypeId` (1-16)
   - `areaTier` (from getAreaTier)
   - `discipline` (architecture, structure, mepf, site)
   - `lod` (200, 300, 350)
4. **Calculation**: `sqft × ratePerSqFt`

```typescript
const getPricingRate = (buildingTypeId: string, sqft: number, discipline: string, lod: string): number => {
  if (!pricingRates) return 0;
  
  const areaTier = getAreaTier(sqft);
  const rate = pricingRates.find((r: any) => 
    r.buildingTypeId === parseInt(buildingTypeId) &&
    r.areaTier === areaTier &&
    r.discipline === discipline &&
    r.lod === lod
  );
  
  return rate ? parseFloat(rate.ratePerSqFt) : 0;
};
```

### Tier Boundaries Summary

| Tier | Square Footage Range |
|------|---------------------|
| 0-5k | 0 - 5,000 sqft |
| 5k-10k | 5,001 - 10,000 sqft |
| 10k-20k | 10,001 - 20,000 sqft |
| 20k-30k | 20,001 - 30,000 sqft |
| 30k-40k | 30,001 - 40,000 sqft |
| 40k-50k | 40,001 - 50,000 sqft |
| 50k-75k | 50,001 - 75,000 sqft |
| 75k-100k | 75,001 - 100,000 sqft |
| 100k+ | > 100,000 sqft |

**Note**: All areas have a **minimum billing area of 3,000 sqft** regardless of actual size.

---

## Summary

| Question | Answer |
|----------|--------|
| Risk premiums apply to... | Architecture discipline ONLY |
| Landscape input type | Acres (for building types 14, 15) |
| Acres-to-sqft conversion | 1 acre = 43,560 sqft |
| Travel rates source | Hardcoded in Calculator.tsx |
| Standard travel rate | $3/mile |
| Brooklyn travel rate | $4/mile (over 20 miles) |
| Scan day fee | $300/day (triggered at 75+ miles) |
| Minimum billing area | 3,000 sqft |
| Tier lookup method | getAreaTier() → database query |

---

*Generated: January 2026*
*Source: Scan2Plan CPQ Application*

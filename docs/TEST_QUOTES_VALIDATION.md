# Test Quotes Validation Report

**Created:** January 2026  
**Quote Numbers:** TEST-2026-001 through TEST-2026-010

---

## Summary

10 test quotes have been created in the database to validate pricing engine calculations. These quotes can be opened in the CPQ Calculator to verify pricing against target prices.

---

## Test Scenarios

| # | Quote Number | Name | Size | Building Type | Key Features | Target Price |
|---|--------------|------|------|---------------|--------------|--------------|
| 1 | TEST-2026-001 | Starter Interior | 2,000 sqft | Residential (1) | Arch, Interior, LoD 200 | ~$3K |
| 2 | TEST-2026-002 | Multi-Discipline Mid | 18,500 sqft | Office (4) | Arch+MEPF+Struct, Full, LoD 300, Occupied | ~$35-45K |
| 3 | TEST-2026-003 | Exterior Retrofit | 12,000 sqft | Retail (5) | Arch, Exterior, LoD 350, 120mi | ~$25-35K |
| 4 | TEST-2026-004 | Roof/Facade Package | 6,500 sqft | Mixed Use (9) | Arch, Exterior, LoD 300, CAD | ~$15K |
| 5 | TEST-2026-005 | Landscape Campus | 3.2 acres | Built Landscape (14) | LoD 300 | ~$20K |
| 6 | TEST-2026-006 | Large Campus Mix | 45K sqft + 1.5 ac | Healthcare (9) + Natural (15) | Multi-area, Custom travel $4,500 | ~$90-110K |
| 7 | TEST-2026-007 | Risk-Stacked Industrial | 55,000 sqft | Warehouse (11) | Hazardous+NoPower, 400mi | ~$120-150K |
| 8 | TEST-2026-008 | Tier A Baseline | 80,000 sqft | Office (4) | Manual: Scan $35K, Model $55K | ~$140K |
| 9 | TEST-2026-009 | Tier A High | 150,000 sqft | Data Center (10) | Manual: Scan $70K, Model $95K | ~$235K |
| 10 | TEST-2026-010 | Mixed-Scope Specialty | 28,000 sqft | Hospitality (8) | Mixed scope, ACT area | ~$55-65K |

---

## Pricing Logic Coverage

### Min Floor Test (Scenario 1)
- **Input:** 2,000 sqft
- **Effective:** 3,000 sqft (minimum billable)
- **Validates:** `MIN_SQFT_FLOOR = 3000` constant

### Risk Premium Test (Scenarios 2, 7)
- **Scenario 2:** Occupied (+15% on Arch only)
- **Scenario 7:** Hazardous (+25%) + No Power (+20%) = +45% on Arch only
- **Validates:** Risk premiums apply ONLY to Architecture discipline

### Scope Tests (Scenarios 1, 3, 4, 10)
- **Interior (65%):** Scenario 1
- **Exterior (35%):** Scenarios 3, 4
- **Mixed:** Scenario 10 (split LoDs for interior/exterior)

### Landscape Tests (Scenarios 5, 6)
- **Scenario 5:** Built Landscape, 3.2 acres, per-acre pricing
- **Scenario 6:** Multi-area with Natural Landscape addition
- **Validates:** Per-acre rate lookup by type, tier, and LoD

### Travel Tests (Scenarios 3, 4, 6, 7)
- **Standard (120mi, 400mi):** Scenarios 3, 7 - includes scan day fee at 75+ miles
- **Brooklyn:** Scenario 4 - Tier C (6,500 sqft < 10k)
- **Custom fly-out:** Scenarios 6, 8, 9

### Tier A Tests (Scenarios 7, 8, 9)
- **Scenario 7:** 55k sqft - qualifies for Tier A (may use formula or manual)
- **Scenario 8:** 80k sqft - manual: ($35K + $55K) × 1.55 = $139,500
- **Scenario 9:** 150k sqft - manual: ($70K + $95K) × 1.42 = $234,300

### Special Services (Scenarios 4, 10)
- **CAD Package:** Scenario 4
- **ACT Pricing:** Scenario 10 - 15,000 sqft @ $2.00/sqft

---

## Important Finding: Area Tier Mismatch

During validation, I discovered a mismatch between:

1. **pricingEngine.ts getAreaTier():**
   - Returns: "0-3k", "3k-5k", "5k-10k", "10k-25k", "25k-50k", etc.

2. **Database pricing_matrix.area_tier:**
   - Contains: "0-5k", "5k-10k", "10k-20k", "20k-30k", "30k-40k", "40k-50k", etc.

**Impact:** When the tier label from `getAreaTier()` doesn't match any database row, the system falls back to `DEFAULT_BASE_RATES` (which are much higher than the database rates).

**Example:** For 18,500 sqft:
- Code returns: "10k-25k"
- Database has: "10k-20k" and "20k-30k" (no "10k-25k")
- Result: Falls back to $2.50/sqft instead of ~$1.00/sqft

This explains why the script's calculated prices using fallback rates are 3-4x higher than target prices.

---

## How to Validate

1. **Open Dashboard:** Navigate to the CPQ application
2. **Find Test Quotes:** Look for quotes starting with "TEST-2026-"
3. **Open Each Quote:** Click to open in Calculator
4. **Compare Prices:** Verify the calculated price matches the target range

---

## Scripts

### Create Test Quotes
```bash
npx tsx scripts/create-test-quotes.ts
```

### Calculate Expected Prices (using fallback rates)
```bash
npx tsx scripts/calculate-test-prices.ts
```

---

## Next Steps

1. **Validate in CPQ Calculator:** Open each test quote and verify pricing
2. **Fix Tier Label Mismatch:** Consider aligning `getAreaTier()` with database labels
3. **Document Actual vs Expected:** Record actual CPQ Calculator prices vs targets

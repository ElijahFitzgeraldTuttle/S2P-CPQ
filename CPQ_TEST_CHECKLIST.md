# CPQ Test Checklist

Use this checklist to verify all pricing logic is working correctly in the new build.

---

## How to Use

1. Open the **Test Payload Sender** at `/test-payload`
2. Load each preset scenario
3. Click "Send to CPQ" 
4. Verify the CPQ calculates expected results
5. Check all items in each section

---

## Test Scenarios

### 1. Standard Project Pricing

**Preset:** "Standard Office (25k sqft)"

| Check | Test | Expected Result |
|-------|------|-----------------|
| [ ] | Load preset and send payload | CPQ populates all fields |
| [ ] | Client name shows | "Test Client Inc" |
| [ ] | Project name shows | "Standard Office Test" |
| [ ] | Area shows 25,000 sqft | Office Building, 25k sqft |
| [ ] | Architecture @ LoD 300 selected | Discipline checkbox checked |
| [ ] | Pricing calculates | Line item appears with database rate |
| [ ] | Travel shows | Troy dispatch, 30 miles = $90 |
| [ ] | Total calculates | Subtotal + travel = Grand Total |

**Verification:**
- Open browser console (F12)
- Should see: `CPQ received full scoping payload: {...}`
- Should see: `CPQ state hydrated from full scoping payload`

---

### 2. Tier A Project (50k+ sqft)

**Preset:** "Tier A Project (75k sqft)"

| Check | Test | Expected Result |
|-------|------|-----------------|
| [ ] | Total sqft shows 75,000 | Project qualifies as Tier A |
| [ ] | Tier A fields populated | Scanning: $10,500, Modeling: $18,000, Margin: 3X |
| [ ] | Brooklyn dispatch selected | "brooklyn" in dispatch dropdown |
| [ ] | Brooklyn travel base = $0 | Tier A = no base fee |
| [ ] | Travel shows 25 miles | Base $0 + 5 miles × $4 = $20 |
| [ ] | Risk premium applied | "Occupied" adds 15% to Arch only |
| [ ] | Multiple disciplines show | Arch, Structure, MEPF all have line items |

**Expected Travel Calculation:**
```
Brooklyn Tier A (75k sqft): $0 base
Distance: 25 miles (5 miles over 20)
Extra: 5 × $4 = $20
Total Travel: $20
```

---

### 3. Landscape Project (Acres)

**Preset:** "Landscape Project (5 acres)"

| Check | Test | Expected Result |
|-------|------|-----------------|
| [ ] | Building type shows | "Built Landscape" |
| [ ] | Input shows acres | "5" (not 217,800 sqft) |
| [ ] | Discipline auto-locked | "Site" only (no other options) |
| [ ] | Scope auto-locked | "Full" |
| [ ] | Display shows conversion | "5 acres (217,800 sqft)" |
| [ ] | Pricing uses per-acre rate | 5 × $1,000/acre (LoD 300) = $5,000 |
| [ ] | CAD option hidden | No CAD checkbox for landscape |

**Expected Pricing:**
- Built Landscape, 5 acres, LoD 300
- Per-acre rate (< 5 acres tier): $1,000/acre
- Line item: $5,000

---

### 4. Risk Premium Application

**Preset:** "Risk Premium Test (Occupied + Hazardous)"

| Check | Test | Expected Result |
|-------|------|-----------------|
| [ ] | Risk checkboxes checked | Occupied + Hazardous both checked |
| [ ] | Architecture line item shows premium | Base × (1 + 15% + 25%) = Base × 1.4 |
| [ ] | MEPF line item NO premium | MEPF uses base rate only |
| [ ] | Premium only on Architecture | Structure, Site, Matterport unaffected |

**Example Calculation:**
```
Architecture base: $3,000
Risk premium: 15% (occupied) + 25% (hazardous) = 40%
Architecture with risk: $3,000 × 1.40 = $4,200

MEPF base: $1,500
MEPF total: $1,500 (no risk applied)
```

---

### 5. Fly-Out Project (75+ miles)

**Preset:** "Fly-Out Project (150 miles)"

| Check | Test | Expected Result |
|-------|------|-----------------|
| [ ] | Distance shows 150 miles | Input field shows 150 |
| [ ] | Travel base calculated | 150 × $3/mile = $450 |
| [ ] | Scan Day Fee added | +$300 (triggered at 75+ miles) |
| [ ] | Total travel cost | $450 + $300 = $750 |
| [ ] | Travel line item label | Shows "Scan Day Fee" notation |

**Expected Travel:**
```
Troy dispatch, 150 miles
Base: 150 × $3 = $450
Scan Day Fee: $300 (75+ miles trigger)
Total Travel: $750
```

---

### 6. Multi-Area Project

**Preset:** "Multi-Area Project"

| Check | Test | Expected Result |
|-------|------|-----------------|
| [ ] | Three areas display | Building A, Building B, Parking Lot |
| [ ] | Building A pricing | 15k sqft, Office, Arch LoD 300 |
| [ ] | Building B pricing | 20k sqft, Educational, Arch + MEPF |
| [ ] | Parking Lot (landscape) | 2.5 acres, Site discipline |
| [ ] | Total sqft aggregates | 15k + 20k + (2.5 × 43,560) = 143,900 sqft |
| [ ] | Each area has line items | Separate line items per area |
| [ ] | Grand total sums all | All areas + travel |

---

### 7. Brooklyn Travel Tiers

Test Brooklyn dispatch at different project sizes:

| Project Size | Expected Base | Extra (over 20mi) |
|--------------|---------------|-------------------|
| < 10k sqft (Tier C) | $150 | $4/mile |
| 10k-50k sqft (Tier B) | $300 | $4/mile |
| 50k+ sqft (Tier A) | $0 | $4/mile |

**Test Steps:**
1. Load "Standard Office (25k sqft)"
2. Change dispatch to "Brooklyn"
3. Verify base = $300 (Tier B)
4. Change sqft to 8000
5. Verify base = $150 (Tier C)
6. Change sqft to 60000
7. Verify base = $0 (Tier A)

---

### 8. Payment Term Premiums

| Term | Premium | Expected |
|------|---------|----------|
| Partner | 0% | No premium |
| Owner | 0% | No premium |
| Net 30 | +5% | Subtotal × 1.05 |
| Net 60 | +10% | Subtotal × 1.10 |
| Net 90 | +15% | Subtotal × 1.15 |

---

### 9. Scope Discounts

| Scope | Expected Discount |
|-------|-------------------|
| Full | 0% |
| Interior Only | ~35-40% discount |
| Exterior Only | ~60-65% discount |
| Mixed | Uses interior/exterior LoDs |

---

### 10. CAD Package Pricing

| Check | Test | Expected Result |
|-------|------|-----------------|
| [ ] | Enable CAD checkbox | "Include CAD" checked |
| [ ] | CAD line item appears | Separate line item for CAD |
| [ ] | CAD uses database rates | Lookup by building type + tier |
| [ ] | Additional elevations | $25/ea for 1-10, tiered pricing |

---

## Integration Tests

### CRM → CPQ Payload

| Check | Test |
|-------|------|
| [ ] | leadId transfers | Lead ID shows in CPQ |
| [ ] | projectDetails populate | All 8 fields hydrate |
| [ ] | areas hydrate | All area fields including LoDs |
| [ ] | risks array works | Risk checkboxes reflect sent values |
| [ ] | travel object works | Dispatch + distance populate |
| [ ] | scopingData hydrates | All 40+ fields transfer |

### Save/Load Quote

| Check | Test |
|-------|------|
| [ ] | Save quote | Click save, quote number generated |
| [ ] | Load saved quote | Navigate to /calculator/:id |
| [ ] | All fields persist | Areas, risks, travel, scoping intact |
| [ ] | Pricing recalculates | Same totals as before save |

---

## Integrity Auditor Tests

### Margin Floor

| Check | Test | Expected |
|-------|------|----------|
| [ ] | Quote with 50%+ margin | Status: PASS |
| [ ] | Quote with 45-50% margin | Status: WARNING |
| [ ] | Quote with <45% margin | Status: BLOCKED |

### Travel Required

| Check | Test | Expected |
|-------|------|----------|
| [ ] | Fly-out with travel cost | Status: PASS |
| [ ] | Fly-out with $0 travel | Status: BLOCKED |

### Historical Variance

| Check | Test | Expected |
|-------|------|----------|
| [ ] | Quote within 15% of historical | Status: PASS |
| [ ] | Quote 15-30% variance | Status: WARNING |
| [ ] | Quote 30%+ variance | Status: BLOCKED |

---

## Console Log Verification

Open browser Developer Tools (F12) → Console tab.

Expected logs when payload sent:

```
CPQ received full scoping payload: {type: "CPQ_SCOPING_PAYLOAD", ...}
CPQ state hydrated from full scoping payload
```

If these don't appear:
- Check iframe URL is correct
- Verify postMessage origin
- Check for CORS errors

---

## Quick Smoke Test

Minimum viable test to confirm basic functionality:

1. [ ] Open `/test-payload`
2. [ ] Load "Standard Office" preset
3. [ ] Click "Send to CPQ"
4. [ ] Verify CPQ shows project name
5. [ ] Verify pricing line items appear
6. [ ] Load "Landscape Project" preset
7. [ ] Click "Send to CPQ"
8. [ ] Verify acres input (not sqft)
9. [ ] Verify Site discipline locked

---

## Regression Tests After Changes

After modifying pricing logic, re-run:

1. [ ] All 6 preset scenarios
2. [ ] Brooklyn travel tier switching
3. [ ] Risk premium on Architecture only
4. [ ] Landscape acres conversion
5. [ ] Fly-out scan day fee trigger
6. [ ] Save and reload quote

---

*Last Updated: January 2026*

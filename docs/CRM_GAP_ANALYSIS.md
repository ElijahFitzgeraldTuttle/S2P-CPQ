# CRM Gap Analysis: Alignment with CPQ

**Version:** 1.0  
**Date:** January 2026  
**Purpose:** Detailed specification of changes required for CRM to align with CPQ implementation

---

## Executive Summary

This document identifies gaps between the CRM's current Quote Builder implementation and the CPQ system. All changes should be made to the CRM to match the CPQ (source of truth).

**Priority Levels:**
- 🔴 **Critical** - Breaks pricing calculations or data sync
- 🟡 **Important** - Causes incorrect pricing or UI inconsistency
- 🟢 **Minor** - Cosmetic or optional enhancement

---

## 1. Per-Discipline Level of Detail (LoD) 🔴 CRITICAL

### Current CRM Implementation (WRONG)
```json
{
  "areas": [{
    "lod": "300"  // Single LoD per area
  }]
}
```

### Required CPQ Implementation (CORRECT)
```json
{
  "areas": [{
    "disciplineLods": {
      "architecture": "300",
      "structure": "200",
      "mepf": "300",
      "site": "200"
    }
  }]
}
```

### UI Change Required

For each selected discipline, show an LoD selector:

```
☑ Architecture  [LoD 300 ▼]
☑ Structure     [LoD 200 ▼]
☑ MEPF          [LoD 300 ▼]
☐ Site
```

### Field Definition

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `disciplineLods` | `Record<string, string>` | `{}` | Simple key-value: discipline ID → LoD string |

**Example:**
```typescript
disciplineLods: Record<string, string> = {
  "architecture": "300",
  "structure": "200"
}
```

**LoD Options:** `"200"`, `"300"`, `"350"`

---

## 2. Missing Area Fields 🔴 CRITICAL

Add these fields to each area in the Quote Builder:

### 2.1 Mixed Scope LoD Fields

When `scope` is set to a mixed configuration, these control interior/exterior LoDs separately:

| Field | ID | Type | Default | Show When |
|-------|-----|------|---------|-----------|
| Mixed Interior LoD | `mixedInteriorLod` | Select | `"300"` | Scope involves interior |
| Mixed Exterior LoD | `mixedExteriorLod` | Select | `"300"` | Scope involves exterior |

**Options:** `200`, `300`, `350`

### 2.2 Roof/Facade Fields

| Field | ID | Type | Default | Notes |
|-------|-----|------|---------|-------|
| Number of Roofs | `numberOfRoofs` | Number | `0` | Count of roof structures |
| Facades | `facades` | Array of Strings | `[]` | Dynamic list, e.g., ["North", "South", "East"] |

**Facades UI:** Allow adding/removing facade entries dynamically.

### 2.3 Grade Survey Fields

| Field | ID | Type | Default | Notes |
|-------|-----|------|---------|-------|
| Grade Around Building | `gradeAroundBuilding` | Boolean | `false` | Toggle for grade survey |
| Grade LoD | `gradeLod` | Select | `"300"` | Show when gradeAroundBuilding = true |

**Grade LoD Options:** `200`, `300`, `350`

### 2.4 CAD Deliverable

| Field | ID | Type | Default | Notes |
|-------|-----|------|---------|-------|
| Include CAD | `includeCad` | Boolean | `false` | Adds CAD package to pricing |

### 2.5 Additional Elevations

| Field | ID | Type | Default | Notes |
|-------|-----|------|---------|-------|
| Additional Elevations | `additionalElevations` | Number | `0` | Extra interior elevation count |

---

## 3. LoD Options ✅ ALIGNED

### CPQ LoD Options
```
200, 300, 350
```

### CRM LoD Options  
```
200, 300, 350
```

**Status:** LoD options match. No changes required.

| ID | Label | Multiplier |
|----|-------|------------|
| `200` | LOD 200 | 1.0x (base) |
| `300` | LOD 300 | 1.3x |
| `350` | LOD 350 | 1.5x |

---

## 4. Dispatch Location Values 🟡 IMPORTANT

### Current CRM Values (WRONG)
```
WOODSTOCK, BROOKLYN, TROY, FLY_OUT
```

### Required CPQ Values (CORRECT)
```
troy, woodstock, brooklyn
```

### Action Required

| Change | From | To |
|--------|------|-----|
| Case | UPPERCASE | lowercase |
| Remove | `FLY_OUT` | Not in CPQ UI |
| Reorder | - | `troy`, `woodstock`, `brooklyn` |

**Note:** If fly-out functionality is needed, implement as a manual travel cost override rather than a dispatch location.

### Updated Dispatch Options

| ID | Label | Notes |
|----|-------|-------|
| `troy` | Troy, NY | 188 1st St, Troy, NY 12180 |
| `woodstock` | Woodstock, NY | 3272 Rt 212, Bearsville, NY 12409 |
| `brooklyn` | Brooklyn, NY | 176 Borinquen Place, Brooklyn, NY 11211 |

---

## 5. Risk Factors Mismatch 🟡 IMPORTANT

### Current CRM Risks (TOO MANY)
```
hazardous, noPower, occupied, security, historic, height
```

### Required CPQ Risks (CORRECT)
```
occupied, hazardous, noPower
```

### Action Required

| Risk | CRM | CPQ | Action |
|------|-----|-----|--------|
| `occupied` | ✓ | ✓ | Keep |
| `hazardous` | ✓ | ✓ | Keep |
| `noPower` | ✓ | ✓ | Keep |
| `security` | ✓ | ✗ | **REMOVE** |
| `historic` | ✓ | ✗ | **REMOVE** |
| `height` | ✓ | ✗ | **REMOVE** |

### Updated Risk Factor UI

| ID | Label | Premium | Applied To |
|----|-------|---------|-----------|
| `occupied` | Occupied Building | +15% | Architecture only |
| `hazardous` | Hazardous Conditions | +25% | Architecture only |
| `noPower` | No Power/HVAC | +20% | Architecture only |

---

## 6. Building Type Alignment 🟡 IMPORTANT

### Current CRM Building Types
```
1: Office/Commercial
2: Residential Single Family
3: Residential Multi-Family
4: Industrial/Warehouse
5: Retail
6: Healthcare
7: Education K-12
8: Higher Education
9: Hospitality
10: Mixed Use
11: Religious/Cultural
12: Government/Civic
13: Data Center
14: Landscape - Built
15: Landscape - Natural
16: ACT Modeling
```

### Required CPQ Building Types
```
1: Residential - Single Family
2: Residential - Multi Family
3: Residential - Luxury
4: Commercial / Office
5: Retail / Restaurants
6: Kitchen / Catering Facilities
7: Education
8: Hotel / Theatre / Museum
9: Hospitals / Mixed Use
10: Mechanical / Utility Rooms
11: Warehouse / Storage
12: Religious Buildings
13: Infrastructure / Roads / Bridges
14: Built Landscape
15: Natural Landscape
16: ACT (Above/Below Acoustic Ceiling Tiles)
```

### Action Required

Update the building type dropdown to match CPQ labels exactly:

| ID | CPQ Label | Unit | Notes |
|----|-----------|------|-------|
| 1 | Residential - Single Family | sqft | |
| 2 | Residential - Multi Family | sqft | |
| 3 | Residential - Luxury | sqft | |
| 4 | Commercial / Office | sqft | |
| 5 | Retail / Restaurants | sqft | |
| 6 | Kitchen / Catering Facilities | sqft | |
| 7 | Education | sqft | |
| 8 | Hotel / Theatre / Museum | sqft | |
| 9 | Hospitals / Mixed Use | sqft | |
| 10 | Mechanical / Utility Rooms | sqft | |
| 11 | Warehouse / Storage | sqft | |
| 12 | Religious Buildings | sqft | |
| 13 | Infrastructure / Roads / Bridges | sqft | |
| 14 | Built Landscape | **acres** | Auto-select site discipline |
| 15 | Natural Landscape | **acres** | Auto-select site discipline |
| 16 | ACT (Above/Below Acoustic Ceiling Tiles) | sqft | Auto-select mepf discipline |

---

## 7. Remove `kind` Field 🟢 MINOR

### Current CRM Implementation
```json
{
  "kind": "standard",  // or "landscape"
  "buildingType": "1"
}
```

### Required CPQ Implementation
```json
{
  "buildingType": "1"  // No kind field - inferred from buildingType
}
```

### Action Required

- **Remove** the `kind` field from area objects
- **Infer landscape** from buildingType: IDs 14-15 are landscape types
- **UI change:** Remove "Standard/Landscape" toggle if present

---

## 8. API Field Mapping Summary

When sending data to CPQ API, map CRM fields as follows:

### Area Object Mapping

| CRM Field (Current) | CPQ Field (Required) | Notes |
|---------------------|---------------------|-------|
| `kind` | *Remove* | Not used by CPQ |
| `lod` | `disciplineLods` | Convert to per-discipline object |
| `includeCadDeliverable` | `includeCad` | Rename field |
| - | `mixedInteriorLod` | Add new field |
| - | `mixedExteriorLod` | Add new field |
| - | `numberOfRoofs` | Add new field |
| - | `facades` | Add new field |
| - | `gradeAroundBuilding` | Add new field |
| - | `gradeLod` | Add new field |

### Example Transformation

**CRM Current Format:**
```json
{
  "id": "1",
  "name": "Main Building",
  "kind": "standard",
  "buildingType": "1",
  "squareFeet": "15000",
  "lod": "300",
  "scope": "full",
  "disciplines": ["architecture", "structure"],
  "includeCadDeliverable": true
}
```

**CPQ Required Format:**
```json
{
  "id": "1",
  "name": "Main Building",
  "buildingType": "1",
  "squareFeet": "15000",
  "scope": "full",
  "disciplines": ["architecture", "structure"],
  "disciplineLods": {
    "architecture": "300",
    "structure": "300"
  },
  "mixedInteriorLod": "300",
  "mixedExteriorLod": "300",
  "numberOfRoofs": 0,
  "facades": [],
  "gradeAroundBuilding": false,
  "gradeLod": "300",
  "includeCad": true,
  "additionalElevations": 0
}
```

---

## 9. Complete Area Default Values

When creating a new area, use these defaults:

```typescript
// TypeScript type definition
interface Area {
  id: string;
  name: string;
  buildingType: string;
  squareFeet: string;
  scope: string;
  disciplines: string[];
  disciplineLods: Record<string, string>;  // Simple discipline -> lod mapping
  mixedInteriorLod: string;
  mixedExteriorLod: string;
  numberOfRoofs: number;
  facades: string[];
  gradeAroundBuilding: boolean;
  gradeLod: string;
  includeCad: boolean;
  additionalElevations: number;
}

// Default values
const defaultArea: Area = {
  id: "auto-generated-uuid",
  name: "",
  buildingType: "",
  squareFeet: "",
  scope: "full",
  disciplines: [],
  disciplineLods: {},  // e.g., { "architecture": "300", "structure": "200" }
  mixedInteriorLod: "300",
  mixedExteriorLod: "300",
  numberOfRoofs: 0,
  facades: [],
  gradeAroundBuilding: false,
  gradeLod: "300",
  includeCad: false,
  additionalElevations: 0
};
```

---

## 10. Validation Requirements

### Required Fields (Block Save)
- `buildingType` - Must be selected
- `squareFeet` - Must be > 0

### Conditional Requirements
- If `gradeAroundBuilding` = true → Show `gradeLod` selector
- If `scope` = "roof" → Show `numberOfRoofs` field
- If `scope` = "facade" → Show `facades` array builder
- If `buildingType` = 14 or 15 → Change label to "Acres", auto-select "site" discipline

---

## Implementation Checklist

### Phase 1: Critical Changes 🔴
- [ ] Implement per-discipline LoD (`disciplineLods` as `Record<string, string>`)
- [ ] Add missing area fields (mixedInteriorLod, mixedExteriorLod, numberOfRoofs, facades, gradeAroundBuilding, gradeLod, includeCad, additionalElevations)

### Phase 2: Important Changes 🟡
- [ ] Fix dispatch location values (lowercase)
- [ ] Remove extra risk factors (security, historic, height)
- [ ] Update building type labels to match CPQ

### Phase 3: Minor Changes 🟢
- [ ] Remove `kind` field from area objects
- [ ] Rename `includeCadDeliverable` to `includeCad`
- [ ] Update field defaults

---

## Testing Verification

After implementing changes, verify alignment by:

1. Create a quote in CRM with:
   - 2 areas with different building types
   - Multiple disciplines with different LoDs per discipline
   - Risk factors applied
   - Travel from Brooklyn

2. Send to CPQ API and verify:
   - No validation errors
   - Pricing matches expected calculations
   - All fields correctly mapped

3. Sync quote back to CRM and verify:
   - All data preserved
   - Bi-directional sync works

---

## Contact

For questions about CPQ field specifications, refer to:
- `docs/CRM_UI_SPECIFICATION.md` - Complete UI field reference
- `docs/CPQ_PRICING_API.md` - API documentation

---

**Document Version:** 1.0  
**Last Updated:** January 2026

# CRM-CPQ Integration Test Jobs - Real Address Edition

This document contains 10 test jobs using real addresses for accurate travel calculation and mapping features. Each job exercises different building types, sizes, and geographic dispatch scenarios.

---

## Quick Reference Matrix

| Job | Property | Type | Est. Sqft | CPQ Type | Dispatch | Travel |
|-----|----------|------|-----------|----------|----------|--------|
| 1 | 2525 Purchase St, Purchase, NY | Mega Mansion | 14,700 | 3 (Luxury) | brooklyn | Regional |
| 2 | 255 Greenwich St, NYC | Class A Office | 51,500 | 4 (Commercial) | brooklyn | Local |
| 3 | 1218 Arch St, Philadelphia | Historic/AIA | 20,000 | 8 (Theatre/Museum) | brooklyn | Regional |
| 4 | 613 Warehouse, Wilmington, MA | Logistics Hub | 435,000 | 11 (Warehouse) | troy | Regional |
| 5 | 69 Mercer St, NYC | SoHo Loft | 5,200 | 5 (Retail) | brooklyn | Local |
| 6 | 233 Broadway, NYC | Woolworth Bldg | 30,000 | 4 (Commercial) | brooklyn | Local |
| 7 | 425 John Quincy Adams Rd, Taunton, MA | Cold Storage | 85,000 | 11 (Warehouse) | troy | Regional |
| 8 | 3900 City Ave, Philadelphia | Multi-Unit High-Rise | 120,000 | 2 (Multi Family) | brooklyn | Regional |
| 9 | Tobin Center, San Antonio, TX | Performing Arts | 175,000 | 8 (Theatre/Museum) | troy | Flyout |
| 10 | 2810 Clark Ave, St. Louis, MO | Industrial/Lab | 12,000 | 10 (Mechanical) | troy | Flyout |

---

## Job 1: Mega Mansion - Complex Internal Registration

**Test Focus:** Massive residential estate with 12 bathrooms. Tests complex internal room-to-room registration.

### Full API Payload
```json
{
  "clientName": "Purchase Estate Holdings",
  "projectName": "Purchase Mega Mansion As-Built",
  "projectAddress": "2525 Purchase St, Purchase, NY 10577",
  
  "areas": [
    {
      "name": "Main Residence",
      "buildingType": "3",
      "squareFeet": "14700",
      "disciplines": ["architecture", "mepf"],
      "disciplineLods": {
        "architecture": {
          "discipline": "architecture",
          "lod": "350",
          "scope": "full"
        },
        "mepf": {
          "discipline": "mepf",
          "lod": "300",
          "scope": "full"
        }
      }
    }
  ],
  
  "risks": ["occupied"],
  
  "dispatchLocation": "brooklyn",
  "distance": 35,
  
  "services": {
    "matterport": true,
    "actScan": false,
    "additionalElevations": 4
  },
  
  "paymentTerms": "net30"
}
```

### Lead Information
| Field | Value |
|-------|-------|
| Company Name | Purchase Estate Holdings |
| Contact First Name | Victoria |
| Contact Last Name | Ashworth |
| Contact Email | vashworth@purchaseestate.com |
| Contact Phone | (914) 555-0101 |

### Expected Validation
- **Tier:** 10k-20k sqft
- **Building Type:** Luxury residential premium
- **LoD:** High detail (350 Arch, 300 MEPF)
- **Travel:** ~35 miles from Brooklyn
- **Risk:** Occupied (+15%)
- **Services:** Matterport + 4 additional elevations

---

## Job 2: Class A Office - High-Density Workspace

**Test Focus:** Large commercial floor plate in Lower Manhattan. Tests high-density workspace layout.

### Full API Payload
```json
{
  "clientName": "Greenwich Street Partners",
  "projectName": "255 Greenwich Office BIM",
  "projectAddress": "255 Greenwich St, New York, NY 10007",
  
  "areas": [
    {
      "name": "Office Floors 10-15",
      "buildingType": "4",
      "squareFeet": "51500",
      "disciplines": ["architecture", "mepf", "structure"],
      "disciplineLods": {
        "architecture": {
          "discipline": "architecture",
          "lod": "300",
          "scope": "interior"
        },
        "mepf": {
          "discipline": "mepf",
          "lod": "350",
          "scope": "interior"
        },
        "structure": {
          "discipline": "structure",
          "lod": "200",
          "scope": "full"
        }
      }
    }
  ],
  
  "risks": ["occupied"],
  
  "dispatchLocation": "brooklyn",
  "distance": 5,
  
  "services": {
    "matterport": false,
    "actScan": true,
    "additionalElevations": 0
  },
  
  "paymentTerms": "net45"
}
```

### Lead Information
| Field | Value |
|-------|-------|
| Company Name | Greenwich Street Partners |
| Contact First Name | Marcus |
| Contact Last Name | Chen |
| Contact Email | mchen@greenwichpartners.com |
| Contact Phone | (212) 555-0202 |

### Expected Validation
- **Tier:** 50k-75k sqft
- **Building Type:** Commercial/Office
- **Scope:** Interior only for Arch/MEPF
- **Travel:** ~5 miles from Brooklyn (local)
- **Risk:** Occupied (+15%)
- **Services:** ACT Scan

---

## Job 3: Historic/AIA Building - Precision Architecture

**Test Focus:** Historic structure with ornate details. Tests precision in non-standard architecture.

### Full API Payload
```json
{
  "clientName": "Philadelphia Preservation Society",
  "projectName": "1218 Arch Historic Documentation",
  "projectAddress": "1218 Arch St, Philadelphia, PA 19107",
  
  "areas": [
    {
      "name": "Historic Main Building",
      "buildingType": "8",
      "squareFeet": "20000",
      "disciplines": ["architecture", "structure"],
      "disciplineLods": {
        "architecture": {
          "discipline": "architecture",
          "lod": "350",
          "scope": "full"
        },
        "structure": {
          "discipline": "structure",
          "lod": "300",
          "scope": "full"
        }
      }
    }
  ],
  
  "risks": [],
  
  "dispatchLocation": "brooklyn",
  "distance": 95,
  
  "services": {
    "matterport": true,
    "actScan": false,
    "additionalElevations": 8
  },
  
  "paymentTerms": "net30"
}
```

### Lead Information
| Field | Value |
|-------|-------|
| Company Name | Philadelphia Preservation Society |
| Contact First Name | Eleanor |
| Contact Last Name | Richardson |
| Contact Email | erichardson@philapres.org |
| Contact Phone | (215) 555-0303 |

### Expected Validation
- **Tier:** 10k-20k sqft (or 20k-30k depending on tier boundaries)
- **Building Type:** Hotel/Theatre/Museum (historic premium)
- **LoD:** Maximum detail (350) for ornate architecture
- **Travel:** ~95 miles from Brooklyn to Philadelphia
- **Services:** Matterport + 8 additional elevations (facade details)

---

## Job 4: Logistics Hub - Long-Range LiDAR

**Test Focus:** Massive open warehouse with 54 loading docks. Tests long-range LiDAR and loop closure.

### Full API Payload
```json
{
  "clientName": "Wilmington Logistics Corp",
  "projectName": "613 Warehouse Facility Scan",
  "projectAddress": "613 Warehouse, Wilmington, MA 01887",
  
  "areas": [
    {
      "name": "Main Warehouse",
      "buildingType": "11",
      "squareFeet": "435000",
      "disciplines": ["architecture", "structure"],
      "disciplineLods": {
        "architecture": {
          "discipline": "architecture",
          "lod": "200",
          "scope": "interior"
        },
        "structure": {
          "discipline": "structure",
          "lod": "200",
          "scope": "full"
        }
      }
    }
  ],
  
  "risks": ["occupied", "hazardous"],
  
  "dispatchLocation": "troy",
  "distance": 180,
  
  "services": {
    "matterport": false,
    "actScan": false,
    "additionalElevations": 0
  },
  
  "paymentTerms": "net60"
}
```

### Lead Information
| Field | Value |
|-------|-------|
| Company Name | Wilmington Logistics Corp |
| Contact First Name | James |
| Contact Last Name | O'Brien |
| Contact Email | jobrien@wilmingtonlogistics.com |
| Contact Phone | (978) 555-0404 |

### Expected Validation
- **Tier:** Highest tier (300k+ sqft)
- **Building Type:** Warehouse/Storage
- **LoD:** Base level (200) - open warehouse doesn't need high detail
- **Travel:** ~180 miles from Troy to Wilmington, MA
- **Risk:** Occupied (+15%) + Hazardous (+25%) = +40%

---

## Job 5: SoHo Loft - Cast-Iron Architecture

**Test Focus:** Classic cast-iron building with high ceilings and columns. Tests "SoHo style" retail space mapping.

### Full API Payload
```json
{
  "clientName": "Mercer Street Retail LLC",
  "projectName": "69 Mercer SoHo Loft Survey",
  "projectAddress": "69 Mercer St, New York, NY 10012",
  
  "areas": [
    {
      "name": "Retail Loft Space",
      "buildingType": "5",
      "squareFeet": "5200",
      "disciplines": ["architecture", "mepf"],
      "disciplineLods": {
        "architecture": {
          "discipline": "architecture",
          "lod": "300",
          "scope": "full"
        },
        "mepf": {
          "discipline": "mepf",
          "lod": "300",
          "scope": "interior"
        }
      }
    }
  ],
  
  "risks": ["occupied"],
  
  "dispatchLocation": "brooklyn",
  "distance": 3,
  
  "services": {
    "matterport": true,
    "actScan": false,
    "additionalElevations": 2
  },
  
  "paymentTerms": "net30"
}
```

### Lead Information
| Field | Value |
|-------|-------|
| Company Name | Mercer Street Retail LLC |
| Contact First Name | Sofia |
| Contact Last Name | Martinez |
| Contact Email | smartinez@mercerretail.com |
| Contact Phone | (212) 555-0505 |

### Expected Validation
- **Tier:** 5k-10k sqft
- **Building Type:** Retail/Restaurants
- **Travel:** ~3 miles from Brooklyn (local)
- **Risk:** Occupied (+15%)
- **Services:** Matterport + 2 elevations

---

## Job 6: Woolworth Building - Vertical Alignment

**Test Focus:** Segment scan of the iconic skyscraper. Tests vertical alignment and high-traffic area scanning.

### Full API Payload
```json
{
  "clientName": "Woolworth Building Management",
  "projectName": "Woolworth Building Partial BIM",
  "projectAddress": "233 Broadway, New York, NY 10007",
  
  "areas": [
    {
      "name": "Floors 15-25",
      "buildingType": "4",
      "squareFeet": "30000",
      "disciplines": ["architecture", "structure", "mepf"],
      "disciplineLods": {
        "architecture": {
          "discipline": "architecture",
          "lod": "350",
          "scope": "full"
        },
        "structure": {
          "discipline": "structure",
          "lod": "300",
          "scope": "full"
        },
        "mepf": {
          "discipline": "mepf",
          "lod": "300",
          "scope": "interior"
        }
      }
    }
  ],
  
  "risks": ["occupied"],
  
  "dispatchLocation": "brooklyn",
  "distance": 5,
  
  "services": {
    "matterport": true,
    "actScan": true,
    "additionalElevations": 6
  },
  
  "paymentTerms": "net45"
}
```

### Lead Information
| Field | Value |
|-------|-------|
| Company Name | Woolworth Building Management |
| Contact First Name | Alexander |
| Contact Last Name | Thompson |
| Contact Email | athompson@woolworthbldg.com |
| Contact Phone | (212) 555-0606 |

### Expected Validation
- **Tier:** 20k-30k sqft (or 30k-50k)
- **Building Type:** Commercial/Office
- **LoD:** High detail (350 Arch) for ornate historic office
- **Travel:** ~5 miles from Brooklyn (local)
- **Risk:** Occupied (+15%)
- **Services:** Matterport + ACT Scan + 6 elevations (iconic facade)

---

## Job 7: Cold Storage - Reflective/Metallic Environments

**Test Focus:** Industrial facility with specialized thermal zones. Tests mapping in highly reflective/metallic areas.

### Full API Payload
```json
{
  "clientName": "Taunton Cold Storage Inc",
  "projectName": "Cold Storage Facility BIM",
  "projectAddress": "425 John Quincy Adams Rd, Taunton, MA 02780",
  
  "areas": [
    {
      "name": "Cold Storage Facility",
      "buildingType": "11",
      "squareFeet": "85000",
      "disciplines": ["architecture", "mepf"],
      "disciplineLods": {
        "architecture": {
          "discipline": "architecture",
          "lod": "200",
          "scope": "interior"
        },
        "mepf": {
          "discipline": "mepf",
          "lod": "350",
          "scope": "full"
        }
      }
    }
  ],
  
  "risks": ["hazardous", "no_power"],
  
  "dispatchLocation": "troy",
  "distance": 200,
  
  "services": {
    "matterport": false,
    "actScan": false,
    "additionalElevations": 0
  },
  
  "paymentTerms": "net30"
}
```

### Lead Information
| Field | Value |
|-------|-------|
| Company Name | Taunton Cold Storage Inc |
| Contact First Name | Robert |
| Contact Last Name | Kelly |
| Contact Email | rkelly@tauntoncold.com |
| Contact Phone | (508) 555-0707 |

### Expected Validation
- **Tier:** 75k-100k sqft
- **Building Type:** Warehouse/Storage
- **LoD:** High MEPF (350) for refrigeration systems, low Arch (200)
- **Travel:** ~200 miles from Troy to Taunton, MA
- **Risk:** Hazardous (+25%) + No Power (+20%) = +45%

---

## Job 8: Multi-Unit High-Rise - Repetitive Corridors

**Test Focus:** Large apartment complex (Presidential City). Tests repetitive corridor and unit-stacking logic.

### Full API Payload
```json
{
  "clientName": "Presidential City Partners",
  "projectName": "Presidential City Tower Survey",
  "projectAddress": "3900 City Ave, Philadelphia, PA 19131",
  
  "areas": [
    {
      "name": "Residential Tower",
      "buildingType": "2",
      "squareFeet": "120000",
      "disciplines": ["architecture", "mepf", "structure"],
      "disciplineLods": {
        "architecture": {
          "discipline": "architecture",
          "lod": "300",
          "scope": "full"
        },
        "mepf": {
          "discipline": "mepf",
          "lod": "300",
          "scope": "full"
        },
        "structure": {
          "discipline": "structure",
          "lod": "200",
          "scope": "full"
        }
      }
    }
  ],
  
  "risks": ["occupied"],
  
  "dispatchLocation": "brooklyn",
  "distance": 100,
  
  "services": {
    "matterport": false,
    "actScan": true,
    "additionalElevations": 4
  },
  
  "paymentTerms": "net60"
}
```

### Lead Information
| Field | Value |
|-------|-------|
| Company Name | Presidential City Partners |
| Contact First Name | David |
| Contact Last Name | Washington |
| Contact Email | dwashington@presidentialcity.com |
| Contact Phone | (215) 555-0808 |

### Expected Validation
- **Tier:** 100k-150k sqft
- **Building Type:** Residential - Multi Family
- **Travel:** ~100 miles from Brooklyn to Philadelphia
- **Risk:** Occupied (+15%)
- **Services:** ACT Scan + 4 elevations

---

## Job 9: Performing Arts Center - Non-Linear Walls

**Test Focus:** Complex theater seating and curved acoustics. Tests the AI's ability to handle non-linear walls.

### Full API Payload
```json
{
  "clientName": "Tobin Center for the Performing Arts",
  "projectName": "Tobin Center Full BIM",
  "projectAddress": "100 Auditorium Cir, San Antonio, TX 78205",
  
  "areas": [
    {
      "name": "Main Theater Complex",
      "buildingType": "8",
      "squareFeet": "175000",
      "disciplines": ["architecture", "structure", "mepf", "site"],
      "disciplineLods": {
        "architecture": {
          "discipline": "architecture",
          "lod": "350",
          "scope": "full"
        },
        "structure": {
          "discipline": "structure",
          "lod": "300",
          "scope": "full"
        },
        "mepf": {
          "discipline": "mepf",
          "lod": "350",
          "scope": "full"
        },
        "site": {
          "discipline": "site",
          "lod": "200",
          "scope": "full"
        }
      }
    }
  ],
  
  "risks": ["occupied"],
  
  "dispatchLocation": "troy",
  "distance": 0,
  "customTravelCost": 8500,
  
  "services": {
    "matterport": true,
    "actScan": true,
    "additionalElevations": 6
  },
  
  "paymentTerms": "net45"
}
```

### Lead Information
| Field | Value |
|-------|-------|
| Company Name | Tobin Center for the Performing Arts |
| Contact First Name | Maria |
| Contact Last Name | Rodriguez |
| Contact Email | mrodriguez@tobincenter.org |
| Contact Phone | (210) 555-0909 |

### Expected Validation
- **Tier:** 150k+ sqft
- **Building Type:** Hotel/Theatre/Museum (performing arts premium)
- **LoD:** Maximum detail (350) for curved acoustics/architecture
- **Travel:** Flyout to San Antonio (customTravelCost = $8,500)
- **Risk:** Occupied (+15%)
- **Services:** All services enabled

---

## Job 10: Industrial/Lab - Cluttered Environment

**Test Focus:** Heavy industrial inspection facility. Tests "cluttered" environments with machinery and pipes.

### Full API Payload
```json
{
  "clientName": "Clark Avenue Industrial",
  "projectName": "Industrial Lab BIM Documentation",
  "projectAddress": "2810 Clark Ave, St. Louis, MO 63103",
  
  "areas": [
    {
      "name": "Inspection Facility",
      "buildingType": "10",
      "squareFeet": "12000",
      "disciplines": ["architecture", "mepf", "structure"],
      "disciplineLods": {
        "architecture": {
          "discipline": "architecture",
          "lod": "200",
          "scope": "interior"
        },
        "mepf": {
          "discipline": "mepf",
          "lod": "350",
          "scope": "full"
        },
        "structure": {
          "discipline": "structure",
          "lod": "300",
          "scope": "full"
        }
      }
    }
  ],
  
  "risks": ["hazardous", "no_power"],
  
  "dispatchLocation": "troy",
  "distance": 0,
  "customTravelCost": 4500,
  
  "services": {
    "matterport": false,
    "actScan": false,
    "additionalElevations": 0
  },
  
  "paymentTerms": "net30"
}
```

### Lead Information
| Field | Value |
|-------|-------|
| Company Name | Clark Avenue Industrial |
| Contact First Name | Michael |
| Contact Last Name | Johnson |
| Contact Email | mjohnson@clarkaveindustrial.com |
| Contact Phone | (314) 555-1010 |

### Expected Validation
- **Tier:** 10k-20k sqft
- **Building Type:** Mechanical/Utility Rooms
- **LoD:** High MEPF (350) for pipes/machinery, low Arch (200)
- **Travel:** Flyout to St. Louis (customTravelCost = $4,500)
- **Risk:** Hazardous (+25%) + No Power (+20%) = +45%

---

## Geographic Coverage Summary

### Local (Brooklyn dispatch, <20 miles)
- Job 2: 255 Greenwich St, NYC (~5 mi)
- Job 5: 69 Mercer St, NYC (~3 mi)
- Job 6: 233 Broadway, NYC (~5 mi)

### Regional (Brooklyn dispatch, 20-150 miles)
- Job 1: Purchase, NY (~35 mi)
- Job 3: Philadelphia, PA (~95 mi)
- Job 8: Philadelphia, PA (~100 mi)

### Regional (Troy dispatch, 150-250 miles)
- Job 4: Wilmington, MA (~180 mi)
- Job 7: Taunton, MA (~200 mi)

### Flyout
- Job 9: San Antonio, TX ($8,500 travel)
- Job 10: St. Louis, MO ($4,500 travel)

---

## Building Type Coverage

| CPQ Type | Count | Jobs |
|----------|-------|------|
| 2 - Multi Family | 1 | Job 8 |
| 3 - Luxury | 1 | Job 1 |
| 4 - Commercial/Office | 2 | Jobs 2, 6 |
| 5 - Retail | 1 | Job 5 |
| 8 - Hotel/Theatre/Museum | 2 | Jobs 3, 9 |
| 10 - Mechanical/Utility | 1 | Job 10 |
| 11 - Warehouse/Storage | 2 | Jobs 4, 7 |

---

## Risk Factor Coverage

| Risk Combination | Jobs |
|------------------|------|
| Occupied only | Jobs 1, 2, 5, 6, 8, 9 |
| Occupied + Hazardous | Job 4 |
| Hazardous + No Power | Jobs 7, 10 |
| None | Job 3 |

---

*Document Version: 1.0*  
*Last Updated: January 2026*  
*Based on real property addresses for accurate travel/mapping testing*

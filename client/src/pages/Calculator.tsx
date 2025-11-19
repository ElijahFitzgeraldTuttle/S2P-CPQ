import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Quote } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, Save, Download, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ProjectDetailsForm from "@/components/ProjectDetailsForm";
import AreaInput from "@/components/AreaInput";
import DisciplineSelector from "@/components/DisciplineSelector";
import RiskFactors from "@/components/RiskFactors";
import TravelCalculator from "@/components/TravelCalculator";
import AdditionalServices from "@/components/AdditionalServices";
import PricingSummary from "@/components/PricingSummary";
import QuoteFields from "@/components/QuoteFields";
import ScopeFields from "@/components/ScopeFields";
import CRMFields from "@/components/CRMFields";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Area {
  id: string;
  name: string;
  buildingType: string;
  squareFeet: string;
  scope: string;
  disciplines: string[];
  disciplineLods: Record<string, string>;
  gradeAroundBuilding: boolean;
  gradeLod: string;
}

interface PricingLineItem {
  label: string;
  value: number;
  editable?: boolean;
  isDiscount?: boolean;
  isTotal?: boolean;
}

export default function Calculator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [, params] = useRoute("/calculator/:id");
  const quoteId = params?.id;

  const { data: existingQuote, isLoading: isLoadingQuote } = useQuery<Quote>({
    queryKey: ["/api", "quotes", quoteId],
    enabled: !!quoteId,
  });

  const [scopingMode] = useState(true);
  const [projectDetails, setProjectDetails] = useState({
    clientName: "",
    projectName: "",
    projectAddress: "",
    specificBuilding: "",
    typeOfBuilding: "",
    hasBasement: false,
    hasAttic: false,
    notes: "",
  });
  const [areas, setAreas] = useState<Area[]>([
    { id: "1", name: "", buildingType: "", squareFeet: "", scope: "full", disciplines: [], disciplineLods: {}, gradeAroundBuilding: false, gradeLod: "300" },
  ]);
  const [risks, setRisks] = useState<string[]>([]);
  const [dispatch, setDispatch] = useState("troy");
  const [distance, setDistance] = useState<number | null>(null);
  const [distanceCalculated, setDistanceCalculated] = useState(false);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [services, setServices] = useState<Record<string, number>>({});
  const [scopingData, setScopingData] = useState({
    gradeAroundBuilding: "",
    gradeOther: "",
    interiorCadElevations: "",
    aboveBelowACT: "",
    aboveBelowACTOther: "",
    actSqft: "",
    bimDeliverable: [] as string[],
    bimDeliverableOther: "",
    bimVersion: "",
    customTemplate: "",
    customTemplateOther: "",
    customTemplateFiles: [] as any[],
    sqftAssumptions: "",
    sqftAssumptionsFiles: [] as any[],
    assumedGrossMargin: "",
    caveatsProfitability: "",
    projectNotes: "",
    scopingDocuments: [] as any[],
    mixedScope: "",
    insuranceRequirements: "",
    tierAScanningCost: "",
    tierAScanningCostOther: "",
    tierAModelingCost: "",
    tierAMargin: "",
    estimatedTimeline: "",
    timelineOther: "",
    timelineNotes: "",
    paymentTerms: "",
    paymentTermsOther: "",
    paymentNotes: "",
    accountContact: "",
    designProContact: "",
    designProCompanyContact: "",
    otherContact: "",
    proofLinks: "",
    ndaFiles: [] as any[],
    source: "",
    sourceNote: "",
    assist: "",
    probabilityOfClosing: "50",
    projectStatus: "",
    projectStatusOther: "",
  });

  const handleProjectDetailChange = (field: string, value: string | boolean) => {
    setProjectDetails((prev) => ({ ...prev, [field]: value }));
    if (field === "projectAddress" && typeof value === "string") {
      setTimeout(() => setDistance(125), 1000);
    }
  };

  const handleAreaChange = (id: string, field: keyof Area, value: string | boolean) => {
    setAreas((prev) =>
      prev.map((area) => {
        if (area.id !== id) return area;
        
        const updatedArea = { ...area, [field]: value };
        
        if (field === "buildingType" && typeof value === "string") {
          const isLandscape = value === "14" || value === "15";
          const isACT = value === "16";
          
          if (isLandscape) {
            updatedArea.disciplines = ["site"];
            updatedArea.disciplineLods = { site: updatedArea.disciplineLods.site || "300" };
          } else if (isACT) {
            updatedArea.disciplines = ["mepf"];
            updatedArea.disciplineLods = { mepf: updatedArea.disciplineLods.mepf || "300" };
          }
        }
        
        return updatedArea;
      })
    );
  };

  const addArea = () => {
    setAreas((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", buildingType: "", squareFeet: "", scope: "full", disciplines: [], disciplineLods: {}, gradeAroundBuilding: false, gradeLod: "300" },
    ]);
  };

  const removeArea = (id: string) => {
    setAreas((prev) => prev.filter((area) => area.id !== id));
  };

  const handleAreaDisciplineChange = (areaId: string, disciplineId: string, checked: boolean) => {
    setAreas((prev) =>
      prev.map((area) => {
        if (area.id !== areaId) return area;
        
        const newDisciplines = checked
          ? [...area.disciplines, disciplineId]
          : area.disciplines.filter((d) => d !== disciplineId);
        
        const newLods = { ...area.disciplineLods };
        if (checked && !newLods[disciplineId]) {
          newLods[disciplineId] = "300";
        }
        
        return { ...area, disciplines: newDisciplines, disciplineLods: newLods };
      })
    );
  };

  const handleAreaLodChange = (areaId: string, disciplineId: string, value: string) => {
    setAreas((prev) =>
      prev.map((area) => {
        if (area.id !== areaId) return area;
        return {
          ...area,
          disciplineLods: { ...area.disciplineLods, [disciplineId]: value },
        };
      })
    );
  };

  const handleScopingDataChange = (field: string, value: string) => {
    setScopingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRiskChange = (riskId: string, checked: boolean) => {
    setRisks((prev) =>
      checked ? [...prev, riskId] : prev.filter((r) => r !== riskId)
    );
  };

  const handleServiceChange = (serviceId: string, quantity: number) => {
    setServices((prev) => ({ ...prev, [serviceId]: quantity }));
  };

  const handleCalculateDistance = async () => {
    if (!projectDetails.projectAddress || !dispatch) {
      toast({
        title: "Missing information",
        description: "Please enter both a dispatch location and project address",
        variant: "destructive",
      });
      return;
    }

    setIsCalculatingDistance(true);
    try {
      const response = await apiRequest("POST", "/api/calculate-distance", {
        origin: dispatch,
        destination: projectDetails.projectAddress,
      });
      const data = await response.json();
      setDistance(data.distance);
      setDistanceCalculated(true);
      toast({
        title: "Distance calculated",
        description: `${data.distance} miles from ${dispatch} to project location`,
      });
    } catch (error) {
      setDistanceCalculated(false);
      toast({
        title: "Error calculating distance",
        description: "Could not calculate distance. Please check the address and try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  useEffect(() => {
    if (existingQuote) {
      setProjectDetails({
        clientName: existingQuote.clientName || "",
        projectName: existingQuote.projectName,
        projectAddress: existingQuote.projectAddress,
        specificBuilding: existingQuote.specificBuilding || "",
        typeOfBuilding: existingQuote.typeOfBuilding,
        hasBasement: existingQuote.hasBasement ?? false,
        hasAttic: existingQuote.hasAttic ?? false,
        notes: existingQuote.notes || "",
      });
      setAreas(existingQuote.areas as Area[]);
      setRisks(existingQuote.risks as string[]);
      setDispatch(existingQuote.dispatchLocation);
      setDistance(existingQuote.distance);
      setDistanceCalculated(existingQuote.distance !== null && existingQuote.distance !== undefined);
      setServices(existingQuote.services as Record<string, number>);
      
      const legacyPaymentTerms = (existingQuote as any).paymentTerms;
      
      if (existingQuote.scopingData) {
        const loadedScopingData = { ...(existingQuote.scopingData as any) };
        if (legacyPaymentTerms && !loadedScopingData.paymentTerms) {
          loadedScopingData.paymentTerms = legacyPaymentTerms;
        }
        setScopingData(loadedScopingData);
      } else if (legacyPaymentTerms) {
        setScopingData(prev => ({
          ...prev,
          paymentTerms: legacyPaymentTerms
        }));
      }
    }
  }, [existingQuote]);

  const saveQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      if (quoteId) {
        const res = await apiRequest("PATCH", `/api/quotes/${quoteId}`, quoteData);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/quotes", quoteData);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api", "quotes"] });
      toast({
        title: quoteId ? "Quote updated successfully" : "Quote saved successfully",
        description: quoteId ? "Your changes have been saved." : "Your quote has been saved.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: quoteId ? "Error updating quote" : "Error saving quote",
        description: error.message || "Failed to save quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveQuote = () => {
    const totalItem = pricingItems.find(item => item.isTotal);
    const totalPrice = totalItem ? totalItem.value.toFixed(2) : "0.00";
    
    const quoteData = {
      projectName: projectDetails.projectName,
      clientName: projectDetails.clientName,
      projectAddress: projectDetails.projectAddress,
      specificBuilding: projectDetails.specificBuilding,
      typeOfBuilding: projectDetails.typeOfBuilding,
      hasBasement: projectDetails.hasBasement,
      hasAttic: projectDetails.hasAttic,
      notes: projectDetails.notes,
      scopingMode,
      areas,
      risks,
      dispatchLocation: dispatch,
      distance,
      services,
      scopingData: scopingMode ? scopingData : null,
      totalPrice,
      pricingBreakdown: {},
    };
    
    saveQuoteMutation.mutate(quoteData);
  };

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatScopeData = () => {
    const buildingTypeMap: Record<string, string> = {
      "1": "Commercial - Simple",
      "2": "Residential - Standard",
      "3": "Residential - Luxury",
      "4": "Commercial / Office",
      "5": "Retail / Restaurants",
      "6": "Kitchen / Catering Facilities",
      "7": "Education",
      "8": "Hotel / Theatre / Museum",
      "9": "Hospitals / Mixed Use",
      "10": "Mechanical / Utility Rooms",
      "11": "Warehouse / Storage",
      "12": "Religious Buildings",
      "13": "Infrastructure / Roads / Bridges",
      "14": "Built Landscape",
      "15": "Natural Landscape",
      "16": "ACT (Above/Below Acoustic Ceiling Tiles) [rate pending]",
    };

    const disciplineMap: Record<string, string> = {
      "architecture": "Architecture",
      "structure": "Structure",
      "mepf": "MEPF",
      "site": "Site/Topography",
    };

    const scopeMap: Record<string, string> = {
      "full": "Full Building",
      "interior": "Interior Only",
      "exterior": "Exterior Only",
      "roof": "Roof/Facades Only",
    };

    let text = "============================\n";
    text += "SCOPING DETAILS\n";
    text += "============================\n\n";

    text += "PROJECT INFORMATION\n";
    text += "----------------------------\n";
    text += `Client: ${projectDetails.clientName || "N/A"}\n`;
    text += `Project: ${projectDetails.projectName || "N/A"}\n`;
    text += `Address: ${projectDetails.projectAddress || "N/A"}\n`;
    text += `Specific Building: ${projectDetails.specificBuilding || "N/A"}\n`;
    text += `Type of Building: ${projectDetails.typeOfBuilding || "N/A"}\n`;
    text += `Has Basement: ${projectDetails.hasBasement ? "Yes" : "No"}\n`;
    text += `Has Attic: ${projectDetails.hasAttic ? "Yes" : "No"}\n`;
    if (projectDetails.notes) {
      text += `Notes: ${projectDetails.notes}\n`;
    }
    text += "\n";

    if (areas.length > 0) {
      text += "AREAS\n";
      text += "----------------------------\n";
      areas.forEach((area, index) => {
        const isLandscape = area.buildingType === "14" || area.buildingType === "15";
        const buildingTypeLabel = buildingTypeMap[area.buildingType] || area.buildingType;
        const scopeLabel = scopeMap[area.scope] || area.scope;
        
        text += `Area ${index + 1}:\n`;
        text += `  Name: ${area.name || "N/A"}\n`;
        text += `  Building Type: ${buildingTypeLabel}\n`;
        if (isLandscape) {
          const acres = parseFloat(area.squareFeet) || 0;
          const sqft = acres * 43560;
          text += `  Area: ${acres} acres (${sqft.toLocaleString()} sqft)\n`;
        } else {
          text += `  Square Feet: ${area.squareFeet || "N/A"}\n`;
        }
        text += `  Scope: ${scopeLabel}\n`;
        
        const disciplineLabels = area.disciplines.map(d => disciplineMap[d] || d);
        text += `  Disciplines: ${disciplineLabels.join(", ") || "None"}\n`;
        
        Object.entries(area.disciplineLods).forEach(([disc, lod]) => {
          const discLabel = disciplineMap[disc] || disc;
          text += `    ${discLabel}: LOD ${lod}\n`;
        });
        
        if (area.gradeAroundBuilding) {
          text += `  Grade Around Building (~20' topography): Yes\n`;
          text += `    LOD: ${area.gradeLod || "300"}\n`;
        }
        
        text += "\n";
      });
    }

    text += "SITE & LANDSCAPE\n";
    text += "----------------------------\n";
    if (scopingData.gradeAroundBuilding) {
      text += `Grade Around Building: ${scopingData.gradeAroundBuilding}\n`;
      if (scopingData.gradeAroundBuilding === "other" && scopingData.gradeOther) {
        text += `  Other: ${scopingData.gradeOther}\n`;
      }
    }
    text += "\n";

    text += "DELIVERABLES\n";
    text += "----------------------------\n";
    if (scopingData.interiorCadElevations) {
      text += `Interior CAD Elevations: ${scopingData.interiorCadElevations}\n`;
    }
    if (scopingData.bimDeliverable && scopingData.bimDeliverable.length > 0) {
      text += `BIM Deliverable: ${scopingData.bimDeliverable.join(", ")}\n`;
      if (scopingData.bimDeliverable.includes("Other") && scopingData.bimDeliverableOther) {
        text += `  Other: ${scopingData.bimDeliverableOther}\n`;
      }
    }
    if (scopingData.bimVersion) {
      text += `BIM Version: ${scopingData.bimVersion}\n`;
    }
    if (scopingData.customTemplate) {
      text += `Custom Template: ${scopingData.customTemplate}\n`;
      if (scopingData.customTemplate === "other" && scopingData.customTemplateOther) {
        text += `  Other: ${scopingData.customTemplateOther}\n`;
      }
    }
    text += "\n";

    text += "ASSUMPTIONS\n";
    text += "----------------------------\n";
    if (scopingData.sqftAssumptions) {
      text += `SQFT Assumptions: ${scopingData.sqftAssumptions}\n`;
    }
    if (scopingData.assumedGrossMargin) {
      text += `Assumed Gross Margin: ${scopingData.assumedGrossMargin}\n`;
    }
    if (scopingData.caveatsProfitability) {
      text += `Caveats/Profitability: ${scopingData.caveatsProfitability}\n`;
    }
    if (scopingData.projectNotes) {
      text += `Project Notes: ${scopingData.projectNotes}\n`;
    }
    if (scopingData.mixedScope) {
      text += `Mixed Scope: ${scopingData.mixedScope}\n`;
    }
    if (scopingData.insuranceRequirements) {
      text += `Insurance Requirements: ${scopingData.insuranceRequirements}\n`;
    }
    text += "\n";

    text += "CONTACTS\n";
    text += "----------------------------\n";
    if (scopingData.accountContact) {
      text += `Account Contact: ${scopingData.accountContact}\n`;
    }
    if (scopingData.designProContact) {
      text += `Design Pro Contact: ${scopingData.designProContact}\n`;
    }
    if (scopingData.designProCompanyContact) {
      text += `Design Pro Company Contact: ${scopingData.designProCompanyContact}\n`;
    }
    if (scopingData.otherContact) {
      text += `Other Contact: ${scopingData.otherContact}\n`;
    }
    text += "\n";

    text += "RISK FACTORS\n";
    text += "----------------------------\n";
    if (risks.length > 0) {
      const riskMap: Record<string, { label: string; premium: number }> = {
        "flood": { label: "Flood", premium: 7 },
        "occupied": { label: "Occupied", premium: 15 },
        "hazardous": { label: "Hazardous", premium: 25 },
        "noPower": { label: "No Power", premium: 20 },
      };
      
      risks.forEach(risk => {
        const riskInfo = riskMap[risk] || { 
          label: risk.charAt(0).toUpperCase() + risk.slice(1).replace(/([A-Z])/g, ' $1'), 
          premium: 7 
        };
        text += `${riskInfo.label}: +${riskInfo.premium}% premium on Architecture base\n`;
      });
    } else {
      text += `No risk factors selected\n`;
    }
    text += "\n";

    text += "TRAVEL & DISPATCH\n";
    text += "----------------------------\n";
    const dispatchMap: Record<string, string> = {
      "troy": "Troy, NY",
      "woodstock": "Woodstock, NY",
      "brooklyn": "Brooklyn, NY",
    };
    const dispatchLabel = dispatchMap[dispatch] || dispatch;
    text += `Dispatch Location: ${dispatchLabel}\n`;
    if (distanceCalculated && distance !== null) {
      const ratePerMile = dispatch === "brooklyn" ? 4 : 3;
      text += `Distance: ${distance} miles\n`;
      text += `Travel Rate: $${ratePerMile}.00 per mile\n`;
      const totalSqft = areas.reduce((sum, area) => {
        const isLandscape = area.buildingType === "14" || area.buildingType === "15";
        const inputValue = parseInt(area.squareFeet) || 0;
        return sum + (isLandscape ? inputValue * 43560 : inputValue);
      }, 0);
      const estimatedScanDays = Math.ceil(totalSqft / 10000);
      text += `Estimated Scan Days: ${estimatedScanDays}\n`;
      if (distance > 75 && estimatedScanDays >= 2) {
        text += `Scan-Day Surcharge: $300 per day (applies when distance > 75 miles and scan days >= 2)\n`;
      } else {
        text += `Scan-Day Surcharge: Not applicable (${distance <= 75 ? 'distance ≤ 75 miles' : 'scan days < 2'})\n`;
      }
    } else {
      text += `Distance: Not calculated\n`;
    }
    text += "\n";

    text += "ADDITIONAL SERVICES\n";
    text += "----------------------------\n";
    const servicesEntries = Object.entries(services).filter(([_, qty]) => qty > 0);
    if (servicesEntries.length > 0) {
      servicesEntries.forEach(([serviceId, quantity]) => {
        if (serviceId === "georeferencing") {
          text += `Georeferencing: $1,000.00 flat rate per building or site\n`;
        } else if (serviceId === "cadDeliverable") {
          const total = Math.max(quantity * 300, 300);
          text += `CAD Deliverable (PDF & DWG): ${quantity} set${quantity > 1 ? 's' : ''} @ $300 per set (minimum $300) = $${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
        } else if (serviceId === "matterport") {
          const total = quantity * 0.10;
          text += `Matterport Virtual Tours: ${quantity.toLocaleString()} sqft @ $0.10 per sqft = $${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
        } else if (serviceId === "expeditedService") {
          text += `Expedited Service: +20% of total (calculated in quote)\n`;
        } else if (serviceId === "actSqft") {
          const total = quantity * 5.00;
          text += `Scope of ACT: ${quantity.toLocaleString()} sqft @ $5.00 per sqft = $${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
        } else if (serviceId === "scanningFullDay") {
          text += `Scanning & Registration - Full Day (up to 10 hrs on-site): $2,500.00\n`;
        } else if (serviceId === "scanningHalfDay") {
          text += `Scanning & Registration - Half Day (up to 4 hrs on-site): $1,500.00\n`;
        } else {
          const serviceName = serviceId.charAt(0).toUpperCase() + serviceId.slice(1).replace(/([A-Z])/g, ' $1');
          text += `${serviceName}: ${quantity} unit${quantity > 1 ? 's' : ''} (rate not specified)\n`;
        }
      });
    } else {
      text += `No additional services selected\n`;
    }
    text += "\n";

    text += "TIMELINE & PAYMENT\n";
    text += "----------------------------\n";
    if (scopingData.estimatedTimeline) {
      text += `Estimated Timeline: ${scopingData.estimatedTimeline}\n`;
    }
    if (scopingData.timelineNotes) {
      text += `Timeline Notes: ${scopingData.timelineNotes}\n`;
    }
    if (scopingData.paymentTerms) {
      text += `Payment Terms: ${scopingData.paymentTerms}\n`;
      if (scopingData.paymentTerms === "other" && scopingData.paymentTermsOther) {
        text += `  Other: ${scopingData.paymentTermsOther}\n`;
      }
    }
    if (scopingData.paymentNotes) {
      text += `Payment Notes: ${scopingData.paymentNotes}\n`;
    }
    text += "\n";

    return text;
  };

  const formatQuoteDataInternal = () => {
    let text = "============================\n";
    text += "QUOTE - INTERNAL\n";
    text += "============================\n\n";

    text += `Quote #: ${existingQuote?.quoteNumber || "Draft"}\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n\n`;

    text += "PROJECT INFORMATION\n";
    text += "----------------------------\n";
    text += `Client: ${projectDetails.clientName || "N/A"}\n`;
    text += `Project: ${projectDetails.projectName || "N/A"}\n`;
    text += `Address: ${projectDetails.projectAddress || "N/A"}\n`;
    text += `Building Type: ${projectDetails.typeOfBuilding || "N/A"}\n\n`;

    text += "PRICING BREAKDOWN\n";
    text += "----------------------------\n";
    pricingItems.forEach(item => {
      const amount = `$${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      text += `${item.label.padEnd(60)} ${amount.padStart(15)}\n`;
    });

    if (projectDetails.notes) {
      text += "\nNOTES\n";
      text += "----------------------------\n";
      text += `${projectDetails.notes}\n`;
    }

    return text;
  };

  const formatQuoteDataClient = () => {
    let text = "============================\n";
    text += "QUOTE\n";
    text += "============================\n\n";

    text += `Quote #: ${existingQuote?.quoteNumber || "Draft"}\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n\n`;

    text += "PROJECT INFORMATION\n";
    text += "----------------------------\n";
    text += `Client: ${projectDetails.clientName || "N/A"}\n`;
    text += `Project: ${projectDetails.projectName || "N/A"}\n`;
    text += `Address: ${projectDetails.projectAddress || "N/A"}\n`;
    text += `Building Type: ${projectDetails.typeOfBuilding || "N/A"}\n\n`;

    const grandTotalItem = pricingItems.find(item => item.isTotal);
    const effectivePriceItem = pricingItems.find(item => item.label.includes("Effective Price"));
    
    text += "PRICING SUMMARY\n";
    text += "----------------------------\n";
    if (grandTotalItem) {
      const amount = `$${grandTotalItem.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      text += `Grand Total: ${amount}\n`;
    }
    if (effectivePriceItem) {
      const amount = `$${effectivePriceItem.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      text += `${effectivePriceItem.label}: ${amount}\n`;
    }

    if (projectDetails.notes) {
      text += "\nNOTES\n";
      text += "----------------------------\n";
      text += `${projectDetails.notes}\n`;
    }

    return text;
  };

  const formatCRMData = () => {
    let text = "============================\n";
    text += "CRM DATA\n";
    text += "============================\n\n";

    text += `Quote #: ${existingQuote?.quoteNumber || "Draft"}\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n\n`;

    text += "PROJECT INFORMATION\n";
    text += "----------------------------\n";
    text += `Client: ${projectDetails.clientName || "N/A"}\n`;
    text += `Project: ${projectDetails.projectName || "N/A"}\n\n`;

    text += "LEAD TRACKING\n";
    text += "----------------------------\n";
    if (scopingData.source) {
      text += `Source: ${scopingData.source}\n`;
      if (scopingData.sourceNote) {
        text += `  Note: ${scopingData.sourceNote}\n`;
      }
    }
    if (scopingData.assist) {
      text += `Assist: ${scopingData.assist}\n`;
    }
    if (scopingData.probabilityOfClosing) {
      text += `Probability of Closing: ${scopingData.probabilityOfClosing}%\n`;
    }
    if (scopingData.projectStatus) {
      text += `Project Status: ${scopingData.projectStatus}\n`;
      if (scopingData.projectStatus === "other" && scopingData.projectStatusOther) {
        text += `  Other: ${scopingData.projectStatusOther}\n`;
      }
    }
    text += "\n";

    text += "TIER A PRICING\n";
    text += "----------------------------\n";
    if (scopingData.tierAScanningCost) {
      text += `Tier A Scanning Cost: ${scopingData.tierAScanningCost}\n`;
      if (scopingData.tierAScanningCost === "other" && scopingData.tierAScanningCostOther) {
        text += `  Other: ${scopingData.tierAScanningCostOther}\n`;
      }
    }
    if (scopingData.tierAModelingCost) {
      text += `Tier A Modeling Cost: ${scopingData.tierAModelingCost}\n`;
    }
    if (scopingData.tierAMargin) {
      text += `Tier A Margin: ${scopingData.tierAMargin}\n`;
    }
    text += "\n";

    if (scopingData.proofLinks) {
      text += "PROOF LINKS\n";
      text += "----------------------------\n";
      text += `${scopingData.proofLinks}\n\n`;
    }

    return text;
  };

  const exportScopeOnly = () => {
    const content = formatScopeData();
    downloadTextFile(content, `scope-${projectDetails.projectName || "draft"}-${Date.now()}.txt`);
    toast({
      title: "Scope exported",
      description: "Scope data has been downloaded as text file",
    });
  };

  const exportScopeQuoteClient = () => {
    let content = formatScopeData();
    content += "\n\n";
    content += formatQuoteDataClient();
    downloadTextFile(content, `scope-quote-client-${projectDetails.projectName || "draft"}-${Date.now()}.txt`);
    toast({
      title: "Scope + Quote exported",
      description: "Scope and quote (client version) downloaded as text file",
    });
  };

  const exportScopeQuoteInternal = () => {
    let content = formatScopeData();
    content += "\n\n";
    content += formatQuoteDataInternal();
    downloadTextFile(content, `scope-quote-internal-${projectDetails.projectName || "draft"}-${Date.now()}.txt`);
    toast({
      title: "Scope + Quote exported",
      description: "Scope and quote (internal version) downloaded as text file",
    });
  };

  const exportQuoteClient = () => {
    const content = formatQuoteDataClient();
    downloadTextFile(content, `quote-client-${projectDetails.projectName || "draft"}-${Date.now()}.txt`);
    toast({
      title: "Quote exported",
      description: "Quote (client version) has been downloaded as text file",
    });
  };

  const exportQuoteInternal = () => {
    const content = formatQuoteDataInternal();
    downloadTextFile(content, `quote-internal-${projectDetails.projectName || "draft"}-${Date.now()}.txt`);
    toast({
      title: "Quote exported",
      description: "Quote (internal version) has been downloaded as text file",
    });
  };

  const exportCRMOnly = () => {
    const content = formatCRMData();
    downloadTextFile(content, `crm-${projectDetails.projectName || "draft"}-${Date.now()}.txt`);
    toast({
      title: "CRM data exported",
      description: "CRM data has been downloaded as text file",
    });
  };

  const getLandscapePerAcreRate = (buildingType: string, acres: number, lod: string): number => {
    const builtLandscapeRates: Record<string, number[]> = {
      "200": [875, 625, 375, 250, 160],
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
    
    if (acres >= 100) return lodRates[4];
    if (acres >= 50) return lodRates[3];
    if (acres >= 20) return lodRates[2];
    if (acres >= 5) return lodRates[1];
    return lodRates[0];
  };

  const calculatePricing = () => {
    const items: PricingLineItem[] = [];
    let archBaseTotal = 0;
    let otherDisciplinesTotal = 0;
    let upteamCost = 0; // Track internal vendor costs
    
    // Upteam multipliers (simplified - eventually from pricing_parameters table)
    const UPTEAM_MULTIPLIER = 0.65; // Upteam costs are 65% of client rates

    areas.forEach((area) => {
      const isLandscape = area.buildingType === "14" || area.buildingType === "15";
      const isACT = area.buildingType === "16";
      const inputValue = isLandscape ? parseFloat(area.squareFeet) || 0 : parseInt(area.squareFeet) || 0;
      
      const scope = area.scope || "full";
      const disciplines = isLandscape ? ["site"] : isACT ? ["mepf"] : (area.disciplines.length > 0 ? area.disciplines : []);
      
      disciplines.forEach((discipline) => {
        const lod = area.disciplineLods[discipline] || "300";
        let lineTotal = 0;
        let areaLabel = "";
        
        if (isLandscape) {
          const acres = inputValue;
          const sqft = Math.round(acres * 43560);
          const perAcreRate = getLandscapePerAcreRate(area.buildingType, acres, lod);
          lineTotal = acres * perAcreRate;
          areaLabel = `${acres} acres (${sqft.toLocaleString()} sqft)`;
        } else if (isACT) {
          const sqft = Math.max(inputValue, 3000);
          lineTotal = sqft * 2.00;
          areaLabel = `${sqft.toLocaleString()} sqft`;
        } else {
          const sqft = Math.max(inputValue, 3000);
          
          let baseRatePerSqft = 2.50;
          if (discipline === "mepf") {
            baseRatePerSqft = 3.00;
          } else if (discipline === "structure") {
            baseRatePerSqft = 2.00;
          } else if (discipline === "site") {
            baseRatePerSqft = 1.50;
          }
          
          const lodMultiplier: Record<string, number> = {
            "200": 1.0,
            "300": 1.3,
            "350": 1.5,
          };
          
          const multiplier = lodMultiplier[lod] || 1.0;
          lineTotal = sqft * baseRatePerSqft * multiplier;
          areaLabel = `${sqft.toLocaleString()} sqft`;
        }
        
        let scopeDiscount = 0;
        let scopeLabel = "";
        if (!isLandscape && !isACT) {
          if (scope === "interior") {
            scopeDiscount = lineTotal * 0.25;
            scopeLabel = " (Interior Only -25%)";
          } else if (scope === "exterior") {
            scopeDiscount = lineTotal * 0.50;
            scopeLabel = " (Exterior Only -50%)";
          } else if (scope === "roof") {
            scopeDiscount = lineTotal * 0.65;
            scopeLabel = " (Roof/Facades Only -65%)";
          }
        }
        
        lineTotal -= scopeDiscount;
        
        // Track upteam internal cost (before scope discount since that's client-side discount)
        const upteamLineCost = (lineTotal + scopeDiscount) * UPTEAM_MULTIPLIER - scopeDiscount;
        upteamCost += upteamLineCost;
        
        if (discipline === "architecture") {
          archBaseTotal += lineTotal;
        } else {
          otherDisciplinesTotal += lineTotal;
        }
        
        items.push({
          label: `${discipline.charAt(0).toUpperCase() + discipline.slice(1)} (${areaLabel}, LOD ${lod})${scopeLabel}`,
          value: lineTotal,
          editable: true,
        });
      });
      
      // Grade Around Building pricing
      if (area.gradeAroundBuilding && !isLandscape && !isACT) {
        const sqft = Math.max(parseInt(area.squareFeet) || 0, 3000);
        const gradeLod = area.gradeLod || "300";
        
        const gradeRates: Record<string, number> = {
          "250": 0.54,
          "300": 0.72,
          "350": 0.90,
        };
        
        const ratePerSqft = gradeRates[gradeLod] || 0.72;
        const gradeTotal = sqft * ratePerSqft;
        
        otherDisciplinesTotal += gradeTotal;
        upteamCost += gradeTotal * UPTEAM_MULTIPLIER; // Track upteam cost for grade work
        
        items.push({
          label: `Grade Around Building (~20' topography) (${sqft.toLocaleString()} sqft, LOD ${gradeLod})`,
          value: gradeTotal,
          editable: true,
        });
      }
    });

    const baseSubtotal = archBaseTotal + otherDisciplinesTotal;
    
    if (baseSubtotal > 0) {
      items.push({
        label: "Base Subtotal",
        value: baseSubtotal,
        editable: false,
      });
    }

    let archAfterRisk = archBaseTotal;
    if (risks.length > 0) {
      risks.forEach((risk) => {
        let riskPercent = 0.15; // Default: Occupied
        if (risk === "hazardous") {
          riskPercent = 0.25;
        } else if (risk === "noPower") {
          riskPercent = 0.20;
        }
        
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

    if (distanceCalculated && distance && distance > 0) {
      const ratePerMile = dispatch === "brooklyn" ? 4 : 3;
      let travelCost = distance * ratePerMile;
      
      const totalSqft = areas.reduce((sum, area) => {
        const isLandscape = area.buildingType === "14" || area.buildingType === "15";
        const inputValue = parseInt(area.squareFeet) || 0;
        return sum + (isLandscape ? inputValue * 43560 : inputValue);
      }, 0);
      const estimatedScanDays = Math.ceil(totalSqft / 10000);
      
      if (distance > 75 && estimatedScanDays >= 2) {
        travelCost += 300 * estimatedScanDays;
      }
      
      items.push({
        label: `Travel (${distance} mi @ $${ratePerMile}/mi${distance > 75 && estimatedScanDays >= 2 ? ` + $${300 * estimatedScanDays} scan-day fee` : ''})`,
        value: travelCost,
        editable: true,
      });
      runningTotal += travelCost;
      upteamCost += travelCost; // Travel is a real cost
    }

    Object.entries(services).forEach(([serviceId, quantity]) => {
      if (quantity > 0) {
        const serviceRates: Record<string, number> = {
          georeferencing: 1000,
          cadDeliverable: 300,
          matterport: 0.10,
          expeditedService: 0,
          actSqft: 5,
          scanningFullDay: 2500,
          scanningHalfDay: 1500,
        };
        
        let total = 0;
        let label = "";
        
        if (serviceId === "matterport") {
          total = quantity * serviceRates[serviceId];
          label = `Matterport ($0.10/sqft × ${quantity.toLocaleString()} sqft)`;
          upteamCost += total * UPTEAM_MULTIPLIER; // Real service cost
        } else if (serviceId === "actSqft") {
          total = quantity * serviceRates[serviceId];
          label = `ACT Modeling ($5/sqft × ${quantity.toLocaleString()} sqft)`;
          upteamCost += total * UPTEAM_MULTIPLIER; // Real modeling cost
        } else if (serviceId === "georeferencing") {
          total = 1000;
          label = `Georeferencing`;
          upteamCost += total * UPTEAM_MULTIPLIER; // Real service cost
        } else if (serviceId === "cadDeliverable") {
          total = Math.max(quantity * serviceRates[serviceId], 300);
          label = `CAD Deliverable (${quantity} set${quantity > 1 ? 's' : ''}, $300 minimum)`;
          upteamCost += total * UPTEAM_MULTIPLIER; // Real CAD work cost
        } else if (serviceId === "scanningFullDay") {
          total = 2500;
          label = `Scanning & Registration - Full Day`;
          upteamCost += total * UPTEAM_MULTIPLIER; // Real scanning cost
        } else if (serviceId === "scanningHalfDay") {
          total = 1500;
          label = `Scanning & Registration - Half Day`;
          upteamCost += total * UPTEAM_MULTIPLIER; // Real scanning cost
        } else if (serviceId === "expeditedService") {
          total = runningTotal * 0.20;
          label = `Expedited Service (+20% of total)`;
          // Don't add to upteam - this is pure markup
        }
        
        if (total > 0) {
          items.push({
            label,
            value: total,
            editable: true,
          });
          runningTotal += total;
        }
      }
    });

    if (scopingData.paymentTerms) {
      let percentage = 0;
      if (scopingData.paymentTerms === "net30") percentage = 0.05;
      else if (scopingData.paymentTerms === "net60") percentage = 0.10;
      else if (scopingData.paymentTerms === "net90") percentage = 0.15;
      
      if (percentage > 0) {
        const paymentTermAdjustment = runningTotal * percentage;
        items.push({
          label: `Payment Terms Adjustment (+${Math.round(percentage * 100)}%)`,
          value: paymentTermAdjustment,
          editable: true,
        });
        runningTotal += paymentTermAdjustment;
      }
    }

    if (items.length > 0) {
      items.push({
        label: "Grand Total",
        value: runningTotal,
        editable: true,
        isTotal: true,
      });

      const totalSqft = areas.reduce((sum, area) => {
        const isLandscape = area.buildingType === "14" || area.buildingType === "15";
        const inputValue = parseInt(area.squareFeet) || 0;
        return sum + (isLandscape ? inputValue * 43560 : inputValue);
      }, 0);
      if (totalSqft > 0) {
        const effectivePricePerSqft = runningTotal / totalSqft;
        items.push({
          label: `Effective Price per Sq Ft (${totalSqft.toLocaleString()} sqft)`,
          value: effectivePricePerSqft,
          editable: false,
        });
      }
    }

    return { items, clientTotal: runningTotal, upteamCost };
  };

  const pricingData = calculatePricing();
  const pricingItems = pricingData.items;

  if (isLoadingQuote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading quote...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{quoteId ? "Edit Quote" : "Create Quote"}</h1>
          <p className="text-muted-foreground">
            Build a comprehensive pricing quote for your Scan-to-BIM project
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* QUOTE SECTION */}
            <div className="rounded-lg bg-blue-50/30 dark:bg-blue-950/10 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Quote</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Project Areas</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addArea}
                    data-testid="button-add-area"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Area
                  </Button>
                </div>
                {areas.map((area, index) => (
                  <AreaInput
                    key={area.id}
                    area={area}
                    index={index}
                    onChange={handleAreaChange}
                    onDisciplineChange={handleAreaDisciplineChange}
                    onLodChange={handleAreaLodChange}
                    onRemove={removeArea}
                    canRemove={areas.length > 1}
                  />
                ))}
              </div>

              <Separator />

              <RiskFactors selectedRisks={risks} onRiskChange={handleRiskChange} />

              <Separator />

              <TravelCalculator
                dispatchLocation={dispatch}
                projectAddress={projectDetails.projectAddress}
                distance={distance}
                isCalculating={isCalculatingDistance}
                onDispatchChange={setDispatch}
                onAddressChange={(val) => handleProjectDetailChange("projectAddress", val as string)}
                onCalculate={handleCalculateDistance}
              />

              <Separator />

              <AdditionalServices services={services} onServiceChange={handleServiceChange} />

              <Separator />

              <QuoteFields data={scopingData} onChange={handleScopingDataChange} />
            </div>

            {/* SCOPE SECTION */}
            <div className="rounded-lg bg-green-50/30 dark:bg-green-950/10 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">Scope</h2>
              
              <ProjectDetailsForm {...projectDetails} onFieldChange={handleProjectDetailChange} />

              <Separator />

              <ScopeFields data={scopingData} onChange={handleScopingDataChange} />
            </div>

            {/* CRM SECTION */}
            <div className="rounded-lg bg-amber-50/30 dark:bg-amber-950/10 p-6 space-y-6">
              <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100">CRM</h2>
              
              <CRMFields data={scopingData} onChange={handleScopingDataChange} />
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                size="lg" 
                className="flex-1" 
                data-testid="button-save-quote"
                onClick={handleSaveQuote}
                disabled={saveQuoteMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveQuoteMutation.isPending ? "Saving..." : "Save Quote"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" variant="outline" data-testid="button-export-menu">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportScopeOnly} data-testid="button-export-scope-only">
                    <FileText className="h-4 w-4 mr-2" />
                    Scope Only
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportScopeQuoteClient} data-testid="button-export-scope-quote-client">
                    <FileText className="h-4 w-4 mr-2" />
                    Scope + Quote (Client)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportScopeQuoteInternal} data-testid="button-export-scope-quote-internal">
                    <FileText className="h-4 w-4 mr-2" />
                    Scope + Quote (Internal)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportQuoteClient} data-testid="button-export-quote-client">
                    <FileText className="h-4 w-4 mr-2" />
                    Quote Only (Client)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportQuoteInternal} data-testid="button-export-quote-internal">
                    <FileText className="h-4 w-4 mr-2" />
                    Quote Only (Internal)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportCRMOnly} data-testid="button-export-crm-only">
                    <FileText className="h-4 w-4 mr-2" />
                    CRM Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="lg:col-span-1">
            <PricingSummary 
              items={pricingItems} 
              onEdit={(i, v) => console.log(`Edit ${i}: ${v}`)} 
              totalClientPrice={pricingData.clientTotal}
              totalUpteamCost={pricingData.upteamCost}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

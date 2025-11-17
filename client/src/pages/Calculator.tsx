import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Quote } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, Save, Download, FileText, FileSpreadsheet, Files } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ProjectDetailsForm from "@/components/ProjectDetailsForm";
import AreaInput from "@/components/AreaInput";
import DisciplineSelector from "@/components/DisciplineSelector";
import RiskFactors from "@/components/RiskFactors";
import TravelCalculator from "@/components/TravelCalculator";
import AdditionalServices from "@/components/AdditionalServices";
import PaymentTerms from "@/components/PaymentTerms";
import PricingSummary from "@/components/PricingSummary";
import ScopingFields from "@/components/ScopingFields";
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
    { id: "1", name: "", buildingType: "", squareFeet: "", scope: "full", disciplines: [], disciplineLods: {} },
  ]);
  const [risks, setRisks] = useState<string[]>([]);
  const [dispatch, setDispatch] = useState("troy");
  const [distance, setDistance] = useState<number | null>(null);
  const [distanceCalculated, setDistanceCalculated] = useState(false);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [services, setServices] = useState<Record<string, number>>({});
  const [paymentTerms, setPaymentTerms] = useState("net30");
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
    sqftAssumptions: "",
    assumedGrossMargin: "",
    caveatsProfitability: "",
    projectNotes: "",
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
    otherContact: "",
    proofLinks: "",
    source: "",
    sourceNote: "",
    assist: "",
    probabilityOfClosing: "",
    projectStatus: "",
    projectStatusOther: "",
  });

  const handleProjectDetailChange = (field: string, value: string | boolean) => {
    setProjectDetails((prev) => ({ ...prev, [field]: value }));
    if (field === "projectAddress" && typeof value === "string") {
      setTimeout(() => setDistance(125), 1000);
    }
  };

  const handleAreaChange = (id: string, field: keyof Area, value: string) => {
    setAreas((prev) =>
      prev.map((area) => {
        if (area.id !== id) return area;
        
        const updatedArea = { ...area, [field]: value };
        
        if (field === "buildingType") {
          const isLandscape = value === "14" || value === "15";
          if (isLandscape) {
            updatedArea.disciplines = ["site"];
            updatedArea.disciplineLods = { site: updatedArea.disciplineLods.site || "300" };
          }
        }
        
        return updatedArea;
      })
    );
  };

  const addArea = () => {
    setAreas((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", buildingType: "", squareFeet: "", scope: "full", disciplines: [], disciplineLods: {} },
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
      setDistanceCalculated(!!existingQuote.distance);
      setServices(existingQuote.services as Record<string, number>);
      setPaymentTerms((existingQuote as any).paymentTerms || "net30");
      if (existingQuote.scopingData) {
        setScopingData(existingQuote.scopingData as any);
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
      paymentTerms,
      scopingData: scopingMode ? scopingData : null,
      totalPrice,
      pricingBreakdown: {},
    };
    
    saveQuoteMutation.mutate(quoteData);
  };

  const exportQuote = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.text("S2P - Scan2Plan", 14, 20);
    
    doc.setFontSize(16);
    doc.text("Quote", 14, 30);
    
    doc.setFontSize(10);
    doc.text(`Quote #: ${existingQuote?.quoteNumber || "Draft"}`, 14, 38);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 44);
    
    doc.setFontSize(12);
    doc.text("Project Information", 14, 54);
    doc.setFontSize(10);
    doc.text(`Client: ${projectDetails.clientName || "N/A"}`, 14, 61);
    doc.text(`Project: ${projectDetails.projectName}`, 14, 67);
    doc.text(`Address: ${projectDetails.projectAddress}`, 14, 73);
    doc.text(`Building Type: ${projectDetails.typeOfBuilding}`, 14, 79);
    
    const pricingTableData = pricingItems.map(item => [
      item.label,
      `$${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);
    
    autoTable(doc, {
      startY: 88,
      head: [['Item', 'Amount']],
      body: pricingTableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 50, halign: 'right' }
      }
    });
    
    if (projectDetails.notes) {
      const finalY = (doc as any).lastAutoTable.finalY || 88;
      doc.setFontSize(12);
      doc.text("Notes", 14, finalY + 10);
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(projectDetails.notes, pageWidth - 28);
      doc.text(splitNotes, 14, finalY + 17);
    }
    
    doc.save(`quote-${projectDetails.projectName || "draft"}-${Date.now()}.pdf`);

    toast({
      title: "Quote exported",
      description: "Quote has been downloaded as PDF",
    });
  };

  const exportScope = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.text("S2P - Scan2Plan", 14, 20);
    
    doc.setFontSize(16);
    doc.text("Scoping Sheet", 14, 30);
    
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 38);
    
    doc.setFontSize(12);
    doc.text("Project Information", 14, 48);
    doc.setFontSize(10);
    doc.text(`Client: ${projectDetails.clientName || "N/A"}`, 14, 55);
    doc.text(`Project: ${projectDetails.projectName}`, 14, 61);
    doc.text(`Address: ${projectDetails.projectAddress}`, 14, 67);
    doc.text(`Building Type: ${projectDetails.typeOfBuilding}`, 14, 73);
    
    let yPos = 83;
    doc.setFontSize(12);
    doc.text("Scoping Details", 14, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    const scopeEntries = Object.entries(scopingData).filter(([_, value]) => value);
    
    scopeEntries.forEach(([key, value]) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      const valueStr = Array.isArray(value) ? value.join(', ') : String(value);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, yPos);
      doc.setFont('helvetica', 'normal');
      
      const splitValue = doc.splitTextToSize(valueStr, pageWidth - 28);
      doc.text(splitValue, 14, yPos + 5);
      yPos += 5 + (splitValue.length * 4);
    });
    
    doc.save(`scope-${projectDetails.projectName || "draft"}-${Date.now()}.pdf`);

    toast({
      title: "Scope exported",
      description: "Scoping data has been downloaded as PDF",
    });
  };

  const exportBoth = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.text("S2P - Scan2Plan", 14, 20);
    
    doc.setFontSize(16);
    doc.text("Complete Project Export", 14, 30);
    
    doc.setFontSize(10);
    doc.text(`Quote #: ${existingQuote?.quoteNumber || "Draft"}`, 14, 38);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 44);
    
    doc.setFontSize(12);
    doc.text("Project Information", 14, 54);
    doc.setFontSize(10);
    doc.text(`Client: ${projectDetails.clientName || "N/A"}`, 14, 61);
    doc.text(`Project: ${projectDetails.projectName}`, 14, 67);
    doc.text(`Address: ${projectDetails.projectAddress}`, 14, 73);
    doc.text(`Building Type: ${projectDetails.typeOfBuilding}`, 14, 79);
    
    const pricingTableData = pricingItems.map(item => [
      item.label,
      `$${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);
    
    autoTable(doc, {
      startY: 88,
      head: [['Item', 'Amount']],
      body: pricingTableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 50, halign: 'right' }
      }
    });
    
    let yPos = (doc as any).lastAutoTable.finalY + 15;
    
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.text("Scoping Details", 14, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    const scopeEntries = Object.entries(scopingData).filter(([_, value]) => value);
    
    scopeEntries.forEach(([key, value]) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      const valueStr = Array.isArray(value) ? value.join(', ') : String(value);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, yPos);
      doc.setFont('helvetica', 'normal');
      
      const splitValue = doc.splitTextToSize(valueStr, pageWidth - 28);
      doc.text(splitValue, 14, yPos + 5);
      yPos += 5 + (splitValue.length * 4);
    });
    
    doc.save(`complete-${projectDetails.projectName || "draft"}-${Date.now()}.pdf`);

    toast({
      title: "Export complete",
      description: "Complete project has been downloaded as PDF",
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

    areas.forEach((area) => {
      const isLandscape = area.buildingType === "14" || area.buildingType === "15";
      const inputValue = isLandscape ? parseFloat(area.squareFeet) || 0 : parseInt(area.squareFeet) || 0;
      
      const scope = area.scope || "full";
      const disciplines = isLandscape ? ["site"] : (area.disciplines.length > 0 ? area.disciplines : []);
      
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
        if (!isLandscape) {
          if (scope === "interior" && discipline === "architecture") {
            scopeDiscount = lineTotal * 0.25;
            scopeLabel = " (Interior Only -25%)";
          } else if (scope === "exterior" && discipline === "architecture") {
            scopeDiscount = lineTotal * 0.50;
            scopeLabel = " (Exterior Only -50%)";
          } else if (scope === "roof" && discipline === "architecture") {
            scopeDiscount = lineTotal * 0.65;
            scopeLabel = " (Roof/Facades Only -65%)";
          }
        }
        
        lineTotal -= scopeDiscount;
        
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
        let riskPercent = 0.15;
        if (risk === "Hazardous") {
          riskPercent = 0.25;
        } else if (risk === "No Power") {
          riskPercent = 0.20;
        }
        
        const premium = archBaseTotal * riskPercent;
        archAfterRisk += premium;
        
        items.push({
          label: `Risk Premium - ${risk} (+${Math.round(riskPercent * 100)}% on Architecture)`,
          value: premium,
          editable: true,
        });
      });
    }

    let runningTotal = archAfterRisk + otherDisciplinesTotal;

    if (distanceCalculated && distance && distance > 0) {
      const ratePerMile = 3;
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
        label: `Travel (${distance} mi @ $3/mi${distance > 75 && estimatedScanDays >= 2 ? ` + $${300 * estimatedScanDays} scan-day fee` : ''})`,
        value: travelCost,
        editable: true,
      });
      runningTotal += travelCost;
    }

    Object.entries(services).forEach(([serviceId, quantity]) => {
      if (quantity > 0) {
        const serviceRates: Record<string, number> = {
          georeferencing: 1000,
          cadDeliverable: 300,
          matterport: 0.10,
          expeditedService: 0,
          actSqft: 5,
        };
        
        let total = 0;
        let label = "";
        
        if (serviceId === "matterport") {
          total = quantity * serviceRates[serviceId];
          label = `Matterport ($0.10/sqft × ${quantity.toLocaleString()} sqft)`;
        } else if (serviceId === "actSqft") {
          total = quantity * serviceRates[serviceId];
          label = `ACT Modeling ($5/sqft × ${quantity.toLocaleString()} sqft)`;
        } else if (serviceId === "georeferencing") {
          total = 1000;
          label = `Georeferencing`;
        } else if (serviceId === "cadDeliverable") {
          total = Math.max(quantity * serviceRates[serviceId], 300);
          label = `CAD Deliverable (${quantity} set${quantity > 1 ? 's' : ''}, $300 minimum)`;
        } else if (serviceId === "expeditedService") {
          total = runningTotal * 0.20;
          label = `Expedited Service (+20% of total)`;
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

    const paymentInterest: Record<string, number> = {
      net30: 0,
      net60: 0.10,
      net90: 0.20,
    };
    
    const interestRate = paymentInterest[paymentTerms] || 0;
    if (interestRate > 0) {
      const interestAmount = runningTotal * interestRate;
      items.push({
        label: `Payment Terms Interest (${paymentTerms.toUpperCase()} +${Math.round(interestRate * 100)}%)`,
        value: interestAmount,
        editable: true,
      });
      runningTotal += interestAmount;
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

    return items;
  };

  const pricingItems = calculatePricing();

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
            <ProjectDetailsForm {...projectDetails} onFieldChange={handleProjectDetailChange} />

            <Separator />

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

            <PaymentTerms value={paymentTerms} onChange={setPaymentTerms} />

            <Separator />

            <ScopingFields data={scopingData} onChange={handleScopingDataChange} />

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
                  <DropdownMenuItem onClick={exportQuote} data-testid="button-export-quote">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Quote
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportScope} data-testid="button-export-scope">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export Scope
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportBoth} data-testid="button-export-both">
                    <Files className="h-4 w-4 mr-2" />
                    Export Both
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="lg:col-span-1">
            <PricingSummary items={pricingItems} onEdit={(i, v) => console.log(`Edit ${i}: ${v}`)} />
          </div>
        </div>
      </div>
    </div>
  );
}

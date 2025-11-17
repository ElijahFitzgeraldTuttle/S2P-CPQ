import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Quote } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";
import ScopingToggle from "@/components/ScopingToggle";
import ProjectDetailsForm from "@/components/ProjectDetailsForm";
import AreaInput from "@/components/AreaInput";
import DisciplineSelector from "@/components/DisciplineSelector";
import RiskFactors from "@/components/RiskFactors";
import TravelCalculator from "@/components/TravelCalculator";
import AdditionalServices from "@/components/AdditionalServices";
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

export default function Calculator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [, params] = useRoute("/calculator/:id");
  const quoteId = params?.id;

  const { data: existingQuote, isLoading: isLoadingQuote } = useQuery<Quote>({
    queryKey: ["/api/quotes", quoteId],
    enabled: !!quoteId,
  });

  const [scopingMode, setScopingMode] = useState(false);
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
      prev.map((area) => (area.id === id ? { ...area, [field]: value } : area))
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

  useEffect(() => {
    if (existingQuote) {
      setScopingMode(existingQuote.scopingMode);
      setProjectDetails({
        clientName: existingQuote.clientName || "",
        projectName: existingQuote.projectName,
        projectAddress: existingQuote.projectAddress,
        specificBuilding: existingQuote.specificBuilding || "",
        typeOfBuilding: existingQuote.typeOfBuilding,
        hasBasement: existingQuote.hasBasement,
        hasAttic: existingQuote.hasAttic,
        notes: existingQuote.notes || "",
      });
      setAreas(existingQuote.areas as Area[]);
      setRisks(existingQuote.risks as string[]);
      setDispatch(existingQuote.dispatchLocation);
      setDistance(existingQuote.distance);
      setServices(existingQuote.services as Record<string, number>);
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
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: quoteId ? "Quote updated successfully" : "Quote saved successfully",
        description: quoteId ? "Your changes have been saved." : "Your quote has been saved to the dashboard.",
      });
      setLocation("/dashboard");
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
      totalPrice: "22112.50",
      pricingBreakdown: {},
    };
    
    saveQuoteMutation.mutate(quoteData);
  };

  const pricingItems = [
    { label: "Architecture (5,000 sqft)", value: 12500, editable: true },
    { label: "MEPF (5,000 sqft)", value: 15000, editable: true },
    { label: "Base Subtotal", value: 27500, editable: false },
    { label: "Interior Discount (25%)", value: 6875, editable: true, isDiscount: true },
    { label: "Risk Premium - Occupied", value: 500, editable: true },
    { label: "Travel (125 miles)", value: 687.50, editable: true },
    { label: "Matterport (2 units)", value: 300, editable: true },
    { label: "Grand Total", value: 22112.50, editable: true, isTotal: true },
  ];

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
            <ScopingToggle enabled={scopingMode} onChange={setScopingMode} />

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
              isCalculating={false}
              onDispatchChange={setDispatch}
              onAddressChange={(val) => handleProjectDetailChange("projectAddress", val as string)}
            />

            <Separator />

            <AdditionalServices services={services} onServiceChange={handleServiceChange} />

            {scopingMode && (
              <>
                <Separator />
                <ScopingFields data={scopingData} onChange={handleScopingDataChange} />
              </>
            )}

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
              <Button size="lg" variant="outline" data-testid="button-export-pdf">
                Export PDF
              </Button>
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

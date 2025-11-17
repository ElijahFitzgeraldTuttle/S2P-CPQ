import { useState } from "react";
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

interface Area {
  id: string;
  name: string;
  buildingType: string;
  squareFeet: string;
  scope: string;
}

export default function Calculator() {
  const [scopingMode, setScopingMode] = useState(false);
  const [projectDetails, setProjectDetails] = useState({
    clientName: "",
    projectName: "",
    projectAddress: "",
    notes: "",
  });
  const [areas, setAreas] = useState<Area[]>([
    { id: "1", name: "", buildingType: "", squareFeet: "", scope: "full" },
  ]);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [disciplineLods, setDisciplineLods] = useState<Record<string, string>>({});
  const [risks, setRisks] = useState<string[]>([]);
  const [dispatch, setDispatch] = useState("troy");
  const [distance, setDistance] = useState<number | null>(null);
  const [services, setServices] = useState<Record<string, number>>({});
  const [scopingData, setScopingData] = useState({
    projectDeadline: "",
    targetDeliveryDate: "",
    rushProject: false,
    buildingHeight: "",
    floorsAboveGrade: "",
    floorsBelowGrade: "",
    totalFloors: "",
    basementLevels: "",
    siteAccessType: "",
    accessRestrictions: "",
    workingHours: "",
    securityRequirements: "",
    parkingAvailable: false,
    hvacSystem: [] as string[],
    elevatorCount: "",
    escalatorCount: "",
    fireSprinklers: false,
    fireAlarm: false,
    constructionType: "",
    structuralSystem: "",
    exteriorWalls: [] as string[],
    roofType: "",
    electricalService: "",
    plumbingFixtures: "",
    specialSystems: [] as string[],
    ceilingTypes: [] as string[],
    flooringTypes: [] as string[],
    interiorPartitions: [] as string[],
    landscaping: false,
    pavingType: [] as string[],
    utilities: [] as string[],
    siteFurniture: false,
    existingDrawings: "",
    previousSurveys: "",
    surveyAccuracy: "",
    modelFormat: [] as string[],
    drawingFormat: [] as string[],
    pointCloudFormat: [] as string[],
    asbestosPresent: false,
    leadPaint: false,
    hazardousMaterials: "",
    historicBuilding: false,
    specialRequirements: "",
    technicalChallenges: "",
    additionalNotes: "",
  });

  const handleProjectDetailChange = (field: string, value: string) => {
    setProjectDetails((prev) => ({ ...prev, [field]: value }));
    if (field === "projectAddress") {
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
      { id: Date.now().toString(), name: "", buildingType: "", squareFeet: "", scope: "full" },
    ]);
  };

  const removeArea = (id: string) => {
    setAreas((prev) => prev.filter((area) => area.id !== id));
  };

  const handleDisciplineChange = (disciplineId: string, checked: boolean) => {
    setDisciplines((prev) =>
      checked ? [...prev, disciplineId] : prev.filter((d) => d !== disciplineId)
    );
    if (checked && !disciplineLods[disciplineId]) {
      setDisciplineLods((prev) => ({ ...prev, [disciplineId]: "300" }));
    }
  };

  const handleLodChange = (disciplineId: string, value: string) => {
    setDisciplineLods((prev) => ({ ...prev, [disciplineId]: value }));
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create Quote</h1>
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
                  onRemove={removeArea}
                  canRemove={areas.length > 1}
                />
              ))}
            </div>

            <Separator />

            <DisciplineSelector
              selectedDisciplines={disciplines}
              disciplineLods={disciplineLods}
              onDisciplineChange={handleDisciplineChange}
              onLodChange={handleLodChange}
            />

            <Separator />

            {scopingMode && (
              <>
                <ScopingFields data={scopingData} onChange={handleScopingDataChange} />
                <Separator />
              </>
            )}

            <RiskFactors selectedRisks={risks} onRiskChange={handleRiskChange} />

            <Separator />

            <TravelCalculator
              dispatchLocation={dispatch}
              projectAddress={projectDetails.projectAddress}
              distance={distance}
              isCalculating={false}
              onDispatchChange={setDispatch}
              onAddressChange={(val) => handleProjectDetailChange("projectAddress", val)}
            />

            <Separator />

            <AdditionalServices services={services} onServiceChange={handleServiceChange} />

            <div className="flex gap-4 pt-6">
              <Button size="lg" className="flex-1" data-testid="button-save-quote">
                <Save className="h-4 w-4 mr-2" />
                Save Quote
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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Send, Copy, RotateCcw, Plus, Trash2 } from "lucide-react";

interface TestArea {
  id: string;
  name: string;
  buildingType: string;
  squareFeet: string;
  scope: string;
  disciplines: string[];
  disciplineLods: Record<string, string>;
  gradeAroundBuilding: boolean;
  gradeLod: string;
  includeCad: boolean;
  additionalElevations: number;
}

const BUILDING_TYPES = [
  { id: "1", name: "Office Building" },
  { id: "2", name: "Educational" },
  { id: "3", name: "Healthcare" },
  { id: "4", name: "Industrial" },
  { id: "5", name: "Residential Multi-Family" },
  { id: "6", name: "Residential Single-Family" },
  { id: "7", name: "Retail" },
  { id: "8", name: "Hospitality" },
  { id: "9", name: "Mixed-Use" },
  { id: "10", name: "Warehouse" },
  { id: "11", name: "Religious" },
  { id: "12", name: "Government" },
  { id: "13", name: "Parking Structure" },
  { id: "14", name: "Built Landscape (acres)" },
  { id: "15", name: "Natural Landscape (acres)" },
  { id: "16", name: "ACT Ceilings Only" },
  { id: "17", name: "Matterport Only" },
];

const DISCIPLINES = [
  { id: "arch", name: "Architecture" },
  { id: "structure", name: "Structure" },
  { id: "mepf", name: "MEPF" },
  { id: "site", name: "Site/Topography" },
  { id: "matterport", name: "Matterport" },
];

const SCOPES = ["full", "interior", "exterior", "mixed"];

const DEFAULT_AREA: TestArea = {
  id: "area-1",
  name: "Test Area 1",
  buildingType: "1",
  squareFeet: "25000",
  scope: "full",
  disciplines: ["arch"],
  disciplineLods: { arch: "300" },
  gradeAroundBuilding: false,
  gradeLod: "300",
  includeCad: false,
  additionalElevations: 0,
};

const PRESET_SCENARIOS = {
  standard: {
    name: "Standard Office (25k sqft)",
    leadId: 1001,
    projectDetails: {
      clientName: "Test Client Inc",
      projectName: "Standard Office Test",
      projectAddress: "123 Test St, Albany NY 12205",
      specificBuilding: "",
      typeOfBuilding: "Commercial Office",
      hasBasement: false,
      hasAttic: false,
      notes: "",
    },
    areas: [{
      ...DEFAULT_AREA,
      buildingType: "1",
      squareFeet: "25000",
      disciplines: ["arch"],
      disciplineLods: { arch: "300" },
    }],
    risks: [],
    travel: { dispatchLocation: "troy", distance: 30, customTravelCost: null },
    scopingData: {},
  },
  tierA: {
    name: "Tier A Project (75k sqft)",
    leadId: 1002,
    projectDetails: {
      clientName: "Large Corp",
      projectName: "Tier A Test Project",
      projectAddress: "456 Main St, Brooklyn NY 11201",
      specificBuilding: "Main Building",
      typeOfBuilding: "Commercial Office",
      hasBasement: true,
      hasAttic: false,
      notes: "Large project test",
    },
    areas: [{
      ...DEFAULT_AREA,
      id: "area-tier-a",
      name: "Main Building",
      buildingType: "1",
      squareFeet: "75000",
      disciplines: ["arch", "structure", "mepf"],
      disciplineLods: { arch: "300", structure: "200", mepf: "200" },
    }],
    risks: ["occupied"],
    travel: { dispatchLocation: "brooklyn", distance: 25, customTravelCost: null },
    scopingData: {
      tierAScanningCost: "10500",
      tierAModelingCost: "18000",
      tierAMargin: "3",
    },
  },
  landscape: {
    name: "Landscape Project (5 acres)",
    leadId: 1003,
    projectDetails: {
      clientName: "Park Development Co",
      projectName: "Landscape Test",
      projectAddress: "789 Park Ave, Troy NY 12180",
      specificBuilding: "",
      typeOfBuilding: "Site Survey",
      hasBasement: false,
      hasAttic: false,
      notes: "Landscape pricing test",
    },
    areas: [{
      ...DEFAULT_AREA,
      id: "area-landscape",
      name: "Main Lot",
      buildingType: "14",
      squareFeet: "5",
      scope: "full",
      disciplines: ["site"],
      disciplineLods: { site: "300" },
    }],
    risks: [],
    travel: { dispatchLocation: "troy", distance: 15, customTravelCost: null },
    scopingData: {},
  },
  riskPremium: {
    name: "Risk Premium Test (Occupied + Hazardous)",
    leadId: 1004,
    projectDetails: {
      clientName: "Risk Test Client",
      projectName: "Risk Premium Test",
      projectAddress: "321 Danger St, Albany NY 12205",
      specificBuilding: "",
      typeOfBuilding: "Industrial",
      hasBasement: false,
      hasAttic: false,
      notes: "Testing risk premium application",
    },
    areas: [{
      ...DEFAULT_AREA,
      id: "area-risk",
      name: "Industrial Building",
      buildingType: "4",
      squareFeet: "30000",
      disciplines: ["arch", "mepf"],
      disciplineLods: { arch: "300", mepf: "200" },
    }],
    risks: ["occupied", "hazardous"],
    travel: { dispatchLocation: "troy", distance: 40, customTravelCost: null },
    scopingData: {},
  },
  flyOut: {
    name: "Fly-Out Project (150 miles)",
    leadId: 1005,
    projectDetails: {
      clientName: "Remote Client",
      projectName: "Fly-Out Test",
      projectAddress: "999 Far Away Rd, Syracuse NY 13202",
      specificBuilding: "",
      typeOfBuilding: "Office",
      hasBasement: false,
      hasAttic: false,
      notes: "Testing fly-out travel fees",
    },
    areas: [{
      ...DEFAULT_AREA,
      id: "area-flyout",
      name: "Remote Office",
      buildingType: "1",
      squareFeet: "20000",
      disciplines: ["arch"],
      disciplineLods: { arch: "300" },
    }],
    risks: [],
    travel: { dispatchLocation: "troy", distance: 150, customTravelCost: null },
    scopingData: {},
  },
  multiArea: {
    name: "Multi-Area Project",
    leadId: 1006,
    projectDetails: {
      clientName: "Campus Corp",
      projectName: "Multi-Area Test",
      projectAddress: "555 Campus Dr, Albany NY 12205",
      specificBuilding: "",
      typeOfBuilding: "Campus",
      hasBasement: false,
      hasAttic: false,
      notes: "Testing multiple areas",
    },
    areas: [
      {
        ...DEFAULT_AREA,
        id: "area-1",
        name: "Building A",
        buildingType: "1",
        squareFeet: "15000",
        disciplines: ["arch"],
        disciplineLods: { arch: "300" },
      },
      {
        ...DEFAULT_AREA,
        id: "area-2",
        name: "Building B",
        buildingType: "2",
        squareFeet: "20000",
        disciplines: ["arch", "mepf"],
        disciplineLods: { arch: "300", mepf: "200" },
      },
      {
        ...DEFAULT_AREA,
        id: "area-3",
        name: "Parking Lot",
        buildingType: "14",
        squareFeet: "2.5",
        disciplines: ["site"],
        disciplineLods: { site: "300" },
      },
    ],
    risks: [],
    travel: { dispatchLocation: "troy", distance: 25, customTravelCost: null },
    scopingData: {},
  },
};

export default function TestPayload() {
  const { toast } = useToast();
  const [targetUrl, setTargetUrl] = useState("http://localhost:5000/calculator");
  const [leadId, setLeadId] = useState("1001");
  
  const [projectDetails, setProjectDetails] = useState({
    clientName: "Test Client Inc",
    projectName: "Test Project",
    projectAddress: "123 Test St, Albany NY 12205",
    specificBuilding: "",
    typeOfBuilding: "Commercial Office",
    hasBasement: false,
    hasAttic: false,
    notes: "",
  });
  
  const [areas, setAreas] = useState<TestArea[]>([{ ...DEFAULT_AREA }]);
  const [risks, setRisks] = useState<string[]>([]);
  
  const [travel, setTravel] = useState({
    dispatchLocation: "troy",
    distance: 30,
    customTravelCost: null as number | null,
  });
  
  const [scopingData, setScopingData] = useState({
    tierAScanningCost: "",
    tierAScanningCostOther: "",
    tierAModelingCost: "",
    tierAMargin: "",
    paymentTerms: "",
    estimatedTimeline: "",
    source: "",
    probabilityOfClosing: "50",
  });

  const generatePayload = () => {
    return {
      type: "CPQ_SCOPING_PAYLOAD",
      leadId: parseInt(leadId) || 1001,
      projectDetails,
      areas: areas.map(a => ({
        ...a,
        mixedInteriorLod: "300",
        mixedExteriorLod: "300",
        numberOfRoofs: 0,
        facades: [],
      })),
      risks,
      travel,
      services: {},
      scopingData,
    };
  };

  const handleSendPayload = () => {
    const payload = generatePayload();
    
    const iframe = document.getElementById("cpq-iframe") as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(payload, "*");
      toast({
        title: "Payload Sent",
        description: "CPQ_SCOPING_PAYLOAD sent to iframe",
      });
    } else {
      toast({
        title: "Error",
        description: "Could not find iframe to send payload",
        variant: "destructive",
      });
    }
  };

  const handleCopyPayload = () => {
    const payload = generatePayload();
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    toast({
      title: "Copied",
      description: "Payload copied to clipboard",
    });
  };

  const loadPreset = (presetKey: string) => {
    const preset = PRESET_SCENARIOS[presetKey as keyof typeof PRESET_SCENARIOS];
    if (preset) {
      setLeadId(String(preset.leadId));
      setProjectDetails(preset.projectDetails);
      setAreas(preset.areas as TestArea[]);
      setRisks(preset.risks);
      setTravel(preset.travel);
      setScopingData(prev => ({ ...prev, ...preset.scopingData }));
      toast({
        title: "Preset Loaded",
        description: preset.name,
      });
    }
  };

  const addArea = () => {
    const newId = `area-${Date.now()}`;
    setAreas([...areas, { ...DEFAULT_AREA, id: newId, name: `Area ${areas.length + 1}` }]);
  };

  const removeArea = (id: string) => {
    if (areas.length > 1) {
      setAreas(areas.filter(a => a.id !== id));
    }
  };

  const updateArea = (id: string, field: keyof TestArea, value: any) => {
    setAreas(areas.map(a => {
      if (a.id !== id) return a;
      
      const updated = { ...a, [field]: value };
      
      if (field === "buildingType") {
        const isLandscape = value === "14" || value === "15";
        if (isLandscape) {
          updated.disciplines = ["site"];
          updated.disciplineLods = { site: "300" };
          updated.scope = "full";
        }
      }
      
      return updated;
    }));
  };

  const toggleDiscipline = (areaId: string, disciplineId: string) => {
    setAreas(areas.map(a => {
      if (a.id !== areaId) return a;
      
      const hasDiscipline = a.disciplines.includes(disciplineId);
      const newDisciplines = hasDiscipline
        ? a.disciplines.filter(d => d !== disciplineId)
        : [...a.disciplines, disciplineId];
      
      const newLods = { ...a.disciplineLods };
      if (!hasDiscipline) {
        newLods[disciplineId] = "300";
      } else {
        delete newLods[disciplineId];
      }
      
      return { ...a, disciplines: newDisciplines, disciplineLods: newLods };
    }));
  };

  const updateLod = (areaId: string, disciplineId: string, lod: string) => {
    setAreas(areas.map(a => {
      if (a.id !== areaId) return a;
      return { ...a, disciplineLods: { ...a.disciplineLods, [disciplineId]: lod } };
    }));
  };

  const toggleRisk = (risk: string) => {
    setRisks(risks.includes(risk) ? risks.filter(r => r !== risk) : [...risks, risk]);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">CPQ Test Payload Sender</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => loadPreset("standard")} data-testid="button-preset-standard">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preset Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PRESET_SCENARIOS).map(([key, preset]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => loadPreset(key)}
                      data-testid={`button-preset-${key}`}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="project">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="project">Project</TabsTrigger>
                <TabsTrigger value="areas">Areas</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="travel">Travel</TabsTrigger>
                <TabsTrigger value="scoping">Scoping</TabsTrigger>
              </TabsList>

              <TabsContent value="project" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Lead ID</Label>
                      <Input
                        value={leadId}
                        onChange={(e) => setLeadId(e.target.value)}
                        data-testid="input-lead-id"
                      />
                    </div>
                    <div>
                      <Label>Client Name</Label>
                      <Input
                        value={projectDetails.clientName}
                        onChange={(e) => setProjectDetails({ ...projectDetails, clientName: e.target.value })}
                        data-testid="input-client-name"
                      />
                    </div>
                    <div>
                      <Label>Project Name</Label>
                      <Input
                        value={projectDetails.projectName}
                        onChange={(e) => setProjectDetails({ ...projectDetails, projectName: e.target.value })}
                        data-testid="input-project-name"
                      />
                    </div>
                    <div>
                      <Label>Project Address</Label>
                      <Input
                        value={projectDetails.projectAddress}
                        onChange={(e) => setProjectDetails({ ...projectDetails, projectAddress: e.target.value })}
                        data-testid="input-project-address"
                      />
                    </div>
                    <div>
                      <Label>Type of Building</Label>
                      <Input
                        value={projectDetails.typeOfBuilding}
                        onChange={(e) => setProjectDetails({ ...projectDetails, typeOfBuilding: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={projectDetails.hasBasement}
                          onCheckedChange={(c) => setProjectDetails({ ...projectDetails, hasBasement: !!c })}
                        />
                        <Label>Has Basement</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={projectDetails.hasAttic}
                          onCheckedChange={(c) => setProjectDetails({ ...projectDetails, hasAttic: !!c })}
                        />
                        <Label>Has Attic</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="areas" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Areas ({areas.length})</h3>
                  <Button size="sm" onClick={addArea} data-testid="button-add-area">
                    <Plus className="w-4 h-4 mr-1" /> Add Area
                  </Button>
                </div>
                
                {areas.map((area, idx) => (
                  <Card key={area.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm">Area {idx + 1}</CardTitle>
                        {areas.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArea(area.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={area.name}
                          onChange={(e) => updateArea(area.id, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Building Type</Label>
                        <Select
                          value={area.buildingType}
                          onValueChange={(v) => updateArea(area.id, "buildingType", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BUILDING_TYPES.map(bt => (
                              <SelectItem key={bt.id} value={bt.id}>{bt.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>
                          {area.buildingType === "14" || area.buildingType === "15" ? "Acres" : "Square Feet"}
                        </Label>
                        <Input
                          value={area.squareFeet}
                          onChange={(e) => updateArea(area.id, "squareFeet", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Scope</Label>
                        <Select
                          value={area.scope}
                          onValueChange={(v) => updateArea(area.id, "scope", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SCOPES.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Disciplines</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {DISCIPLINES.map(d => (
                            <div key={d.id} className="flex items-center gap-1">
                              <Checkbox
                                checked={area.disciplines.includes(d.id)}
                                onCheckedChange={() => toggleDiscipline(area.id, d.id)}
                              />
                              <span className="text-sm">{d.name}</span>
                              {area.disciplines.includes(d.id) && (
                                <Select
                                  value={area.disciplineLods[d.id] || "300"}
                                  onValueChange={(v) => updateLod(area.id, d.id, v)}
                                >
                                  <SelectTrigger className="w-20 h-7">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="200">200</SelectItem>
                                    <SelectItem value="300">300</SelectItem>
                                    <SelectItem value="350">350</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={area.includeCad}
                          onCheckedChange={(c) => updateArea(area.id, "includeCad", !!c)}
                        />
                        <Label>Include CAD Package</Label>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="risks">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Factors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Risk premiums apply to Architecture discipline only
                    </p>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={risks.includes("occupied")}
                        onCheckedChange={() => toggleRisk("occupied")}
                        data-testid="checkbox-risk-occupied"
                      />
                      <Label>Occupied Building (+15%)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={risks.includes("hazardous")}
                        onCheckedChange={() => toggleRisk("hazardous")}
                        data-testid="checkbox-risk-hazardous"
                      />
                      <Label>Hazardous Conditions (+25%)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={risks.includes("no_power")}
                        onCheckedChange={() => toggleRisk("no_power")}
                        data-testid="checkbox-risk-nopower"
                      />
                      <Label>No Power/HVAC (+20%)</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="travel">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Travel Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Dispatch Location</Label>
                      <Select
                        value={travel.dispatchLocation}
                        onValueChange={(v) => setTravel({ ...travel, dispatchLocation: v })}
                      >
                        <SelectTrigger data-testid="select-dispatch">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="troy">Troy ($3/mile)</SelectItem>
                          <SelectItem value="brooklyn">Brooklyn (tiered + $4/mi)</SelectItem>
                          <SelectItem value="woodstock">Woodstock ($3/mile)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Distance (miles)</Label>
                      <Input
                        type="number"
                        value={travel.distance}
                        onChange={(e) => setTravel({ ...travel, distance: parseInt(e.target.value) || 0 })}
                        data-testid="input-distance"
                      />
                    </div>
                    <div>
                      <Label>Custom Travel Cost (optional)</Label>
                      <Input
                        type="number"
                        value={travel.customTravelCost || ""}
                        onChange={(e) => setTravel({ ...travel, customTravelCost: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Leave empty to calculate"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scoping">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scoping Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Tier A Scanning Cost</Label>
                        <Select
                          value={scopingData.tierAScanningCost}
                          onValueChange={(v) => setScopingData({ ...scopingData, tierAScanningCost: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3500">$3,500</SelectItem>
                            <SelectItem value="7000">$7,000</SelectItem>
                            <SelectItem value="10500">$10,500</SelectItem>
                            <SelectItem value="15000">$15,000</SelectItem>
                            <SelectItem value="18500">$18,500</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Tier A Modeling Cost</Label>
                        <Input
                          value={scopingData.tierAModelingCost}
                          onChange={(e) => setScopingData({ ...scopingData, tierAModelingCost: e.target.value })}
                          placeholder="e.g., 15000"
                        />
                      </div>
                      <div>
                        <Label>Tier A Margin</Label>
                        <Select
                          value={scopingData.tierAMargin}
                          onValueChange={(v) => setScopingData({ ...scopingData, tierAMargin: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2.352">2.352X</SelectItem>
                            <SelectItem value="2.5">2.5X</SelectItem>
                            <SelectItem value="3">3X</SelectItem>
                            <SelectItem value="3.5">3.5X</SelectItem>
                            <SelectItem value="4">4X</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Payment Terms</Label>
                        <Select
                          value={scopingData.paymentTerms}
                          onValueChange={(v) => setScopingData({ ...scopingData, paymentTerms: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="partner">Partner</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="net30">Net 30</SelectItem>
                            <SelectItem value="net60">Net 60</SelectItem>
                            <SelectItem value="net90">Net 90</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Probability of Closing (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={scopingData.probabilityOfClosing}
                        onChange={(e) => setScopingData({ ...scopingData, probabilityOfClosing: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card>
              <CardContent className="pt-4">
                <div className="flex gap-2">
                  <Button onClick={handleSendPayload} className="flex-1" data-testid="button-send-payload">
                    <Send className="w-4 h-4 mr-2" />
                    Send to CPQ
                  </Button>
                  <Button variant="outline" onClick={handleCopyPayload} data-testid="button-copy-payload">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy JSON
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generated Payload</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="font-mono text-xs h-64"
                  value={JSON.stringify(generatePayload(), null, 2)}
                  readOnly
                  data-testid="textarea-payload-preview"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CPQ Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Target URL</Label>
                  <Input
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    data-testid="input-target-url"
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="border rounded-lg overflow-hidden" style={{ height: "calc(100vh - 280px)" }}>
              <iframe
                id="cpq-iframe"
                src={targetUrl}
                className="w-full h-full"
                title="CPQ Calculator"
                data-testid="iframe-cpq"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

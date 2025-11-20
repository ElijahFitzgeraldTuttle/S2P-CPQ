import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PricingMatrixEditor from "@/components/PricingMatrixEditor";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const BUILDING_TYPES = [
  { id: 1, name: "Commercial / Office" },
  { id: 2, name: "Industrial / Warehouse" },
  { id: 3, name: "Retail" },
  { id: 4, name: "Healthcare" },
  { id: 5, name: "Educational" },
  { id: 6, name: "Residential (Single Family)" },
  { id: 7, name: "Residential (Multi-Family)" },
  { id: 8, name: "Hospitality" },
  { id: 9, name: "Religious / Community" },
  { id: 10, name: "Sports / Recreation" },
  { id: 11, name: "Transportation / Infrastructure" },
  { id: 12, name: "Mixed-Use" },
  { id: 13, name: "Historic / Preservation" },
];

//todo: remove mock functionality
const PARAMETER_GROUPS = [
  {
    title: "Risk Factors",
    params: [
      { key: "occupied_building", label: "Occupied Building Premium", value: 500 },
      { key: "hazardous_conditions", label: "Hazardous Conditions Premium", value: 1000 },
      { key: "no_power_hvac", label: "No Power/HVAC Premium", value: 300 },
    ],
  },
  {
    title: "Travel Costs",
    params: [
      { key: "travel_rate_per_mile", label: "Travel Rate (per mile)", value: 1.50 },
      { key: "travel_distance_threshold", label: "Distance Threshold (miles)", value: 100 },
      { key: "travel_scan_day_fee", label: "Scan Day Fee (over threshold)", value: 500 },
    ],
  },
  {
    title: "Scope Discounts",
    params: [
      { key: "discount_interior", label: "Interior Only Discount (%)", value: 25 },
      { key: "discount_exterior", label: "Exterior Only Discount (%)", value: 50 },
      { key: "discount_roof", label: "Roof/Facades Discount (%)", value: 65 },
    ],
  },
  {
    title: "Additional Services",
    params: [
      { key: "service_matterport", label: "Matterport (per unit)", value: 150 },
      { key: "service_georeferencing", label: "Georeferencing (per unit)", value: 500 },
      { key: "service_scan_half", label: "Scanning - Half Day", value: 750 },
      { key: "service_scan_full", label: "Scanning - Full Day", value: 1500 },
    ],
  },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("parameters");
  const [matrixTab, setMatrixTab] = useState("client");
  const [selectedBuildingType, setSelectedBuildingType] = useState<number>(1);
  const [params, setParams] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Fetch client pricing matrix
  const { data: clientPricingRates, isLoading: isLoadingClientRates } = useQuery<any[]>({
    queryKey: ["/api/pricing-matrix"],
  });

  // Fetch upteam pricing matrix
  const { data: upteamPricingRates, isLoading: isLoadingUpteamRates } = useQuery<any[]>({
    queryKey: ["/api/upteam-pricing-matrix"],
  });

  // Update pricing rate mutation (client pricing)
  const updateClientRateMutation = useMutation({
    mutationFn: async ({ id, ratePerSqFt }: { id: number; ratePerSqFt: string }) => {
      return await apiRequest("PATCH", `/api/pricing-matrix/${id}`, { ratePerSqFt });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-matrix"] });
      toast({
        title: "Rate updated",
        description: "Client pricing rate has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update client pricing rate",
        variant: "destructive",
      });
    },
  });

  // Update pricing rate mutation (upteam pricing)
  const updateUpteamRateMutation = useMutation({
    mutationFn: async ({ id, ratePerSqFt }: { id: number; ratePerSqFt: string }) => {
      return await apiRequest("PATCH", `/api/upteam-pricing-matrix/${id}`, { ratePerSqFt });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/upteam-pricing-matrix"] });
      toast({
        title: "Rate updated",
        description: "Upteam pricing rate has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update upteam pricing rate",
        variant: "destructive",
      });
    },
  });

  const handleParamChange = (key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleClientRateChange = (rateId: number, newRate: number) => {
    updateClientRateMutation.mutate({
      id: rateId,
      ratePerSqFt: newRate.toString(),
    });
  };

  const handleUpteamRateChange = (rateId: number, newRate: number) => {
    updateUpteamRateMutation.mutate({
      id: rateId,
      ratePerSqFt: newRate.toString(),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
          <p className="text-muted-foreground">
            Configure pricing parameters and matrix rates
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="parameters" data-testid="tab-parameters">
              Pricing Parameters
            </TabsTrigger>
            <TabsTrigger value="matrix" data-testid="tab-matrix">
              Pricing Matrix
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parameters" className="mt-6 space-y-6">
            {PARAMETER_GROUPS.map((group) => (
              <Card key={group.title}>
                <CardHeader>
                  <CardTitle>{group.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {group.params.map((param) => (
                      <div key={param.key} className="space-y-2">
                        <Label htmlFor={param.key} className="text-sm font-medium">
                          {param.label}
                        </Label>
                        <Input
                          id={param.key}
                          type="number"
                          step="0.01"
                          value={params[param.key] ?? param.value}
                          onChange={(e) =>
                            handleParamChange(param.key, parseFloat(e.target.value) || 0)
                          }
                          className="font-mono"
                          data-testid={`input-param-${param.key}`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end">
              <Button size="lg" data-testid="button-save-parameters">
                <Save className="h-4 w-4 mr-2" />
                Save Parameters
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="matrix" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Building Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedBuildingType.toString()}
                  onValueChange={(value) => setSelectedBuildingType(parseInt(value))}
                >
                  <SelectTrigger className="w-full max-w-md" data-testid="select-building-type">
                    <SelectValue placeholder="Select building type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUILDING_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Tabs value={matrixTab} onValueChange={setMatrixTab}>
              <TabsList>
                <TabsTrigger value="client" data-testid="tab-client-pricing">
                  Client Pricing Matrix
                </TabsTrigger>
                <TabsTrigger value="upteam" data-testid="tab-upteam-pricing">
                  Upteam Pricing Matrix
                </TabsTrigger>
              </TabsList>

              <TabsContent value="client" className="mt-6">
                {isLoadingClientRates ? (
                  <Card>
                    <CardContent className="flex items-center justify-center p-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </CardContent>
                  </Card>
                ) : (
                  <PricingMatrixEditor
                    buildingType={BUILDING_TYPES.find(b => b.id === selectedBuildingType)?.name || ""}
                    buildingTypeId={selectedBuildingType}
                    rates={clientPricingRates || []}
                    onRateChange={handleClientRateChange}
                    isUpteam={false}
                  />
                )}
              </TabsContent>

              <TabsContent value="upteam" className="mt-6">
                {isLoadingUpteamRates ? (
                  <Card>
                    <CardContent className="flex items-center justify-center p-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </CardContent>
                  </Card>
                ) : (
                  <PricingMatrixEditor
                    buildingType={BUILDING_TYPES.find(b => b.id === selectedBuildingType)?.name || ""}
                    buildingTypeId={selectedBuildingType}
                    rates={upteamPricingRates || []}
                    onRateChange={handleUpteamRateChange}
                    isUpteam={true}
                  />
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

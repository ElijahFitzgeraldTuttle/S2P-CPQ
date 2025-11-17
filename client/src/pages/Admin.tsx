import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PricingMatrixEditor from "@/components/PricingMatrixEditor";
import { Save } from "lucide-react";

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
  const [params, setParams] = useState<Record<string, number>>({});
  const [matrixRates, setMatrixRates] = useState<Record<string, number>>({});

  const handleParamChange = (key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
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
            <PricingMatrixEditor
              buildingType="Commercial / Office"
              rates={matrixRates}
              onRateChange={(key, value) =>
                setMatrixRates((prev) => ({ ...prev, [key]: value }))
              }
            />

            <div className="flex justify-end">
              <Button size="lg" data-testid="button-save-matrix">
                <Save className="h-4 w-4 mr-2" />
                Save Matrix Rates
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

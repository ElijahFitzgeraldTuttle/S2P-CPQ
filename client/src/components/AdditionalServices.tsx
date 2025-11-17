import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";

const SERVICES = [
  { id: "cadDeliverable", label: "CAD Deliverable (PDF & DWG)", rate: 300, unit: "per set" },
  { id: "matterport", label: "Matterport Virtual Tours", rate: 0.10, unit: "per sqft" },
];

const ACT_RATE_PER_SQFT = 5;

interface AdditionalServicesProps {
  services: Record<string, number>;
  onServiceChange: (serviceId: string, quantity: number) => void;
}

export default function AdditionalServices({ services, onServiceChange }: AdditionalServicesProps) {
  const [actEnabled, setActEnabled] = useState<string>(services.actSqft > 0 ? "yes" : "no");
  const actSqft = services.actSqft || 0;
  const actTotal = actSqft * ACT_RATE_PER_SQFT;

  useEffect(() => {
    setActEnabled(services.actSqft > 0 ? "yes" : "no");
  }, [services.actSqft]);

  const handleActEnabledChange = (value: string) => {
    setActEnabled(value);
    if (value !== "yes") {
      onServiceChange("actSqft", 0);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Additional Services</h3>
      
      <div className="grid gap-4">
        {/* Georeferencing Service */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                id="georeferencing"
                checked={services.georeferencing > 0}
                onCheckedChange={(checked) => onServiceChange("georeferencing", checked ? 1 : 0)}
                data-testid="checkbox-georeferencing"
              />
              <div>
                <Label htmlFor="georeferencing" className="text-sm font-medium cursor-pointer">
                  Georeferencing
                </Label>
                <p className="text-xs text-muted-foreground">
                  $1,000 per building or site
                </p>
              </div>
            </div>
            {services.georeferencing > 0 && (
              <div className="text-right">
                <span className="font-mono text-sm font-semibold text-primary">
                  $1,000
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Acoustic Ceiling Tile Service */}
        <Card className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Scanning & Modeling above and below Acoustic Ceiling Tile? (where appropriate)
              </Label>
              <RadioGroup value={actEnabled} onValueChange={handleActEnabledChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="act-yes" data-testid="radio-act-yes" />
                  <Label htmlFor="act-yes" className="cursor-pointer font-normal">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="act-no" data-testid="radio-act-no" />
                  <Label htmlFor="act-no" className="cursor-pointer font-normal">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="act-other" data-testid="radio-act-other" />
                  <Label htmlFor="act-other" className="cursor-pointer font-normal">Other</Label>
                </div>
              </RadioGroup>
            </div>

            {actEnabled === "yes" && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                <div className="flex-1">
                  <Label htmlFor="act-sqft" className="text-sm font-medium">
                    Scope of ACT (sqft)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${ACT_RATE_PER_SQFT.toLocaleString()} per sqft
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <Input
                      id="act-sqft"
                      type="number"
                      min="0"
                      value={actSqft}
                      onChange={(e) => onServiceChange("actSqft", parseInt(e.target.value) || 0)}
                      className="font-mono text-right"
                      placeholder="0"
                      data-testid="input-act-sqft"
                    />
                  </div>
                  
                  {actSqft > 0 && (
                    <div className="w-28 text-right">
                      <span className="font-mono text-sm font-semibold text-primary">
                        ${actTotal.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
        {SERVICES.map((service) => {
          const quantity = services[service.id] || 0;
          const total = quantity * service.rate;
          
          return (
            <Card key={service.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor={service.id} className="text-sm font-medium">
                    {service.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${service.rate.toLocaleString()} {service.unit}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <Input
                      id={service.id}
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => onServiceChange(service.id, parseInt(e.target.value) || 0)}
                      className="font-mono text-right"
                      placeholder="0"
                      data-testid={`input-service-${service.id}`}
                    />
                  </div>
                  
                  {quantity > 0 && (
                    <div className="w-28 text-right">
                      <span className="font-mono text-sm font-semibold text-primary">
                        ${total.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                id="expeditedService"
                checked={services.expeditedService > 0}
                onCheckedChange={(checked) => onServiceChange("expeditedService", checked ? 1 : 0)}
                data-testid="checkbox-expedited-service"
              />
              <div>
                <Label htmlFor="expeditedService" className="text-sm font-medium cursor-pointer">
                  Expedited Service
                </Label>
                <p className="text-xs text-muted-foreground">
                  +20% of total (buys 1 week)
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const SERVICES = [
  { id: "georeferencing", label: "Georeferencing", rate: 500, unit: "per unit" },
  { id: "cadDeliverable", label: "CAD Deliverable (PDF & DWG)", rate: 750, unit: "per set" },
  { id: "matterport", label: "Matterport Virtual Tours", rate: 150, unit: "per unit" },
  { id: "expeditedService", label: "Expedited Service", rate: 2000, unit: "rush fee" },
];

interface AdditionalServicesProps {
  services: Record<string, number>;
  onServiceChange: (serviceId: string, quantity: number) => void;
}

export default function AdditionalServices({ services, onServiceChange }: AdditionalServicesProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Additional Services</h3>
      
      <div className="grid gap-4">
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
      </div>
    </div>
  );
}

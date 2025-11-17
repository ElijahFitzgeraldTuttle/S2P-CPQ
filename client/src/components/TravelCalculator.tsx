import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const DISPATCH_LOCATIONS = [
  { value: "troy", label: "Troy, NY" },
  { value: "woodstock", label: "Woodstock, NY" },
  { value: "brooklyn", label: "Brooklyn, NY" },
];

interface TravelCalculatorProps {
  dispatchLocation: string;
  projectAddress: string;
  distance: number | null;
  isCalculating: boolean;
  onDispatchChange: (value: string) => void;
  onAddressChange: (value: string) => void;
}

export default function TravelCalculator({
  dispatchLocation,
  projectAddress,
  distance,
  isCalculating,
  onDispatchChange,
  onAddressChange,
}: TravelCalculatorProps) {
  const travelCost = distance ? distance * 1.5 : 0;
  const scanDayFee = distance && distance > 100 ? 500 : 0;
  const totalTravel = travelCost + scanDayFee;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Travel Calculation</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dispatch" className="text-sm font-medium">
              Dispatch Location
            </Label>
            <Select value={dispatchLocation} onValueChange={onDispatchChange}>
              <SelectTrigger id="dispatch" data-testid="select-dispatch">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISPATCH_LOCATIONS.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-address" className="text-sm font-medium">
              Project Address
            </Label>
            <Input
              id="project-address"
              placeholder="Enter project address"
              value={projectAddress}
              onChange={(e) => onAddressChange(e.target.value)}
              data-testid="input-project-address"
            />
          </div>
        </div>

        {isCalculating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Calculating distance...
          </div>
        )}

        {distance !== null && !isCalculating && (
          <div className="space-y-2 p-3 bg-accent rounded-md">
            <div className="flex justify-between text-sm">
              <span>Distance:</span>
              <span className="font-mono font-semibold">{distance} miles</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Mileage ($1.50/mi):</span>
              <span className="font-mono">${travelCost.toFixed(2)}</span>
            </div>
            {scanDayFee > 0 && (
              <div className="flex justify-between text-sm">
                <span>Scan Day Fee (over 100mi):</span>
                <span className="font-mono">${scanDayFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold pt-2 border-t">
              <span>Total Travel Cost:</span>
              <span className="font-mono text-primary">${totalTravel.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

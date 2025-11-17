import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, Navigation } from "lucide-react";

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
  onCalculate: () => void;
}

export default function TravelCalculator({
  dispatchLocation,
  projectAddress,
  distance,
  isCalculating,
  onDispatchChange,
  onAddressChange,
  onCalculate,
}: TravelCalculatorProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Travel Calculation</h3>
          <p className="text-sm text-muted-foreground">
            Calculate distance from dispatch location to project site
          </p>
        </div>
        
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

        <Button 
          onClick={onCalculate} 
          disabled={isCalculating || !projectAddress}
          data-testid="button-calculate-distance"
          className="w-full"
        >
          {isCalculating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4 mr-2" />
              Calculate Distance
            </>
          )}
        </Button>

        {distance !== null && !isCalculating && (
          <div className="space-y-2 p-4 bg-accent rounded-md">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Calculated Distance:</span>
              <span className="font-mono font-semibold">{distance} miles</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

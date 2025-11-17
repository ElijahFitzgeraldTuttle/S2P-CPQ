import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScopingFieldsProps {
  data: {
    buildingAge: string;
    floorsAbove: string;
    floorsBelow: string;
    elevatorCount: string;
    parkingSpaces: string;
    occupancyStatus: string;
    accessRestrictions: string;
    safetyRequirements: string;
    deliverables: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function ScopingFields({ data, onChange }: ScopingFieldsProps) {
  return (
    <div className="space-y-6">
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Extended Project Information</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="building-age" className="text-sm font-medium">
              Building Age (years)
            </Label>
            <Input
              id="building-age"
              type="number"
              placeholder="e.g., 25"
              value={data.buildingAge}
              onChange={(e) => onChange('buildingAge', e.target.value)}
              data-testid="input-building-age"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="elevator-count" className="text-sm font-medium">
              Number of Elevators
            </Label>
            <Input
              id="elevator-count"
              type="number"
              placeholder="0"
              value={data.elevatorCount}
              onChange={(e) => onChange('elevatorCount', e.target.value)}
              data-testid="input-elevator-count"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="floors-above" className="text-sm font-medium">
              Floors Above Grade
            </Label>
            <Input
              id="floors-above"
              type="number"
              placeholder="0"
              value={data.floorsAbove}
              onChange={(e) => onChange('floorsAbove', e.target.value)}
              data-testid="input-floors-above"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="floors-below" className="text-sm font-medium">
              Floors Below Grade
            </Label>
            <Input
              id="floors-below"
              type="number"
              placeholder="0"
              value={data.floorsBelow}
              onChange={(e) => onChange('floorsBelow', e.target.value)}
              data-testid="input-floors-below"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parking-spaces" className="text-sm font-medium">
              Parking Spaces
            </Label>
            <Input
              id="parking-spaces"
              type="number"
              placeholder="0"
              value={data.parkingSpaces}
              onChange={(e) => onChange('parkingSpaces', e.target.value)}
              data-testid="input-parking-spaces"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupancy-status" className="text-sm font-medium">
              Occupancy Status
            </Label>
            <Select value={data.occupancyStatus} onValueChange={(val) => onChange('occupancyStatus', val)}>
              <SelectTrigger id="occupancy-status" data-testid="select-occupancy">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="partially-occupied">Partially Occupied</SelectItem>
                <SelectItem value="fully-occupied">Fully Occupied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Access & Safety</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-restrictions" className="text-sm font-medium">
              Access Restrictions
            </Label>
            <Textarea
              id="access-restrictions"
              placeholder="Describe any access limitations, security requirements, or scheduling constraints..."
              value={data.accessRestrictions}
              onChange={(e) => onChange('accessRestrictions', e.target.value)}
              rows={3}
              data-testid="textarea-access-restrictions"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="safety-requirements" className="text-sm font-medium">
              Safety Requirements
            </Label>
            <Textarea
              id="safety-requirements"
              placeholder="Special safety protocols, PPE requirements, certifications needed..."
              value={data.safetyRequirements}
              onChange={(e) => onChange('safetyRequirements', e.target.value)}
              rows={3}
              data-testid="textarea-safety-requirements"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Deliverables</h3>
        
        <div className="space-y-2">
          <Label htmlFor="deliverables" className="text-sm font-medium">
            Expected Deliverables & Formats
          </Label>
          <Textarea
            id="deliverables"
            placeholder="List expected deliverables (e.g., Revit models, CAD files, point clouds, PDF drawings)..."
            value={data.deliverables}
            onChange={(e) => onChange('deliverables', e.target.value)}
            rows={4}
            data-testid="textarea-deliverables"
          />
        </div>
      </Card>

      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">File Uploads</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload existing plans, surveys, photos, or other reference materials
        </p>
        
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover-elevate cursor-pointer transition-colors">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground">PDF, CAD, images (max 50MB each)</p>
          <Button variant="outline" size="sm" className="mt-4" data-testid="button-upload-files">
            Choose Files
          </Button>
        </div>
      </Card>
    </div>
  );
}

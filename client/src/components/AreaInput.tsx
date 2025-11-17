import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const BUILDING_TYPES = [
  { value: "1", label: "Residential - Single Family" },
  { value: "2", label: "Residential - Multi Family" },
  { value: "3", label: "Residential - Luxury" },
  { value: "4", label: "Commercial / Office" },
  { value: "5", label: "Retail / Restaurants" },
  { value: "6", label: "Kitchen / Catering Facilities" },
  { value: "7", label: "Education" },
  { value: "8", label: "Hotel / Theatre / Museum" },
  { value: "9", label: "Hospitals / Mixed Use" },
  { value: "10", label: "Mechanical / Utility Rooms" },
  { value: "11", label: "Warehouse / Storage" },
  { value: "12", label: "Religious Buildings" },
  { value: "13", label: "Infrastructure / Roads / Bridges" },
  { value: "14", label: "Landscape" },
];

const PROJECT_SCOPES = [
  { value: "full", label: "Full Building" },
  { value: "interior", label: "Interior Only" },
  { value: "exterior", label: "Exterior Only" },
  { value: "roof", label: "Roof/Facades Only" },
];

interface Area {
  id: string;
  name: string;
  buildingType: string;
  squareFeet: string;
  scope: string;
}

interface AreaInputProps {
  area: Area;
  index: number;
  onChange: (id: string, field: keyof Area, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export default function AreaInput({ area, index, onChange, onRemove, canRemove }: AreaInputProps) {
  const isLandscape = area.buildingType === "14";
  
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Area {index + 1}</h4>
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(area.id)}
              data-testid={`button-remove-area-${index}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`area-building-type-${area.id}`} className="text-sm font-medium">
            Building Type
          </Label>
          <Select value={area.buildingType} onValueChange={(value) => onChange(area.id, 'buildingType', value)}>
            <SelectTrigger id={`area-building-type-${area.id}`} data-testid={`select-area-building-type-${index}`}>
              <SelectValue placeholder="Select building type" />
            </SelectTrigger>
            <SelectContent>
              {BUILDING_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`area-name-${area.id}`} className="text-sm font-medium">
              Area Name
            </Label>
            <Input
              id={`area-name-${area.id}`}
              placeholder="e.g., Main Building"
              value={area.name}
              onChange={(e) => onChange(area.id, 'name', e.target.value)}
              data-testid={`input-area-name-${index}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`area-sqft-${area.id}`} className="text-sm font-medium">
              {isLandscape ? "Acres" : "Square Footage"}
            </Label>
            <Input
              id={`area-sqft-${area.id}`}
              type="number"
              placeholder="0"
              value={area.squareFeet}
              onChange={(e) => onChange(area.id, 'squareFeet', e.target.value)}
              className="font-mono"
              data-testid={`input-area-sqft-${index}`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`area-scope-${area.id}`} className="text-sm font-medium">
            Project Scope
          </Label>
          <Select value={area.scope} onValueChange={(value) => onChange(area.id, 'scope', value)}>
            <SelectTrigger id={`area-scope-${area.id}`} data-testid={`select-area-scope-${index}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_SCOPES.map((scope) => (
                <SelectItem key={scope.value} value={scope.value}>
                  {scope.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const DISCIPLINES = [
  { id: "architecture", label: "Architecture", description: "Building modeling" },
  { id: "structure", label: "Structure", description: "Structural elements" },
  { id: "mepf", label: "MEPF", description: "Mechanical, Electrical, Plumbing, Fire" },
  { id: "site", label: "Site/Topography", description: "Site work and grading" },
];

const LOD_LEVELS = [
  { value: "200", label: "LOD 200", description: "Conceptual design" },
  { value: "300", label: "LOD 300", description: "Detailed design" },
  { value: "350", label: "LOD 350", description: "Construction documentation" },
];

interface DisciplineSelectorProps {
  selectedDisciplines: string[];
  lodLevel: string;
  onDisciplineChange: (disciplineId: string, checked: boolean) => void;
  onLodChange: (value: string) => void;
}

export default function DisciplineSelector({
  selectedDisciplines,
  lodLevel,
  onDisciplineChange,
  onLodChange,
}: DisciplineSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Disciplines & LOD</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {DISCIPLINES.map((discipline) => {
            const isSelected = selectedDisciplines.includes(discipline.id);
            return (
              <Card
                key={discipline.id}
                className={`p-4 cursor-pointer transition-colors hover-elevate ${
                  isSelected ? "border-primary bg-accent" : ""
                }`}
                onClick={() => onDisciplineChange(discipline.id, !isSelected)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={discipline.id}
                    checked={isSelected}
                    onCheckedChange={(checked) => onDisciplineChange(discipline.id, checked as boolean)}
                    data-testid={`checkbox-discipline-${discipline.id}`}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={discipline.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {discipline.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {discipline.description}
                    </p>
                    {isSelected && (
                      <p className="text-xs text-primary font-mono mt-2">
                        Est. $2.50/sqft
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lod-level" className="text-sm font-medium">
          Level of Development (LOD)
        </Label>
        <Select value={lodLevel} onValueChange={onLodChange}>
          <SelectTrigger id="lod-level" data-testid="select-lod">
            <SelectValue placeholder="Select LOD level" />
          </SelectTrigger>
          <SelectContent>
            {LOD_LEVELS.map((lod) => (
              <SelectItem key={lod.value} value={lod.value}>
                <div className="flex flex-col">
                  <span>{lod.label}</span>
                  <span className="text-xs text-muted-foreground">{lod.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

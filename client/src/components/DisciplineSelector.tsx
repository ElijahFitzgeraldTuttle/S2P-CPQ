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
  disciplineLods: Record<string, string>;
  onDisciplineChange: (disciplineId: string, checked: boolean) => void;
  onLodChange: (disciplineId: string, value: string) => void;
}

export default function DisciplineSelector({
  selectedDisciplines,
  disciplineLods,
  onDisciplineChange,
  onLodChange,
}: DisciplineSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Disciplines & Level of Detail</h3>
      
      <div className="space-y-3">
        {DISCIPLINES.map((discipline) => {
          const isSelected = selectedDisciplines.includes(discipline.id);
          const lodValue = disciplineLods[discipline.id] || "300";
          
          return (
            <Card
              key={discipline.id}
              className={`p-4 transition-colors ${
                isSelected ? "border-primary bg-accent" : ""
              }`}
            >
              <div className="space-y-3">
                <div 
                  className="flex items-start gap-3 cursor-pointer hover-elevate rounded p-2 -m-2"
                  onClick={() => onDisciplineChange(discipline.id, !isSelected)}
                >
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

                {isSelected && (
                  <div className="space-y-2 pl-8">
                    <Label htmlFor={`lod-${discipline.id}`} className="text-sm font-medium">
                      Level of Detail (LOD)
                    </Label>
                    <Select 
                      value={lodValue} 
                      onValueChange={(value) => onLodChange(discipline.id, value)}
                    >
                      <SelectTrigger id={`lod-${discipline.id}`} data-testid={`select-lod-${discipline.id}`}>
                        <SelectValue />
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
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

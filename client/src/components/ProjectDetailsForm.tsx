import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjectDetailsFormProps {
  clientName: string;
  projectName: string;
  projectAddress: string;
  specificBuilding: string;
  typeOfBuilding: string;
  notes: string;
  onFieldChange: (field: string, value: string) => void;
}

export default function ProjectDetailsForm({
  clientName,
  projectName,
  projectAddress,
  specificBuilding,
  typeOfBuilding,
  notes,
  onFieldChange,
}: ProjectDetailsFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Project Details</h3>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client-name" className="text-sm font-medium">
            Client Name
          </Label>
          <Input
            id="client-name"
            placeholder="Optional"
            value={clientName}
            onChange={(e) => onFieldChange('clientName', e.target.value)}
            data-testid="input-client-name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-name" className="text-sm font-medium">
            Project Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="project-name"
            placeholder="Required"
            value={projectName}
            onChange={(e) => onFieldChange('projectName', e.target.value)}
            required
            data-testid="input-project-name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-address" className="text-sm font-medium">
          Project Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="project-address"
          placeholder="Enter full project address"
          value={projectAddress}
          onChange={(e) => onFieldChange('projectAddress', e.target.value)}
          required
          data-testid="input-project-address"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="specific-building" className="text-sm font-medium">
            Specific Building or Unit?
          </Label>
          <Input
            id="specific-building"
            placeholder="Enter building or unit details"
            value={specificBuilding}
            onChange={(e) => onFieldChange('specificBuilding', e.target.value)}
            data-testid="input-specific-building"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type-of-building" className="text-sm font-medium">
            Type of Building <span className="text-destructive">*</span>
          </Label>
          <Input
            id="type-of-building"
            placeholder="e.g., Commercial Office, Residential, etc."
            value={typeOfBuilding}
            onChange={(e) => onFieldChange('typeOfBuilding', e.target.value)}
            required
            data-testid="input-type-of-building"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">
          Project Notes
        </Label>
        <Textarea
          id="notes"
          placeholder="Add any special requirements or notes..."
          value={notes}
          onChange={(e) => onFieldChange('notes', e.target.value)}
          rows={4}
          data-testid="textarea-notes"
        />
      </div>
    </div>
  );
}

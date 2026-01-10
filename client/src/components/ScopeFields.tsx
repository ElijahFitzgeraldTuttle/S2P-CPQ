import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import FileUpload from "./FileUpload";

interface ScopeFieldsProps {
  data: {
    bimDeliverable: string[];
    bimDeliverableOther: string;
    bimVersion: string;
    customTemplate: string;
    customTemplateOther: string;
    customTemplateFiles: any[];
    sqftAssumptions: string;
    sqftAssumptionsFiles: any[];
    projectNotes: string;
    scopingDocuments: any[];
    mixedScope: string;
    insuranceRequirements: string;
    estimatedTimeline: string;
    timelineNotes: string;
  };
  projectDetails: {
    hasBasement: boolean;
    hasAttic: boolean;
    notes: string;
  };
  onChange: (field: string, value: any) => void;
  onProjectDetailChange: (field: string, value: string | boolean) => void;
}

export default function ScopeFields({ data, projectDetails, onChange, onProjectDetailChange }: ScopeFieldsProps) {
  const handleCheckboxArrayChange = (field: string, value: string, checked: boolean) => {
    const currentValues = (data[field as keyof typeof data] as string[]) || [];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    onChange(field, newValues);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Building Features</h3>
        <div className="space-y-4">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="has-basement"
                checked={projectDetails.hasBasement}
                onCheckedChange={(checked) => onProjectDetailChange('hasBasement', checked as boolean)}
                data-testid="checkbox-basement"
              />
              <Label htmlFor="has-basement" className="cursor-pointer font-normal">
                Has Basement
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="has-attic"
                checked={projectDetails.hasAttic}
                onCheckedChange={(checked) => onProjectDetailChange('hasAttic', checked as boolean)}
                data-testid="checkbox-attic"
              />
              <Label htmlFor="has-attic" className="cursor-pointer font-normal">
                Has Attic
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Project Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any special requirements or notes..."
              value={projectDetails.notes}
              onChange={(e) => onProjectDetailChange('notes', e.target.value)}
              rows={3}
              data-testid="textarea-notes"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Deliverables</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              BIM Deliverable Format
            </Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {['Revit', 'Archicad', 'Sketchup', 'Rhino', 'Other'].map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={`bim-${option}`}
                    checked={(data.bimDeliverable || []).includes(option)}
                    onCheckedChange={(checked) => handleCheckboxArrayChange('bimDeliverable', option, checked as boolean)}
                    data-testid={`checkbox-bim-${option.toLowerCase()}`}
                  />
                  <Label htmlFor={`bim-${option}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {(data.bimDeliverable || []).includes('Other') && (
              <Input
                placeholder="Specify other format"
                value={data.bimDeliverableOther}
                onChange={(e) => onChange('bimDeliverableOther', e.target.value)}
                className="mt-2"
                data-testid="input-bim-other"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bim-version" className="text-sm font-medium">
              BIM Version
            </Label>
            <Input
              id="bim-version"
              placeholder="e.g., Revit 2024"
              value={data.bimVersion}
              onChange={(e) => onChange('bimVersion', e.target.value)}
              data-testid="input-bim-version"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Custom Template?
            </Label>
            <RadioGroup value={data.customTemplate} onValueChange={(val) => onChange('customTemplate', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="template-yes" data-testid="radio-template-yes" />
                <Label htmlFor="template-yes" className="cursor-pointer">Yes, will provide</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="template-no" data-testid="radio-template-no" />
                <Label htmlFor="template-no" className="cursor-pointer">No, use Scan2Plan standard</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="template-other" data-testid="radio-template-other" />
                <Label htmlFor="template-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.customTemplate === 'other' && (
              <Input
                placeholder="Specify other"
                value={data.customTemplateOther}
                onChange={(e) => onChange('customTemplateOther', e.target.value)}
                className="mt-2"
                data-testid="input-template-other"
              />
            )}
          </div>

          {data.customTemplate === 'yes' && (
            <FileUpload
              label="Upload Template"
              files={data.customTemplateFiles || []}
              onChange={(files) => onChange('customTemplateFiles', files)}
            />
          )}
        </div>
      </Card>

      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Scope Assumptions</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sqft-assumptions" className="text-sm font-medium">
              Square Footage Assumptions
            </Label>
            <Textarea
              id="sqft-assumptions"
              placeholder="Document any assumptions about square footage..."
              value={data.sqftAssumptions}
              onChange={(e) => onChange('sqftAssumptions', e.target.value)}
              rows={3}
              data-testid="textarea-sqft-assumptions"
            />
            <FileUpload
              label="Upload Supporting Documents"
              files={data.sqftAssumptionsFiles || []}
              onChange={(files) => onChange('sqftAssumptionsFiles', files)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-project-notes" className="text-sm font-medium">
              Additional Project Notes
            </Label>
            <Textarea
              id="additional-project-notes"
              placeholder="Any other project notes..."
              value={data.projectNotes}
              onChange={(e) => onChange('projectNotes', e.target.value)}
              rows={4}
              data-testid="textarea-project-notes"
            />
            <FileUpload
              label="Upload Scoping Documents"
              files={data.scopingDocuments || []}
              onChange={(files) => onChange('scopingDocuments', files)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mixed-scope" className="text-sm font-medium">
              Mixed Scope Details
            </Label>
            <Input
              id="mixed-scope"
              placeholder="Describe any mixed scope considerations"
              value={data.mixedScope}
              onChange={(e) => onChange('mixedScope', e.target.value)}
              data-testid="input-mixed-scope"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insurance-requirements" className="text-sm font-medium">
              Insurance Requirements
            </Label>
            <Textarea
              id="insurance-requirements"
              placeholder="Document any special insurance requirements..."
              value={data.insuranceRequirements}
              onChange={(e) => onChange('insuranceRequirements', e.target.value)}
              rows={2}
              data-testid="textarea-insurance"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Estimated Timeline
            </Label>
            <RadioGroup value={data.estimatedTimeline} onValueChange={(val) => onChange('estimatedTimeline', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1week" id="timeline-1week" data-testid="radio-timeline-1week" />
                <Label htmlFor="timeline-1week" className="cursor-pointer">~1 week</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2weeks" id="timeline-2weeks" data-testid="radio-timeline-2weeks" />
                <Label htmlFor="timeline-2weeks" className="cursor-pointer">~2 weeks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3weeks" id="timeline-3weeks" data-testid="radio-timeline-3weeks" />
                <Label htmlFor="timeline-3weeks" className="cursor-pointer">~3 weeks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4weeks" id="timeline-4weeks" data-testid="radio-timeline-4weeks" />
                <Label htmlFor="timeline-4weeks" className="cursor-pointer">~4 weeks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5weeks" id="timeline-5weeks" data-testid="radio-timeline-5weeks" />
                <Label htmlFor="timeline-5weeks" className="cursor-pointer">~5 weeks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="6weeks" id="timeline-6weeks" data-testid="radio-timeline-6weeks" />
                <Label htmlFor="timeline-6weeks" className="cursor-pointer">~6 weeks</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline-notes" className="text-sm font-medium">
              Timeline Notes
            </Label>
            <Textarea
              id="timeline-notes"
              placeholder="Additional notes about project timeline..."
              value={data.timelineNotes}
              onChange={(e) => onChange('timelineNotes', e.target.value)}
              rows={3}
              data-testid="textarea-timeline-notes"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

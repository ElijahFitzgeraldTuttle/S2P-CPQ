import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ScopingFieldsProps {
  data: {
    gradeAroundBuilding: string;
    gradeOther: string;
    interiorCadElevations: string;
    aboveBelowACT: string;
    aboveBelowACTOther: string;
    actSqft: string;
    bimDeliverable: string[];
    bimDeliverableOther: string;
    bimVersion: string;
    customTemplate: string;
    customTemplateOther: string;
    sqftAssumptions: string;
    assumedGrossMargin: string;
    caveatsProfitability: string;
    projectNotes: string;
    mixedScope: string;
    insuranceRequirements: string;
    tierAScanningCost: string;
    tierAScanningCostOther: string;
    tierAModelingCost: string;
    tierAMargin: string;
    estimatedTimeline: string;
    timelineOther: string;
    timelineNotes: string;
    paymentTerms: string;
    paymentTermsOther: string;
    paymentNotes: string;
    accountContact: string;
    designProContact: string;
    otherContact: string;
    proofLinks: string;
    source: string;
    sourceNote: string;
    assist: string;
    probabilityOfClosing: string;
    projectStatus: string;
    projectStatusOther: string;
  };
  onChange: (field: string, value: any) => void;
}

export default function ScopingFields({ data, onChange }: ScopingFieldsProps) {
  const handleCheckboxArrayChange = (field: string, value: string, checked: boolean) => {
    const currentValues = (data[field as keyof typeof data] as string[]) || [];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    onChange(field, newValues);
  };

  return (
    <div className="space-y-6">
      {/* Site & Landscape */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Site & Landscape</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Grade Around Building? (~20' topography)
            </Label>
            <RadioGroup value={data.gradeAroundBuilding} onValueChange={(val) => onChange('gradeAroundBuilding', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="grade-yes" />
                <Label htmlFor="grade-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="grade-no" />
                <Label htmlFor="grade-no" className="cursor-pointer">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="grade-other" />
                <Label htmlFor="grade-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.gradeAroundBuilding === 'other' && (
              <Input
                placeholder="Specify other"
                value={data.gradeOther}
                onChange={(e) => onChange('gradeOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        </div>
      </Card>

      {/* Deliverables */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Deliverables</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interior-cad-elevations" className="text-sm font-medium">
              Interior CAD Elevations? How Many?
            </Label>
            <Input
              id="interior-cad-elevations"
              type="number"
              placeholder="0"
              value={data.interiorCadElevations}
              onChange={(e) => onChange('interiorCadElevations', e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Scanning & Modeling above and below Acoustic Ceiling Tile? (where appropriate)
            </Label>
            <RadioGroup value={data.aboveBelowACT} onValueChange={(val) => onChange('aboveBelowACT', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="act-yes" />
                <Label htmlFor="act-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="act-no" />
                <Label htmlFor="act-no" className="cursor-pointer">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="act-other" />
                <Label htmlFor="act-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.aboveBelowACT === 'other' && (
              <Input
                placeholder="Specify other"
                value={data.aboveBelowACTOther}
                onChange={(e) => onChange('aboveBelowACTOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {data.aboveBelowACT === 'yes' && (
            <div className="space-y-2">
              <Label htmlFor="act-sqft" className="text-sm font-medium">
                Scope of ACT (sqft)
              </Label>
              <Input
                id="act-sqft"
                type="number"
                placeholder="0"
                value={data.actSqft}
                onChange={(e) => onChange('actSqft', e.target.value)}
                className="font-mono"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              BIM Deliverable
            </Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {['Revit', 'Archicad', 'Sketchup', 'Rhino', 'Other'].map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={`bim-${option}`}
                    checked={(data.bimDeliverable || []).includes(option)}
                    onCheckedChange={(checked) => handleCheckboxArrayChange('bimDeliverable', option, checked as boolean)}
                  />
                  <Label htmlFor={`bim-${option}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {(data.bimDeliverable || []).includes('Other') && (
              <Input
                placeholder="Specify other"
                value={data.bimDeliverableOther}
                onChange={(e) => onChange('bimDeliverableOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bim-version" className="text-sm font-medium">
              Which BIM Version?
            </Label>
            <Input
              id="bim-version"
              placeholder="e.g., Revit 2024"
              value={data.bimVersion}
              onChange={(e) => onChange('bimVersion', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Custom Template?
            </Label>
            <RadioGroup value={data.customTemplate} onValueChange={(val) => onChange('customTemplate', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="template-yes" />
                <Label htmlFor="template-yes" className="cursor-pointer">Yes, will provide</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="template-no" />
                <Label htmlFor="template-no" className="cursor-pointer">No, use Scan2Plan standard</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="template-other" />
                <Label htmlFor="template-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.customTemplate === 'other' && (
              <Input
                placeholder="Specify other"
                value={data.customTemplateOther}
                onChange={(e) => onChange('customTemplateOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {data.customTemplate === 'yes' && (
            <div>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Template
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Internal Notes & Assumptions */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Internal Notes & Assumptions</h3>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assumed-margin" className="text-sm font-medium">
              Assumed Gross Margin
            </Label>
            <Input
              id="assumed-margin"
              placeholder="e.g., 30%"
              value={data.assumedGrossMargin}
              onChange={(e) => onChange('assumedGrossMargin', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caveats-profitability" className="text-sm font-medium">
              Caveats for Profitability
            </Label>
            <Textarea
              id="caveats-profitability"
              placeholder="Note any factors that could affect profitability..."
              value={data.caveatsProfitability}
              onChange={(e) => onChange('caveatsProfitability', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-notes" className="text-sm font-medium">
              Additional Project Notes
            </Label>
            <Textarea
              id="project-notes"
              placeholder="Any other internal notes..."
              value={data.projectNotes}
              onChange={(e) => onChange('projectNotes', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mixed-scope" className="text-sm font-medium">
              Mixed Scope?
            </Label>
            <Input
              id="mixed-scope"
              placeholder="Describe any mixed scope considerations"
              value={data.mixedScope}
              onChange={(e) => onChange('mixedScope', e.target.value)}
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
            />
          </div>
        </div>
      </Card>

      {/* Tier A Pricing */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Tier A Pricing (Internal)</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Tier A - Scanning Cost
            </Label>
            <RadioGroup value={data.tierAScanningCost} onValueChange={(val) => onChange('tierAScanningCost', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="tier-scan-low" />
                <Label htmlFor="tier-scan-low" className="cursor-pointer">Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="tier-scan-medium" />
                <Label htmlFor="tier-scan-medium" className="cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="tier-scan-high" />
                <Label htmlFor="tier-scan-high" className="cursor-pointer">High</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="tier-scan-other" />
                <Label htmlFor="tier-scan-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.tierAScanningCost === 'other' && (
              <Input
                placeholder="Specify scanning cost"
                value={data.tierAScanningCostOther}
                onChange={(e) => onChange('tierAScanningCostOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier-modeling-cost" className="text-sm font-medium">
              Tier A - Modeling Cost
            </Label>
            <Input
              id="tier-modeling-cost"
              placeholder="Enter modeling cost"
              value={data.tierAModelingCost}
              onChange={(e) => onChange('tierAModelingCost', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier-margin" className="text-sm font-medium">
              Tier A - Margin
            </Label>
            <Input
              id="tier-margin"
              placeholder="e.g., 25%"
              value={data.tierAMargin}
              onChange={(e) => onChange('tierAMargin', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Project Timeline */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Estimated Timeline
            </Label>
            <RadioGroup value={data.estimatedTimeline} onValueChange={(val) => onChange('estimatedTimeline', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1-2weeks" id="timeline-1-2" />
                <Label htmlFor="timeline-1-2" className="cursor-pointer">1-2 weeks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3-4weeks" id="timeline-3-4" />
                <Label htmlFor="timeline-3-4" className="cursor-pointer">3-4 weeks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1-2months" id="timeline-1-2m" />
                <Label htmlFor="timeline-1-2m" className="cursor-pointer">1-2 months</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="timeline-other" />
                <Label htmlFor="timeline-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.estimatedTimeline === 'other' && (
              <Input
                placeholder="Specify timeline"
                value={data.timelineOther}
                onChange={(e) => onChange('timelineOther', e.target.value)}
                className="mt-2"
              />
            )}
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
            />
          </div>
        </div>
      </Card>

      {/* Payment Terms */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Payment Terms</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Payment Terms
            </Label>
            <RadioGroup value={data.paymentTerms} onValueChange={(val) => onChange('paymentTerms', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="net30" id="payment-net30" />
                <Label htmlFor="payment-net30" className="cursor-pointer">Net 30</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="net60" id="payment-net60" />
                <Label htmlFor="payment-net60" className="cursor-pointer">Net 60</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="50-50" id="payment-50-50" />
                <Label htmlFor="payment-50-50" className="cursor-pointer">50% upfront, 50% on delivery</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="payment-other" />
                <Label htmlFor="payment-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.paymentTerms === 'other' && (
              <Input
                placeholder="Specify payment terms"
                value={data.paymentTermsOther}
                onChange={(e) => onChange('paymentTermsOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-notes" className="text-sm font-medium">
              Payment Notes
            </Label>
            <Textarea
              id="payment-notes"
              placeholder="Additional payment-related notes..."
              value={data.paymentNotes}
              onChange={(e) => onChange('paymentNotes', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Contacts & Communication */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Contacts & Communication</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-contact" className="text-sm font-medium">
              Account Contact
            </Label>
            <Input
              id="account-contact"
              placeholder="Primary account contact"
              value={data.accountContact}
              onChange={(e) => onChange('accountContact', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="design-pro-contact" className="text-sm font-medium">
              Design Pro Contact
            </Label>
            <Input
              id="design-pro-contact"
              placeholder="Design professional contact"
              value={data.designProContact}
              onChange={(e) => onChange('designProContact', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="other-contact" className="text-sm font-medium">
              Other Contact
            </Label>
            <Input
              id="other-contact"
              placeholder="Additional contacts"
              value={data.otherContact}
              onChange={(e) => onChange('otherContact', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof-links" className="text-sm font-medium">
              Proof Links
            </Label>
            <Textarea
              id="proof-links"
              placeholder="Links to proof documents, photos, etc..."
              value={data.proofLinks}
              onChange={(e) => onChange('proofLinks', e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Lead Tracking */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Lead Tracking</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source" className="text-sm font-medium">
              Source
            </Label>
            <Input
              id="source"
              placeholder="How did this lead come in?"
              value={data.source}
              onChange={(e) => onChange('source', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source-note" className="text-sm font-medium">
              Source Note
            </Label>
            <Textarea
              id="source-note"
              placeholder="Additional details about the source..."
              value={data.sourceNote}
              onChange={(e) => onChange('sourceNote', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assist" className="text-sm font-medium">
              Assist
            </Label>
            <Input
              id="assist"
              placeholder="Who assisted with this lead?"
              value={data.assist}
              onChange={(e) => onChange('assist', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="probability-closing" className="text-sm font-medium">
              Probability of Closing
            </Label>
            <Select value={data.probabilityOfClosing} onValueChange={(val) => onChange('probabilityOfClosing', val)}>
              <SelectTrigger id="probability-closing">
                <SelectValue placeholder="Select probability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High (70-100%)</SelectItem>
                <SelectItem value="medium">Medium (40-70%)</SelectItem>
                <SelectItem value="low">Low (0-40%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Project Status
            </Label>
            <RadioGroup value={data.projectStatus} onValueChange={(val) => onChange('projectStatus', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quoted" id="status-quoted" />
                <Label htmlFor="status-quoted" className="cursor-pointer">Quoted</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="won" id="status-won" />
                <Label htmlFor="status-won" className="cursor-pointer">Won</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lost" id="status-lost" />
                <Label htmlFor="status-lost" className="cursor-pointer">Lost</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="status-pending" />
                <Label htmlFor="status-pending" className="cursor-pointer">Pending</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="status-other" />
                <Label htmlFor="status-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.projectStatus === 'other' && (
              <Input
                placeholder="Specify status"
                value={data.projectStatusOther}
                onChange={(e) => onChange('projectStatusOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

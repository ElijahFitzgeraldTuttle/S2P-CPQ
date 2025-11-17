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
    specificBuilding: string;
    typeOfBuilding: string;
    estimatedSqft: string;
    intExt: string;
    intExtOther: string;
    lodStandard: string;
    lodStandardOther: string;
    basementAttic: string[];
    basementAtticOther: string;
    basementAtticSqft: string;
    structuralModeling: string;
    structuralModelingOther: string;
    structuralSqft: string;
    mepfModeling: string;
    mepfModelingOther: string;
    mepfSqft: string;
    gradeAroundBuilding: string;
    gradeOther: string;
    landscapeModeling: string;
    landscapeOther: string;
    landscapeAcres: string;
    georeferencing: string;
    georeferencingOther: string;
    cadDeliverable: string;
    cadDeliverableOther: string;
    interiorCadElevations: string;
    matterport: string;
    matterportOther: string;
    aboveBelowACT: string;
    aboveBelowACTOther: string;
    actSqft: string;
    bimDeliverable: string[];
    bimDeliverableOther: string;
    bimVersion: string;
    customTemplate: string;
    customTemplateOther: string;
    riskFactors: string[];
    expeditedService: string;
    expeditedServiceOther: string;
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
      {/* Building Information */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Building Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specific-building" className="text-sm font-medium">
              Specific Building or Unit?
            </Label>
            <Input
              id="specific-building"
              placeholder="Enter building or unit details"
              value={data.specificBuilding}
              onChange={(e) => onChange('specificBuilding', e.target.value)}
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
              value={data.typeOfBuilding}
              onChange={(e) => onChange('typeOfBuilding', e.target.value)}
              data-testid="input-type-of-building"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated-sqft" className="text-sm font-medium">
              Estimated Total Square Footage <span className="text-destructive">*</span>
            </Label>
            <Input
              id="estimated-sqft"
              type="number"
              placeholder="0"
              value={data.estimatedSqft}
              onChange={(e) => onChange('estimatedSqft', e.target.value)}
              className="font-mono"
              data-testid="input-estimated-sqft"
            />
          </div>
        </div>
      </Card>

      {/* Scope Definition */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Scope Definition</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Int / Ext? <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={data.intExt} onValueChange={(val) => onChange('intExt', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="int-ext-full" />
                <Label htmlFor="int-ext-full" className="cursor-pointer">Full Building</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interior" id="int-ext-interior" />
                <Label htmlFor="int-ext-interior" className="cursor-pointer">Interior Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exterior" id="int-ext-exterior" />
                <Label htmlFor="int-ext-exterior" className="cursor-pointer">Exterior Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="int-ext-other" />
                <Label htmlFor="int-ext-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.intExt === 'other' && (
              <Input
                placeholder="Specify other"
                value={data.intExtOther}
                onChange={(e) => onChange('intExtOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Which LoD Standard? <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={data.lodStandard} onValueChange={(val) => onChange('lodStandard', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="200" id="lod-200" />
                <Label htmlFor="lod-200" className="cursor-pointer">LoD 200</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="300" id="lod-300" />
                <Label htmlFor="lod-300" className="cursor-pointer">LoD 300</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="350" id="lod-350" />
                <Label htmlFor="lod-350" className="cursor-pointer">LoD 350</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="350plus" id="lod-350plus" />
                <Label htmlFor="lod-350plus" className="cursor-pointer">LoD 350+</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="lod-other" />
                <Label htmlFor="lod-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.lodStandard === 'other' && (
              <Input
                placeholder="Specify other LoD"
                value={data.lodStandardOther}
                onChange={(e) => onChange('lodStandardOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        </div>
      </Card>

      {/* Basement / Attic */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Basement / Attic</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Is there a Basement / Attic? <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-2">
              {['Basement', 'Attic', 'No', 'Other'].map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={`basement-attic-${option}`}
                    checked={(data.basementAttic || []).includes(option)}
                    onCheckedChange={(checked) => handleCheckboxArrayChange('basementAttic', option, checked as boolean)}
                  />
                  <Label htmlFor={`basement-attic-${option}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {(data.basementAttic || []).includes('Other') && (
              <Input
                placeholder="Specify other"
                value={data.basementAtticOther}
                onChange={(e) => onChange('basementAtticOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="basement-attic-sqft" className="text-sm font-medium">
              Estimated Sq Footage of Basement / Attic
            </Label>
            <Input
              id="basement-attic-sqft"
              type="number"
              placeholder="0"
              value={data.basementAtticSqft}
              onChange={(e) => onChange('basementAtticSqft', e.target.value)}
              className="font-mono"
            />
          </div>
        </div>
      </Card>

      {/* Discipline Scopes */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Discipline Scopes</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Structural Modeling? (for exposed Structure)
            </Label>
            <RadioGroup value={data.structuralModeling} onValueChange={(val) => onChange('structuralModeling', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="structural-yes" />
                <Label htmlFor="structural-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="structural-no" />
                <Label htmlFor="structural-no" className="cursor-pointer">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="structural-other" />
                <Label htmlFor="structural-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.structuralModeling === 'other' && (
              <Input
                placeholder="Specify other"
                value={data.structuralModelingOther}
                onChange={(e) => onChange('structuralModelingOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {data.structuralModeling === 'yes' && (
            <div className="space-y-2">
              <Label htmlFor="structural-sqft" className="text-sm font-medium">
                Scope of Structural Modeling (sqft)
              </Label>
              <Input
                id="structural-sqft"
                type="number"
                placeholder="0"
                value={data.structuralSqft}
                onChange={(e) => onChange('structuralSqft', e.target.value)}
                className="font-mono"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              MEPF Modeling? (for any visible Mechanical, Electrical, Plumbing & Fire Safety elements & systems)
            </Label>
            <RadioGroup value={data.mepfModeling} onValueChange={(val) => onChange('mepfModeling', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="mepf-yes" />
                <Label htmlFor="mepf-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="mepf-no" />
                <Label htmlFor="mepf-no" className="cursor-pointer">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="mepf-other" />
                <Label htmlFor="mepf-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.mepfModeling === 'other' && (
              <Input
                placeholder="Specify other"
                value={data.mepfModelingOther}
                onChange={(e) => onChange('mepfModelingOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {data.mepfModeling === 'yes' && (
            <div className="space-y-2">
              <Label htmlFor="mepf-sqft" className="text-sm font-medium">
                Scope of MEPF Modeling (sqft)
              </Label>
              <Input
                id="mepf-sqft"
                type="number"
                placeholder="0"
                value={data.mepfSqft}
                onChange={(e) => onChange('mepfSqft', e.target.value)}
                className="font-mono"
              />
            </div>
          )}
        </div>
      </Card>

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

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Landscape Modeling?
            </Label>
            <RadioGroup value={data.landscapeModeling} onValueChange={(val) => onChange('landscapeModeling', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lod200" id="landscape-200" />
                <Label htmlFor="landscape-200" className="cursor-pointer">Landscape LoD 200</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lod300" id="landscape-300" />
                <Label htmlFor="landscape-300" className="cursor-pointer">Landscape LoD 300</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lod350" id="landscape-350" />
                <Label htmlFor="landscape-350" className="cursor-pointer">Landscape LoD 350</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="landscape-other" />
                <Label htmlFor="landscape-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.landscapeModeling === 'other' && (
              <Input
                placeholder="Specify other"
                value={data.landscapeOther}
                onChange={(e) => onChange('landscapeOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {data.landscapeModeling && data.landscapeModeling !== 'other' && (
            <div className="space-y-2">
              <Label htmlFor="landscape-acres" className="text-sm font-medium">
                How many acres of Landscape?
              </Label>
              <Input
                id="landscape-acres"
                type="number"
                step="0.1"
                placeholder="0"
                value={data.landscapeAcres}
                onChange={(e) => onChange('landscapeAcres', e.target.value)}
                className="font-mono"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Deliverables */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Deliverables</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Georeferencing?
            </Label>
            <RadioGroup value={data.georeferencing} onValueChange={(val) => onChange('georeferencing', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="georef-yes" />
                <Label htmlFor="georef-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="georef-no" />
                <Label htmlFor="georef-no" className="cursor-pointer">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="georef-other" />
                <Label htmlFor="georef-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.georeferencing === 'other' && (
              <Input
                placeholder="Specify other"
                value={data.georeferencingOther}
                onChange={(e) => onChange('georeferencingOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              CAD Deliverable? (PDF & DWG)
            </Label>
            <RadioGroup value={data.cadDeliverable} onValueChange={(val) => onChange('cadDeliverable', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="cad-yes" />
                <Label htmlFor="cad-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="cad-no" />
                <Label htmlFor="cad-no" className="cursor-pointer">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="cad-other" />
                <Label htmlFor="cad-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.cadDeliverable === 'other' && (
              <Input
                placeholder="Specify other"
                value={data.cadDeliverableOther}
                onChange={(e) => onChange('cadDeliverableOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

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
              Matterport 3D Tour?
            </Label>
            <RadioGroup value={data.matterport} onValueChange={(val) => onChange('matterport', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="matterport-yes" />
                <Label htmlFor="matterport-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="matterport-no" />
                <Label htmlFor="matterport-no" className="cursor-pointer">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="matterport-other" />
                <Label htmlFor="matterport-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.matterport === 'other' && (
              <Input
                placeholder="Specify other"
                value={data.matterportOther}
                onChange={(e) => onChange('matterportOther', e.target.value)}
                className="mt-2"
              />
            )}
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
                Scope of aACT (sqft)
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
                placeholder="Specify other BIM software"
                value={data.bimDeliverableOther}
                onChange={(e) => onChange('bimDeliverableOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {(data.bimDeliverable || []).length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="bim-version" className="text-sm font-medium">
                Version / Year of BIM Software?
              </Label>
              <Input
                id="bim-version"
                placeholder="e.g., Revit 2024"
                value={data.bimVersion}
                onChange={(e) => onChange('bimVersion', e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Custom Template / Standard?
            </Label>
            <RadioGroup value={data.customTemplate} onValueChange={(val) => onChange('customTemplate', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="template-yes" />
                <Label htmlFor="template-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="template-no" />
                <Label htmlFor="template-no" className="cursor-pointer">No</Label>
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
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Custom Template / Standard</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover-elevate cursor-pointer">
                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Upload up to 10 files. Max 100 MB per file.</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Choose Files
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Risk Factors & Expedited */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Risk Factors & Service</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Risk Factors</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {['Occupied', 'Fire / Flood', 'No Power', 'No Lighting'].map((factor) => (
                <div key={factor} className="flex items-center gap-2">
                  <Checkbox
                    id={`risk-${factor}`}
                    checked={(data.riskFactors || []).includes(factor)}
                    onCheckedChange={(checked) => handleCheckboxArrayChange('riskFactors', factor, checked as boolean)}
                  />
                  <Label htmlFor={`risk-${factor}`} className="cursor-pointer">
                    {factor}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Expedited Service?
            </Label>
            <RadioGroup value={data.expeditedService} onValueChange={(val) => onChange('expeditedService', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="expedited-yes" />
                <Label htmlFor="expedited-yes" className="cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="expedited-no" />
                <Label htmlFor="expedited-no" className="cursor-pointer">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="expedited-other" />
                <Label htmlFor="expedited-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.expeditedService === 'other' && (
              <Input
                placeholder="Specify other"
                value={data.expeditedServiceOther}
                onChange={(e) => onChange('expeditedServiceOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        </div>
      </Card>

      {/* Documentation & Assumptions */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Documentation & Assumptions</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Upload Screen Shots for Sq Ft assumptions <span className="text-destructive">*</span>
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover-elevate cursor-pointer">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Upload up to 10 files. Max 1 GB per file.</p>
              <Button variant="outline" size="sm" className="mt-2">
                Choose Files
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sqft-assumptions" className="text-sm font-medium">
              Assumptions On Sqft Estimate
            </Label>
            <Textarea
              id="sqft-assumptions"
              placeholder="Describe assumptions made for square footage estimate..."
              value={data.sqftAssumptions}
              onChange={(e) => onChange('sqftAssumptions', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Upload Scoping Documents</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover-elevate cursor-pointer">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Upload up to 10 files. Max 10 MB per file.</p>
              <Button variant="outline" size="sm" className="mt-2">
                Choose Files
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Pricing & Margin */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Pricing & Margin</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gross-margin" className="text-sm font-medium">
              Assumed Gross Margin - & reasoning <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="gross-margin"
              placeholder="Enter assumed gross margin and reasoning..."
              value={data.assumedGrossMargin}
              onChange={(e) => onChange('assumedGrossMargin', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caveats-profitability" className="text-sm font-medium">
              Caveats on Profitability
            </Label>
            <Textarea
              id="caveats-profitability"
              placeholder="Enter any caveats on profitability..."
              value={data.caveatsProfitability}
              onChange={(e) => onChange('caveatsProfitability', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-notes" className="text-sm font-medium">
              Notes on Project
            </Label>
            <Textarea
              id="project-notes"
              placeholder="General project notes..."
              value={data.projectNotes}
              onChange={(e) => onChange('projectNotes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mixed-scope" className="text-sm font-medium">
              Mixed Scope / Special Priorities
            </Label>
            <Textarea
              id="mixed-scope"
              placeholder="Describe any mixed scope or special priorities..."
              value={data.mixedScope}
              onChange={(e) => onChange('mixedScope', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insurance-requirements" className="text-sm font-medium">
              Insurance Requirements
            </Label>
            <Textarea
              id="insurance-requirements"
              placeholder="Describe insurance requirements..."
              value={data.insuranceRequirements}
              onChange={(e) => onChange('insuranceRequirements', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Tier-A Scanning Cost</Label>
            <RadioGroup value={data.tierAScanningCost} onValueChange={(val) => onChange('tierAScanningCost', val)}>
              {['$3,500', '$7,000', '$10,500', '15,000', '18,500'].map((cost) => (
                <div key={cost} className="flex items-center space-x-2">
                  <RadioGroupItem value={cost} id={`scan-cost-${cost}`} />
                  <Label htmlFor={`scan-cost-${cost}`} className="cursor-pointer">{cost}</Label>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="scan-cost-other" />
                <Label htmlFor="scan-cost-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.tierAScanningCost === 'other' && (
              <Input
                placeholder="Specify other amount"
                value={data.tierAScanningCostOther}
                onChange={(e) => onChange('tierAScanningCostOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier-a-modeling" className="text-sm font-medium">
              Tier-A Modeling Cost
            </Label>
            <Input
              id="tier-a-modeling"
              placeholder="Enter modeling cost"
              value={data.tierAModelingCost}
              onChange={(e) => onChange('tierAModelingCost', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              <a 
                href="https://docs.google.com/spreadsheets/d/192MhTytrT01h05V3xOugBXm7dFcxl4ZMxcwuVUCQAuo/edit?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View pricing spreadsheet
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Tier-A Margin</Label>
            <RadioGroup value={data.tierAMargin} onValueChange={(val) => onChange('tierAMargin', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2.352X" id="margin-2352" />
                <Label htmlFor="margin-2352" className="cursor-pointer">2.352X (1.68 overhead X 1.4 min GM)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2.5X" id="margin-25" />
                <Label htmlFor="margin-25" className="cursor-pointer">2.5 X</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3X" id="margin-3" />
                <Label htmlFor="margin-3" className="cursor-pointer">3X</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3.5X" id="margin-35" />
                <Label htmlFor="margin-35" className="cursor-pointer">3.5X</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4X" id="margin-4" />
                <Label htmlFor="margin-4" className="cursor-pointer">4X</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </Card>

      {/* Timeline & Payment */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Timeline & Payment</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Estimated Timeline (from scan completion) <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={data.estimatedTimeline} onValueChange={(val) => onChange('estimatedTimeline', val)}>
              {['~1 week', '~2 weeks', '~3 weeks', '~4 weeks', '~5 weeks', '~6 weeks'].map((time) => (
                <div key={time} className="flex items-center space-x-2">
                  <RadioGroupItem value={time} id={`timeline-${time}`} />
                  <Label htmlFor={`timeline-${time}`} className="cursor-pointer">{time}</Label>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="timeline-other" />
                <Label htmlFor="timeline-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.estimatedTimeline === 'other' && (
              <Input
                placeholder="Specify other timeline"
                value={data.timelineOther}
                onChange={(e) => onChange('timelineOther', e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline-notes" className="text-sm font-medium">
              Notes on Timeline
            </Label>
            <Textarea
              id="timeline-notes"
              placeholder="Additional timeline notes..."
              value={data.timelineNotes}
              onChange={(e) => onChange('timelineNotes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Payment Terms <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={data.paymentTerms} onValueChange={(val) => onChange('paymentTerms', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partner" id="payment-partner" />
                <Label htmlFor="payment-partner" className="cursor-pointer">Partner (no hold on production)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="owner" id="payment-owner" />
                <Label htmlFor="payment-owner" className="cursor-pointer">Owner (hold if delay)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="net30" id="payment-net30" />
                <Label htmlFor="payment-net30" className="cursor-pointer">Net 30 + 5%</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="net60" id="payment-net60" />
                <Label htmlFor="payment-net60" className="cursor-pointer">Net 60 +10%</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="net90" id="payment-net90" />
                <Label htmlFor="payment-net90" className="cursor-pointer">Net 90 + 15%</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="payment-other" />
                <Label htmlFor="payment-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.paymentTerms === 'other' && (
              <Input
                placeholder="Specify other payment terms"
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
              placeholder="Additional payment notes..."
              value={data.paymentNotes}
              onChange={(e) => onChange('paymentNotes', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-contact" className="text-sm font-medium">
              Account/Company Contact Info
            </Label>
            <Textarea
              id="account-contact"
              placeholder="Enter account/company contact information..."
              value={data.accountContact}
              onChange={(e) => onChange('accountContact', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="design-pro-contact" className="text-sm font-medium">
              Design Pro Company Contact Info (if not client)
            </Label>
            <Textarea
              id="design-pro-contact"
              placeholder="Enter design professional contact information..."
              value={data.designProContact}
              onChange={(e) => onChange('designProContact', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="other-contact" className="text-sm font-medium">
              Other Contact Info
            </Label>
            <Textarea
              id="other-contact"
              placeholder="Enter other contact information..."
              value={data.otherContact}
              onChange={(e) => onChange('otherContact', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Project Management */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Project Management</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proof-links" className="text-sm font-medium">
              Proof Links
            </Label>
            <Textarea
              id="proof-links"
              placeholder="Enter proof links..."
              value={data.proofLinks}
              onChange={(e) => onChange('proofLinks', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">NDA</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover-elevate cursor-pointer">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Upload up to 5 files. Max 10 MB per file.</p>
              <Button variant="outline" size="sm" className="mt-2">
                Choose Files
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source" className="text-sm font-medium">
              Source (origin) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="source"
              placeholder="Enter project source/origin..."
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
              placeholder="Additional notes about source..."
              value={data.sourceNote}
              onChange={(e) => onChange('sourceNote', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assist" className="text-sm font-medium">
              Assist (influence)
            </Label>
            <Input
              id="assist"
              placeholder="Enter who assisted or influenced..."
              value={data.assist}
              onChange={(e) => onChange('assist', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="probability" className="text-sm font-medium">
              Probability of Closing <span className="text-destructive">*</span>
            </Label>
            <Select value={data.probabilityOfClosing} onValueChange={(val) => onChange('probabilityOfClosing', val)}>
              <SelectTrigger id="probability">
                <SelectValue placeholder="Select probability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (0-25%)</SelectItem>
                <SelectItem value="medium">Medium (25-50%)</SelectItem>
                <SelectItem value="high">High (50-75%)</SelectItem>
                <SelectItem value="very-high">Very High (75-100%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Project Status</Label>
            <RadioGroup value={data.projectStatus} onValueChange={(val) => onChange('projectStatus', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="proposal" id="status-proposal" />
                <Label htmlFor="status-proposal" className="cursor-pointer">Proposal Phase</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-hand" id="status-in-hand" />
                <Label htmlFor="status-in-hand" className="cursor-pointer">In Hand</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urgent" id="status-urgent" />
                <Label htmlFor="status-urgent" className="cursor-pointer">Urgent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="status-other" />
                <Label htmlFor="status-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {data.projectStatus === 'other' && (
              <Input
                placeholder="Specify other status"
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

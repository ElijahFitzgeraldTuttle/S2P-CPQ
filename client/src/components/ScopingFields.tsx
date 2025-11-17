import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface ScopingFieldsProps {
  data: {
    // Project Information
    projectDeadline: string;
    targetDeliveryDate: string;
    rushProject: boolean;
    
    // Building Details
    buildingHeight: string;
    floorsAboveGrade: string;
    floorsBelowGrade: string;
    totalFloors: string;
    basementLevels: string;
    
    // Site & Access
    siteAccessType: string;
    accessRestrictions: string;
    workingHours: string;
    securityRequirements: string;
    parkingAvailable: boolean;
    
    // Building Systems
    hvacSystem: string[];
    elevatorCount: string;
    escalatorCount: string;
    fireSprinklers: boolean;
    fireAlarm: boolean;
    
    // Construction
    constructionType: string;
    structuralSystem: string;
    exteriorWalls: string[];
    roofType: string;
    
    // MEP Details
    electricalService: string;
    plumbingFixtures: string;
    specialSystems: string[];
    
    // Interior Features
    ceilingTypes: string[];
    flooringTypes: string[];
    interiorPartitions: string[];
    
    // Site Features
    landscaping: boolean;
    pavingType: string[];
    utilities: string[];
    siteFurniture: boolean;
    
    // Survey Requirements
    existingDrawings: string;
    previousSurveys: string;
    surveyAccuracy: string;
    
    // Deliverables
    modelFormat: string[];
    drawingFormat: string[];
    pointCloudFormat: string[];
    
    // Special Conditions
    asbestosPresent: boolean;
    leadPaint: boolean;
    hazardousMaterials: string;
    historicBuilding: boolean;
    
    // Additional Notes
    specialRequirements: string;
    technicalChallenges: string;
    additionalNotes: string;
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
      {/* Project Timeline */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="project-deadline" className="text-sm font-medium">
              Project Deadline
            </Label>
            <Input
              id="project-deadline"
              type="date"
              value={data.projectDeadline}
              onChange={(e) => onChange('projectDeadline', e.target.value)}
              data-testid="input-project-deadline"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-delivery" className="text-sm font-medium">
              Target Delivery Date
            </Label>
            <Input
              id="target-delivery"
              type="date"
              value={data.targetDeliveryDate}
              onChange={(e) => onChange('targetDeliveryDate', e.target.value)}
              data-testid="input-target-delivery"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Checkbox
            id="rush-project"
            checked={data.rushProject}
            onCheckedChange={(checked) => onChange('rushProject', checked)}
            data-testid="checkbox-rush-project"
          />
          <Label htmlFor="rush-project" className="text-sm font-medium cursor-pointer">
            Rush Project (expedited timeline)
          </Label>
        </div>
      </Card>

      {/* Building Details */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Building Details</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="building-height" className="text-sm font-medium">
              Building Height (ft)
            </Label>
            <Input
              id="building-height"
              type="number"
              placeholder="0"
              value={data.buildingHeight}
              onChange={(e) => onChange('buildingHeight', e.target.value)}
              data-testid="input-building-height"
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
              value={data.floorsAboveGrade}
              onChange={(e) => onChange('floorsAboveGrade', e.target.value)}
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
              value={data.floorsBelowGrade}
              onChange={(e) => onChange('floorsBelowGrade', e.target.value)}
              data-testid="input-floors-below"
            />
          </div>
        </div>
      </Card>

      {/* Site Access & Security */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Site Access & Security</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-access" className="text-sm font-medium">
              Site Access Type
            </Label>
            <Select value={data.siteAccessType} onValueChange={(val) => onChange('siteAccessType', val)}>
              <SelectTrigger id="site-access" data-testid="select-site-access">
                <SelectValue placeholder="Select access type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unrestricted">Unrestricted Access</SelectItem>
                <SelectItem value="escort-required">Escort Required</SelectItem>
                <SelectItem value="security-clearance">Security Clearance Needed</SelectItem>
                <SelectItem value="scheduled-only">Scheduled Appointments Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="working-hours" className="text-sm font-medium">
              Permitted Working Hours
            </Label>
            <Input
              id="working-hours"
              placeholder="e.g., 9am-5pm weekdays"
              value={data.workingHours}
              onChange={(e) => onChange('workingHours', e.target.value)}
              data-testid="input-working-hours"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="security-req" className="text-sm font-medium">
              Security Requirements
            </Label>
            <Textarea
              id="security-req"
              placeholder="Background checks, badges, insurance requirements..."
              value={data.securityRequirements}
              onChange={(e) => onChange('securityRequirements', e.target.value)}
              rows={3}
              data-testid="textarea-security-requirements"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="parking-available"
              checked={data.parkingAvailable}
              onCheckedChange={(checked) => onChange('parkingAvailable', checked)}
              data-testid="checkbox-parking"
            />
            <Label htmlFor="parking-available" className="text-sm font-medium cursor-pointer">
              On-site parking available
            </Label>
          </div>
        </div>
      </Card>

      {/* Building Systems */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Building Systems</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">HVAC System Types</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {['Central Air', 'Rooftop Units', 'Split Systems', 'Chillers', 'Boilers', 'VRF'].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={`hvac-${type}`}
                    checked={(data.hvacSystem || []).includes(type)}
                    onCheckedChange={(checked) => handleCheckboxArrayChange('hvacSystem', type, checked as boolean)}
                    data-testid={`checkbox-hvac-${type.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <Label htmlFor={`hvac-${type}`} className="text-sm cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
              <Label htmlFor="escalator-count" className="text-sm font-medium">
                Number of Escalators
              </Label>
              <Input
                id="escalator-count"
                type="number"
                placeholder="0"
                value={data.escalatorCount}
                onChange={(e) => onChange('escalatorCount', e.target.value)}
                data-testid="input-escalator-count"
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="fire-sprinklers"
                checked={data.fireSprinklers}
                onCheckedChange={(checked) => onChange('fireSprinklers', checked)}
                data-testid="checkbox-fire-sprinklers"
              />
              <Label htmlFor="fire-sprinklers" className="text-sm cursor-pointer">
                Fire Sprinkler System
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="fire-alarm"
                checked={data.fireAlarm}
                onCheckedChange={(checked) => onChange('fireAlarm', checked)}
                data-testid="checkbox-fire-alarm"
              />
              <Label htmlFor="fire-alarm" className="text-sm cursor-pointer">
                Fire Alarm System
              </Label>
            </div>
          </div>
        </div>
      </Card>

      {/* Construction Details */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Construction Details</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="construction-type" className="text-sm font-medium">
              Construction Type
            </Label>
            <Select value={data.constructionType} onValueChange={(val) => onChange('constructionType', val)}>
              <SelectTrigger id="construction-type" data-testid="select-construction-type">
                <SelectValue placeholder="Select construction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="type-i">Type I - Fire Resistive</SelectItem>
                <SelectItem value="type-ii">Type II - Non-Combustible</SelectItem>
                <SelectItem value="type-iii">Type III - Ordinary</SelectItem>
                <SelectItem value="type-iv">Type IV - Heavy Timber</SelectItem>
                <SelectItem value="type-v">Type V - Wood Frame</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="structural-system" className="text-sm font-medium">
              Structural System
            </Label>
            <Select value={data.structuralSystem} onValueChange={(val) => onChange('structuralSystem', val)}>
              <SelectTrigger id="structural-system" data-testid="select-structural-system">
                <SelectValue placeholder="Select structural system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="steel">Steel Frame</SelectItem>
                <SelectItem value="concrete">Concrete Frame</SelectItem>
                <SelectItem value="wood">Wood Frame</SelectItem>
                <SelectItem value="masonry">Load-Bearing Masonry</SelectItem>
                <SelectItem value="composite">Composite/Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Exterior Wall Systems</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {['Brick', 'Curtain Wall', 'EIFS', 'Metal Panels', 'Precast Concrete', 'Stone'].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={`exterior-${type}`}
                    checked={(data.exteriorWalls || []).includes(type)}
                    onCheckedChange={(checked) => handleCheckboxArrayChange('exteriorWalls', type, checked as boolean)}
                    data-testid={`checkbox-exterior-${type.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <Label htmlFor={`exterior-${type}`} className="text-sm cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roof-type" className="text-sm font-medium">
              Roof Type
            </Label>
            <Select value={data.roofType} onValueChange={(val) => onChange('roofType', val)}>
              <SelectTrigger id="roof-type" data-testid="select-roof-type">
                <SelectValue placeholder="Select roof type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat/Low Slope</SelectItem>
                <SelectItem value="pitched">Pitched</SelectItem>
                <SelectItem value="metal">Metal</SelectItem>
                <SelectItem value="green">Green Roof</SelectItem>
                <SelectItem value="mixed">Mixed Types</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Interior Features */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Interior Features</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ceiling Types</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {['ACT', 'Gypsum Board', 'Exposed Structure', 'Wood', 'Metal'].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={`ceiling-${type}`}
                    checked={(data.ceilingTypes || []).includes(type)}
                    onCheckedChange={(checked) => handleCheckboxArrayChange('ceilingTypes', type, checked as boolean)}
                    data-testid={`checkbox-ceiling-${type.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <Label htmlFor={`ceiling-${type}`} className="text-sm cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Flooring Types</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {['Carpet', 'VCT', 'Hardwood', 'Tile', 'Concrete', 'Epoxy'].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={`flooring-${type}`}
                    checked={(data.flooringTypes || []).includes(type)}
                    onCheckedChange={(checked) => handleCheckboxArrayChange('flooringTypes', type, checked as boolean)}
                    data-testid={`checkbox-flooring-${type.toLowerCase()}`}
                  />
                  <Label htmlFor={`flooring-${type}`} className="text-sm cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Interior Partition Types</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {['Gypsum Board', 'Glass', 'CMU', 'Demountable', 'Folding'].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={`partition-${type}`}
                    checked={(data.interiorPartitions || []).includes(type)}
                    onCheckedChange={(checked) => handleCheckboxArrayChange('interiorPartitions', type, checked as boolean)}
                    data-testid={`checkbox-partition-${type.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <Label htmlFor={`partition-${type}`} className="text-sm cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Survey & Documentation */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Existing Documentation</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="existing-drawings" className="text-sm font-medium">
              Existing Drawings Available
            </Label>
            <Select value={data.existingDrawings} onValueChange={(val) => onChange('existingDrawings', val)}>
              <SelectTrigger id="existing-drawings" data-testid="select-existing-drawings">
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Existing Drawings</SelectItem>
                <SelectItem value="partial">Partial/Incomplete</SelectItem>
                <SelectItem value="complete">Complete Set Available</SelectItem>
                <SelectItem value="asbuilt">As-Built Drawings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="previous-surveys" className="text-sm font-medium">
              Previous Survey Data
            </Label>
            <Textarea
              id="previous-surveys"
              placeholder="Describe any previous surveys, point clouds, or 3D data available..."
              value={data.previousSurveys}
              onChange={(e) => onChange('previousSurveys', e.target.value)}
              rows={3}
              data-testid="textarea-previous-surveys"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="survey-accuracy" className="text-sm font-medium">
              Required Survey Accuracy
            </Label>
            <Select value={data.surveyAccuracy} onValueChange={(val) => onChange('surveyAccuracy', val)}>
              <SelectTrigger id="survey-accuracy" data-testid="select-survey-accuracy">
                <SelectValue placeholder="Select accuracy level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (±1/2 inch)</SelectItem>
                <SelectItem value="high">High (±1/4 inch)</SelectItem>
                <SelectItem value="precision">Precision (±1/8 inch)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Deliverable Formats */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Deliverable Formats</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">BIM Model Formats</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {['Revit', 'ArchiCAD', 'AutoCAD', 'MicroStation', 'IFC'].map((format) => (
                <div key={format} className="flex items-center gap-2">
                  <Checkbox
                    id={`model-${format}`}
                    checked={(data.modelFormat || []).includes(format)}
                    onCheckedChange={(checked) => handleCheckboxArrayChange('modelFormat', format, checked as boolean)}
                    data-testid={`checkbox-model-${format.toLowerCase()}`}
                  />
                  <Label htmlFor={`model-${format}`} className="text-sm cursor-pointer">
                    {format}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">2D Drawing Formats</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {['DWG', 'PDF', 'DGN', 'DXF'].map((format) => (
                <div key={format} className="flex items-center gap-2">
                  <Checkbox
                    id={`drawing-${format}`}
                    checked={(data.drawingFormat || []).includes(format)}
                    onCheckedChange={(checked) => handleCheckboxArrayChange('drawingFormat', format, checked as boolean)}
                    data-testid={`checkbox-drawing-${format.toLowerCase()}`}
                  />
                  <Label htmlFor={`drawing-${format}`} className="text-sm cursor-pointer">
                    {format}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Point Cloud Formats</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {['E57', 'RCP/RCS', 'LAS/LAZ', 'PTS', 'XYZ'].map((format) => (
                <div key={format} className="flex items-center gap-2">
                  <Checkbox
                    id={`pointcloud-${format}`}
                    checked={(data.pointCloudFormat || []).includes(format)}
                    onCheckedChange={(checked) => handleCheckboxArrayChange('pointCloudFormat', format, checked as boolean)}
                    data-testid={`checkbox-pointcloud-${format.toLowerCase().replace(/\//g, '-')}`}
                  />
                  <Label htmlFor={`pointcloud-${format}`} className="text-sm cursor-pointer">
                    {format}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Special Conditions */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Special Conditions & Hazards</h3>
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="asbestos"
                checked={data.asbestosPresent}
                onCheckedChange={(checked) => onChange('asbestosPresent', checked)}
                data-testid="checkbox-asbestos"
              />
              <Label htmlFor="asbestos" className="text-sm cursor-pointer">
                Asbestos Present/Suspected
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="lead-paint"
                checked={data.leadPaint}
                onCheckedChange={(checked) => onChange('leadPaint', checked)}
                data-testid="checkbox-lead-paint"
              />
              <Label htmlFor="lead-paint" className="text-sm cursor-pointer">
                Lead Paint Present/Suspected
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="historic"
                checked={data.historicBuilding}
                onCheckedChange={(checked) => onChange('historicBuilding', checked)}
                data-testid="checkbox-historic"
              />
              <Label htmlFor="historic" className="text-sm cursor-pointer">
                Historic/Protected Building
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hazardous-materials" className="text-sm font-medium">
              Other Hazardous Materials or Special Conditions
            </Label>
            <Textarea
              id="hazardous-materials"
              placeholder="Describe any other hazards, special handling requirements, or environmental concerns..."
              value={data.hazardousMaterials}
              onChange={(e) => onChange('hazardousMaterials', e.target.value)}
              rows={3}
              data-testid="textarea-hazardous-materials"
            />
          </div>
        </div>
      </Card>

      {/* Additional Information */}
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="special-requirements" className="text-sm font-medium">
              Special Requirements
            </Label>
            <Textarea
              id="special-requirements"
              placeholder="Any special modeling requirements, unique features, or specific client requests..."
              value={data.specialRequirements}
              onChange={(e) => onChange('specialRequirements', e.target.value)}
              rows={3}
              data-testid="textarea-special-requirements"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technical-challenges" className="text-sm font-medium">
              Anticipated Technical Challenges
            </Label>
            <Textarea
              id="technical-challenges"
              placeholder="Complex geometry, difficult access areas, coordination issues..."
              value={data.technicalChallenges}
              onChange={(e) => onChange('technicalChallenges', e.target.value)}
              rows={3}
              data-testid="textarea-technical-challenges"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-notes" className="text-sm font-medium">
              Additional Notes
            </Label>
            <Textarea
              id="additional-notes"
              placeholder="Any other relevant information..."
              value={data.additionalNotes}
              onChange={(e) => onChange('additionalNotes', e.target.value)}
              rows={4}
              data-testid="textarea-additional-notes"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FileUpload from "./FileUpload";

interface LeadFieldsProps {
  projectDetails: {
    clientName: string;
    projectName: string;
    projectAddress: string;
    specificBuilding: string;
  };
  scopingData: {
    accountContact: string;
    accountContactEmail: string;
    accountContactPhone: string;
    designProContact: string;
    designProCompanyContact: string;
    otherContact: string;
    source: string;
    sourceNote: string;
    assist: string;
    probabilityOfClosing: string;
    projectStatus: string;
    projectStatusOther: string;
    proofLinks: string;
    ndaFiles: any[];
  };
  onProjectDetailChange: (field: string, value: string | boolean) => void;
  onScopingDataChange: (field: string, value: any) => void;
}

export default function LeadFields({ 
  projectDetails, 
  scopingData, 
  onProjectDetailChange, 
  onScopingDataChange 
}: LeadFieldsProps) {
  return (
    <div className="space-y-6">
      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Business Information</h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client-name" className="text-sm font-medium">
                Client / Company Name
              </Label>
              <Input
                id="client-name"
                placeholder="Enter client or company name"
                value={projectDetails.clientName}
                onChange={(e) => onProjectDetailChange('clientName', e.target.value)}
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
                value={projectDetails.projectName}
                onChange={(e) => onProjectDetailChange('projectName', e.target.value)}
                required
                data-testid="input-project-name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-address" className="text-sm font-medium">
              Property Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-address"
              placeholder="Enter full property address"
              value={projectDetails.projectAddress}
              onChange={(e) => onProjectDetailChange('projectAddress', e.target.value)}
              required
              data-testid="input-project-address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specific-building" className="text-sm font-medium">
              Specific Building or Unit
            </Label>
            <Input
              id="specific-building"
              placeholder="Enter building or unit details (if applicable)"
              value={projectDetails.specificBuilding}
              onChange={(e) => onProjectDetailChange('specificBuilding', e.target.value)}
              data-testid="input-specific-building"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-contact" className="text-sm font-medium">
              Primary Contact Name
            </Label>
            <Input
              id="account-contact"
              placeholder="Primary account contact name"
              value={scopingData.accountContact}
              onChange={(e) => onScopingDataChange('accountContact', e.target.value)}
              data-testid="input-account-contact"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account-contact-email" className="text-sm font-medium">
                Contact Email
              </Label>
              <Input
                id="account-contact-email"
                type="email"
                placeholder="email@example.com"
                value={scopingData.accountContactEmail}
                onChange={(e) => onScopingDataChange('accountContactEmail', e.target.value)}
                data-testid="input-account-contact-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-contact-phone" className="text-sm font-medium">
                Contact Phone
              </Label>
              <Input
                id="account-contact-phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={scopingData.accountContactPhone}
                onChange={(e) => onScopingDataChange('accountContactPhone', e.target.value)}
                data-testid="input-account-contact-phone"
              />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label htmlFor="design-pro-contact" className="text-sm font-medium">
              Design Professional Contact
            </Label>
            <Input
              id="design-pro-contact"
              placeholder="Architect, engineer, or designer contact"
              value={scopingData.designProContact}
              onChange={(e) => onScopingDataChange('designProContact', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="design-pro-company-contact" className="text-sm font-medium">
              Design Pro Company (if different from client)
            </Label>
            <Input
              id="design-pro-company-contact"
              placeholder="Company contact information"
              value={scopingData.designProCompanyContact}
              onChange={(e) => onScopingDataChange('designProCompanyContact', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="other-contact" className="text-sm font-medium">
              Other Contacts
            </Label>
            <Input
              id="other-contact"
              placeholder="Additional contacts"
              value={scopingData.otherContact}
              onChange={(e) => onScopingDataChange('otherContact', e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Lead Source & Tracking</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source" className="text-sm font-medium">
              Lead Source
            </Label>
            <Select value={scopingData.source} onValueChange={(val) => onScopingDataChange('source', val)}>
              <SelectTrigger id="source" data-testid="select-source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ABM">ABM</SelectItem>
                <SelectItem value="Cold outreach">Cold outreach</SelectItem>
                <SelectItem value="Referral - Client">Referral - Client</SelectItem>
                <SelectItem value="Referral - Partner">Referral - Partner</SelectItem>
                <SelectItem value="Existing customer">Existing customer</SelectItem>
                <SelectItem value="CEU">CEU</SelectItem>
                <SelectItem value="Proof Vault">Proof Vault</SelectItem>
                <SelectItem value="Spec/Standards">Spec/Standards</SelectItem>
                <SelectItem value="Podcast">Podcast</SelectItem>
                <SelectItem value="Site/SEO">Site/SEO</SelectItem>
                <SelectItem value="Permit trigger">Permit trigger</SelectItem>
                <SelectItem value="Compliance trigger">Compliance trigger</SelectItem>
                <SelectItem value="Procurement trigger">Procurement trigger</SelectItem>
                <SelectItem value="Event/Conference">Event/Conference</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Vendor Onboarding">Vendor Onboarding</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source-note" className="text-sm font-medium">
              Source Details / Referral Info
            </Label>
            <Textarea
              id="source-note"
              placeholder="Additional details about the source or referral..."
              value={scopingData.sourceNote}
              onChange={(e) => onScopingDataChange('sourceNote', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assist" className="text-sm font-medium">
              Assist (Secondary Source)
            </Label>
            <Select value={scopingData.assist} onValueChange={(val) => onScopingDataChange('assist', val)}>
              <SelectTrigger id="assist" data-testid="select-assist">
                <SelectValue placeholder="Select assist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ABM">ABM</SelectItem>
                <SelectItem value="Cold outreach">Cold outreach</SelectItem>
                <SelectItem value="Referral - Client">Referral - Client</SelectItem>
                <SelectItem value="Referral - Partner">Referral - Partner</SelectItem>
                <SelectItem value="Existing customer">Existing customer</SelectItem>
                <SelectItem value="CEU">CEU</SelectItem>
                <SelectItem value="Proof Vault">Proof Vault</SelectItem>
                <SelectItem value="Spec/Standards">Spec/Standards</SelectItem>
                <SelectItem value="Podcast">Podcast</SelectItem>
                <SelectItem value="Site/SEO">Site/SEO</SelectItem>
                <SelectItem value="Permit trigger">Permit trigger</SelectItem>
                <SelectItem value="Compliance trigger">Compliance trigger</SelectItem>
                <SelectItem value="Procurement trigger">Procurement trigger</SelectItem>
                <SelectItem value="Event/Conference">Event/Conference</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Vendor Onboarding">Vendor Onboarding</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label htmlFor="probability-closing" className="text-sm font-medium">
              Probability of Closing: {scopingData.probabilityOfClosing || 50}%
            </Label>
            <Slider
              id="probability-closing"
              min={0}
              max={100}
              step={5}
              value={[parseInt(scopingData.probabilityOfClosing) || 50]}
              onValueChange={(vals) => onScopingDataChange('probabilityOfClosing', vals[0].toString())}
              className="w-full"
              data-testid="slider-probability"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Project Status
            </Label>
            <RadioGroup value={scopingData.projectStatus} onValueChange={(val) => onScopingDataChange('projectStatus', val)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="proposal" id="status-proposal" data-testid="radio-status-proposal" />
                <Label htmlFor="status-proposal" className="cursor-pointer">Proposal Phase</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inhand" id="status-inhand" data-testid="radio-status-inhand" />
                <Label htmlFor="status-inhand" className="cursor-pointer">In Hand</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urgent" id="status-urgent" data-testid="radio-status-urgent" />
                <Label htmlFor="status-urgent" className="cursor-pointer">Urgent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="status-other" data-testid="radio-status-other" />
                <Label htmlFor="status-other" className="cursor-pointer">Other:</Label>
              </div>
            </RadioGroup>
            {scopingData.projectStatus === 'other' && (
              <Input
                placeholder="Specify status"
                value={scopingData.projectStatusOther}
                onChange={(e) => onScopingDataChange('projectStatusOther', e.target.value)}
                className="mt-2"
                data-testid="input-status-other"
              />
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-accent/50">
        <h3 className="text-lg font-semibold mb-4">Documentation</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proof-links" className="text-sm font-medium">
              Proof Links
            </Label>
            <Textarea
              id="proof-links"
              placeholder="Links to proof documents, photos, floor plans, etc..."
              value={scopingData.proofLinks}
              onChange={(e) => onScopingDataChange('proofLinks', e.target.value)}
              rows={2}
              data-testid="textarea-proof-links"
            />
          </div>
          
          <FileUpload
            label="Upload NDA or Other Documents"
            files={scopingData.ndaFiles || []}
            onChange={(files) => onScopingDataChange('ndaFiles', files)}
          />
        </div>
      </Card>
    </div>
  );
}

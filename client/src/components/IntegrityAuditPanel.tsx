import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, Shield, ShieldAlert, ShieldCheck, RefreshCw, Lock, Unlock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

type IntegrityStatus = 'pass' | 'warning' | 'blocked';
type FlagSeverity = 'info' | 'warning' | 'error';

interface IntegrityFlag {
  code: string;
  severity: FlagSeverity;
  category: string;
  title: string;
  message: string;
  details?: Record<string, any>;
}

interface AuditReport {
  status: IntegrityStatus;
  flags: IntegrityFlag[];
  auditedAt: string;
  requiresOverride: boolean;
  overrideApproved: boolean;
}

interface IntegrityAuditPanelProps {
  quoteId: string;
  integrityStatus?: IntegrityStatus | null;
  integrityFlags?: IntegrityFlag[];
  requiresOverride?: boolean;
  overrideApproved?: boolean;
  onAuditComplete?: (report: AuditReport) => void;
}

const statusConfig = {
  pass: {
    icon: ShieldCheck,
    color: "text-green-600",
    bgColor: "bg-green-100/50",
    borderColor: "border-green-200",
    badgeVariant: "outline" as const,
    label: "Passed",
  },
  warning: {
    icon: ShieldAlert,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    badgeVariant: "outline" as const,
    label: "Warnings",
  },
  blocked: {
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeVariant: "destructive" as const,
    label: "Blocked",
  },
};

const severityConfig = {
  info: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  error: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
};

export default function IntegrityAuditPanel({
  quoteId,
  integrityStatus,
  integrityFlags = [],
  requiresOverride,
  overrideApproved,
  onAuditComplete,
}: IntegrityAuditPanelProps) {
  const queryClient = useQueryClient();
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [justification, setJustification] = useState("");
  const [expandedFlags, setExpandedFlags] = useState<Set<string>>(new Set());

  const auditMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/quotes/${quoteId}/audit`);
      return response.json();
    },
    onSuccess: (data: AuditReport) => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes', quoteId] });
      onAuditComplete?.(data);
    },
  });

  const overrideMutation = useMutation({
    mutationFn: async (justification: string) => {
      const response = await apiRequest("POST", `/api/quotes/${quoteId}/integrity/override`, {
        justification,
        requestedBy: "User",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes', quoteId] });
      setShowOverrideDialog(false);
      setJustification("");
    },
  });

  const { data: pendingOverrides } = useQuery<any[]>({
    queryKey: ['/api/quotes', quoteId, 'integrity', 'overrides'],
    enabled: !!quoteId && requiresOverride === true,
  });

  const hasPendingRequest = pendingOverrides?.some(o => o.status === 'pending');

  const handleRunAudit = () => {
    auditMutation.mutate();
  };

  const handleRequestOverride = () => {
    if (justification.trim()) {
      overrideMutation.mutate(justification);
    }
  };

  const toggleFlagExpanded = (code: string) => {
    const newExpanded = new Set(expandedFlags);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedFlags(newExpanded);
  };

  const config = integrityStatus ? statusConfig[integrityStatus] : null;
  const StatusIcon = config?.icon || Shield;

  const errorFlags = integrityFlags.filter(f => f.severity === 'error');
  const warningFlags = integrityFlags.filter(f => f.severity === 'warning');
  const infoFlags = integrityFlags.filter(f => f.severity === 'info');

  return (
    <>
      <Card className={`${config?.bgColor || ''} ${config?.borderColor || ''} border`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${config?.color || 'text-muted-foreground'}`} />
              <CardTitle className="text-base">Integrity Check</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {integrityStatus && (
                <Badge variant={config?.badgeVariant} className="capitalize" data-testid="badge-integrity-status">
                  {config?.label}
                </Badge>
              )}
              {overrideApproved && (
                <Badge variant="outline" className="text-green-600 border-green-300" data-testid="badge-override-approved">
                  <Unlock className="h-3 w-3 mr-1" />
                  Override Approved
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!integrityStatus && (
            <div className="text-sm text-muted-foreground">
              Run the integrity audit to validate this quote against business rules before export.
            </div>
          )}

          {integrityFlags.length > 0 && (
            <div className="space-y-2">
              {[...errorFlags, ...warningFlags, ...infoFlags].map((flag, index) => {
                const flagConfig = severityConfig[flag.severity];
                const FlagIcon = flagConfig.icon;
                const isExpanded = expandedFlags.has(flag.code);

                return (
                  <Collapsible
                    key={flag.code + index}
                    open={isExpanded}
                    onOpenChange={() => toggleFlagExpanded(flag.code)}
                  >
                    <div className={`rounded-md p-3 ${flagConfig.bgColor}`}>
                      <CollapsibleTrigger className="w-full text-left">
                        <div className="flex items-start gap-2">
                          <FlagIcon className={`h-4 w-4 mt-0.5 ${flagConfig.color}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium text-sm ${flagConfig.color}`}>
                                {flag.title}
                              </span>
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {flag.message}
                            </p>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {flag.details && (
                          <div className="mt-3 pt-3 border-t border-dashed border-current/20">
                            <div className="text-xs font-mono text-muted-foreground space-y-1">
                              {Object.entries(flag.details).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span>{key}:</span>
                                  <span>
                                    {typeof value === 'number'
                                      ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                      : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunAudit}
              disabled={auditMutation.isPending}
              data-testid="button-run-audit"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${auditMutation.isPending ? 'animate-spin' : ''}`} />
              {integrityStatus ? 'Re-run Audit' : 'Run Audit'}
            </Button>

            {requiresOverride && !overrideApproved && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowOverrideDialog(true)}
                disabled={hasPendingRequest}
                data-testid="button-request-override"
              >
                <Lock className="h-4 w-4 mr-2" />
                {hasPendingRequest ? 'Override Pending' : 'Request Exception'}
              </Button>
            )}
          </div>

          {hasPendingRequest && (
            <div className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-md">
              An override request is pending approval from the CEO. You will be notified once it's reviewed.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Override Exception</DialogTitle>
            <DialogDescription>
              This quote has been blocked due to policy violations. Provide a business justification to request a CEO override.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Blocking Issues:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {errorFlags.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    {flag.title}: {flag.message}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <label htmlFor="justification" className="text-sm font-medium">
                Business Justification
              </label>
              <Textarea
                id="justification"
                placeholder="Explain why this exception should be granted..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="mt-1.5"
                rows={4}
                data-testid="textarea-justification"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOverrideDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestOverride}
              disabled={!justification.trim() || overrideMutation.isPending}
              data-testid="button-submit-override"
            >
              {overrideMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

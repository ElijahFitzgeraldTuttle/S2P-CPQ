import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const AREA_TIERS = [
  "0-5k sqft",
  "5k-10k sqft",
  "10k-20k sqft",
  "20k-30k sqft",
  "30k-40k sqft",
  "40k-50k sqft",
  "50k-75k sqft",
  "75k-100k sqft",
  "100k+ sqft",
];

const DISCIPLINES = ["Architecture", "Structure", "MEPF", "Site"];
const LOD_LEVELS = ["LOD 200", "LOD 300", "LOD 350"];

interface PricingMatrixEditorProps {
  buildingType: string;
  rates: Record<string, number>;
  onRateChange: (key: string, value: number) => void;
}

export default function PricingMatrixEditor({
  buildingType,
  rates,
  onRateChange,
}: PricingMatrixEditorProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const getRateKey = (tier: string, discipline: string, lod: string) =>
    `${tier}-${discipline}-${lod}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          Pricing Matrix
          <Badge variant="outline">{buildingType}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10">Area Tier</TableHead>
                {DISCIPLINES.map((disc) =>
                  LOD_LEVELS.map((lod) => (
                    <TableHead key={`${disc}-${lod}`} className="text-center min-w-[100px]">
                      <div className="text-xs">{disc}</div>
                      <div className="text-xs text-muted-foreground">{lod}</div>
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {AREA_TIERS.map((tier, tierIdx) => (
                <TableRow key={tier}>
                  <TableCell className="sticky left-0 bg-background font-medium text-sm">
                    {tier}
                  </TableCell>
                  {DISCIPLINES.map((disc) =>
                    LOD_LEVELS.map((lod) => {
                      const key = getRateKey(tier, disc, lod);
                      const rate = rates[key] || 2.5;
                      const isEditing = editingCell === key;

                      return (
                        <TableCell
                          key={key}
                          className="text-center p-2"
                          onClick={() => !isEditing && setEditingCell(key)}
                        >
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.01"
                              className="w-20 h-8 text-center font-mono text-sm"
                              defaultValue={rate}
                              onBlur={(e) => {
                                onRateChange(key, parseFloat(e.target.value) || 0);
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  onRateChange(key, parseFloat(e.currentTarget.value) || 0);
                                  setEditingCell(null);
                                }
                              }}
                              autoFocus
                              data-testid={`input-rate-${tierIdx}`}
                            />
                          ) : (
                            <span
                              className="font-mono text-sm cursor-pointer hover:text-primary hover:underline"
                              data-testid={`text-rate-${tierIdx}`}
                            >
                              ${rate.toFixed(2)}
                            </span>
                          )}
                        </TableCell>
                      );
                    })
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

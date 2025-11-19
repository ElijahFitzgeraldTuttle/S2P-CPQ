import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PricingLineItem {
  label: string;
  value: number;
  editable?: boolean;
  isDiscount?: boolean;
  isTotal?: boolean;
}

interface PricingSummaryProps {
  items: PricingLineItem[];
  onEdit?: (index: number, value: number) => void;
  totalClientPrice?: number;
  totalUpteamCost?: number;
}

export default function PricingSummary({ items, onEdit, totalClientPrice, totalUpteamCost }: PricingSummaryProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleEdit = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    onEdit?.(index, numValue);
    setEditingIndex(null);
  };
  
  const profitMargin = totalClientPrice && totalUpteamCost ? totalClientPrice - totalUpteamCost : 0;
  const profitMarginPercent = totalClientPrice && totalUpteamCost && totalUpteamCost > 0 
    ? ((profitMargin / totalUpteamCost) * 100) 
    : 0;

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Pricing Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={index}>
            {item.isTotal && index > 0 && <Separator className="my-4" />}
            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${
                  item.isTotal
                    ? "font-bold text-lg"
                    : item.isDiscount
                    ? "text-green-600"
                    : ""
                }`}
              >
                {item.label}
              </span>
              {item.editable && editingIndex === index ? (
                <Input
                  type="number"
                  className="w-32 h-8 text-right font-mono"
                  defaultValue={item.value}
                  onBlur={(e) => handleEdit(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEdit(index, e.currentTarget.value);
                    }
                  }}
                  autoFocus
                  data-testid={`input-edit-price-${index}`}
                />
              ) : (
                <span
                  className={`font-mono ${
                    item.isTotal ? "font-bold text-lg" : "text-sm"
                  } ${
                    item.isDiscount ? "text-green-600" : ""
                  } ${
                    item.editable ? "cursor-pointer hover:underline hover:text-primary" : ""
                  }`}
                  onClick={() => item.editable && setEditingIndex(index)}
                  data-testid={`text-price-${index}`}
                >
                  {item.isDiscount && "- "}${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
        ))}
        
        {totalClientPrice !== undefined && totalUpteamCost !== undefined && (
          <>
            <Separator className="my-6" />
            <div className="space-y-3 pt-2">
              <h3 className="font-semibold text-sm text-muted-foreground">COST SUMMARY (Internal)</h3>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Client Price</span>
                <span className="font-mono text-sm font-semibold">
                  ${totalClientPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Upteam Cost</span>
                <span className="font-mono text-sm text-muted-foreground">
                  ${totalUpteamCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Profit Margin</span>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-green-600">
                    ${profitMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="font-mono text-xs text-green-600">
                    {profitMarginPercent.toFixed(1)}% markup
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

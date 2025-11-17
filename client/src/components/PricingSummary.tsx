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
}

export default function PricingSummary({ items, onEdit }: PricingSummaryProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleEdit = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    onEdit?.(index, numValue);
    setEditingIndex(null);
  };

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
      </CardContent>
    </Card>
  );
}

import HomeCard from "@/components/HomeCard";
import { Calculator, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Scan-to-BIM Pricing Calculator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create professional quotes for your Scan-to-BIM projects with our comprehensive pricing calculator
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          <HomeCard
            title="Calculator & Scoping"
            description="Create detailed quotes with optional comprehensive project scoping. Toggle between quick quotes and full scoping mode."
            icon={Calculator}
            href="/calculator"
            testId="button-calculator"
          />
          <HomeCard
            title="View Dashboard"
            description="Access all your quotes and scoping projects. Export PDFs, manage pricing, and track project details."
            icon={FileText}
            href="/dashboard"
            testId="button-dashboard"
          />
        </div>
      </div>
    </div>
  );
}

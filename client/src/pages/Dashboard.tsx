import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuoteCard from "@/components/QuoteCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";

//todo: remove mock functionality
const MOCK_QUOTES = [
  {
    id: "Q-2024-001",
    projectName: "Downtown Office Tower",
    clientName: "ABC Construction",
    totalPrice: 45250,
    dateCreated: "Nov 15, 2024",
    type: "Scope + Quote" as const,
  },
  {
    id: "Q-2024-002",
    projectName: "Residential Complex Phase 2",
    clientName: "XYZ Developers",
    totalPrice: 78900,
    dateCreated: "Nov 14, 2024",
    type: "Quote" as const,
  },
  {
    id: "Q-2024-003",
    projectName: "Historic Building Restoration",
    clientName: "Heritage Properties Inc",
    totalPrice: 32100,
    dateCreated: "Nov 13, 2024",
    type: "Scope + Quote" as const,
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your quotes and scoping projects
            </p>
          </div>
          <Link href="/calculator">
            <Button data-testid="button-new-quote">
              <Plus className="h-4 w-4 mr-2" />
              New Quote
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">
              All Projects
            </TabsTrigger>
            <TabsTrigger value="quotes" data-testid="tab-quotes">
              Quote Only
            </TabsTrigger>
            <TabsTrigger value="scoped" data-testid="tab-scoped">
              Scope + Quote
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {MOCK_QUOTES.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  {...quote}
                  onView={() => console.log(`View ${quote.id}`)}
                  onExport={() => console.log(`Export ${quote.id}`)}
                  onDelete={() => console.log(`Delete ${quote.id}`)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quotes" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {MOCK_QUOTES.filter(q => q.type === "Quote").map((quote) => (
                <QuoteCard
                  key={quote.id}
                  {...quote}
                  onView={() => console.log(`View ${quote.id}`)}
                  onExport={() => console.log(`Export ${quote.id}`)}
                  onDelete={() => console.log(`Delete ${quote.id}`)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scoped" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {MOCK_QUOTES.filter(q => q.type === "Scope + Quote").map((quote) => (
                <QuoteCard
                  key={quote.id}
                  {...quote}
                  onView={() => console.log(`View ${quote.id}`)}
                  onExport={() => console.log(`Export ${quote.id}`)}
                  onDelete={() => console.log(`Delete ${quote.id}`)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

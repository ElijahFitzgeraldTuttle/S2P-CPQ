import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Plus, FileText, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Quote } from "@shared/schema";

export default function Home() {
  const { data: quotes = [], isLoading } = useQuery<Quote[]>({
    queryKey: ["/api", "quotes"],
  });

  const pastProjects = quotes.slice(0, 5).map((quote) => ({
    id: quote.id,
    name: quote.projectName,
    client: quote.clientName || "N/A",
    date: new Date(quote.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    total: `$${parseFloat(quote.totalPrice || "0").toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Create New Project Card */}
          <Link href="/calculator">
            <Card className="aspect-square flex flex-col items-center justify-center p-8 cursor-pointer hover-elevate active-elevate-2 transition-all border-2 border-dashed border-primary/50 bg-accent/30" data-testid="card-create-project">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <Plus className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Create New Project</h2>
              <p className="text-sm text-muted-foreground text-center">
                Start a new quote
              </p>
            </Card>
          </Link>

          {/* Past Projects */}
          {isLoading && (
            <Card className="aspect-square flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading quotes...</p>
            </Card>
          )}
          
          {!isLoading && pastProjects.map((project) => (
            <Link key={project.id} href={`/calculator/${project.id}`}>
              <Card className="aspect-square flex flex-col p-6 cursor-pointer hover-elevate active-elevate-2 transition-all" data-testid={`card-project-${project.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-lg bg-accent p-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{project.date}</span>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {project.client}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Total</span>
                      <span className="text-xl font-bold font-mono text-primary">
                        {project.total}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

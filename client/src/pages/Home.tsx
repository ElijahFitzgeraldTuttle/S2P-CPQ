import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Plus, FileText, Clock } from "lucide-react";

export default function Home() {
  const pastProjects = [
    {
      id: "1",
      name: "Downtown Office Complex",
      client: "ABC Properties",
      date: "Nov 15, 2024",
      total: "$22,112.50",
    },
    {
      id: "2",
      name: "Retail Center Renovation",
      client: "XYZ Development",
      date: "Nov 10, 2024",
      total: "$18,750.00",
    },
  ];

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
          {pastProjects.map((project) => (
            <Link key={project.id} href={`/calculator?id=${project.id}`}>
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

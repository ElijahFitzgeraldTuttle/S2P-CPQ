import { Link, useLocation } from "wouter";
import { Calculator, LayoutDashboard, Settings } from "lucide-react";

export default function Header() {
  const [location] = useLocation();

  const navLinks = [
    { path: "/", label: "Home", icon: null },
    { path: "/calculator", label: "Calculator", icon: Calculator },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 text-xl font-bold text-primary hover-elevate active-elevate-2 px-3 py-2 rounded-md" data-testid="link-home">
              <span className="text-2xl">S2P</span>
              <span className="hidden sm:inline">Scan2Plan</span>
            </a>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location === link.path;
              const Icon = link.icon;
              
              return (
                <Link key={link.path} href={link.path}>
                  <a
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground"
                    }`}
                    data-testid={`link-${link.label.toLowerCase()}`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className="hidden sm:inline">{link.label}</span>
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

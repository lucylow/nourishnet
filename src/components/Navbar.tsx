import { Leaf, Menu, X, ChevronDown, LayoutDashboard, Vote, Users, BarChart3, Home, Sparkles, Eye, DollarSign, Gift, Network, Link2, ChefHat, Brain } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useState, useRef, useEffect } from "react";

const pages = [
  { label: "Home", to: "/", icon: Home },
  { label: "AI Chat", to: "/ai", icon: Sparkles },
  { label: "Vision", to: "/ai/vision", icon: Eye },
  { label: "Agents", to: "/ai/agents", icon: Network },
  { label: "Blockchain", to: "/ai/blockchain", icon: Link2 },
  { label: "Recipes", to: "/ai/recipes", icon: ChefHat },
  { label: "MARL", to: "/ai/marl", icon: Brain },
  { label: "Pricing", to: "/pricing", icon: DollarSign },
  { label: "Bundles", to: "/bundles", icon: Gift },
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Business", to: "/business", icon: BarChart3 },
  { label: "Shelter Queue", to: "/shelter", icon: Users },
  { label: "Explorer", to: "/explorer", icon: BarChart3 },
  { label: "DAO", to: "/dao", icon: Vote },
];

const sections = [
  { label: "How it works", hash: "#features" },
  { label: "Impact Stats", hash: "#impact" },
  { label: "Team", hash: "#team" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-extrabold text-foreground font-display">
            Nourish<span className="text-accent">Net</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {pages.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Sections dropdown (only visible on homepage context) */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50 ${
                dropdownOpen ? "bg-muted/50 text-foreground" : ""
              }`}
            >
              Explore
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-card border border-border rounded-xl shadow-lg py-1 animate-fade-in">
                {sections.map((s) => (
                  <Link
                    key={s.hash}
                    to={`/${s.hash}`}
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="hidden lg:inline-flex rounded-full px-5">
            <Link to="/dashboard">Launch App</Link>
          </Button>

          <button
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {/* Pages */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 pb-1">Pages</p>
            {pages.map((item) => {
              const isActive = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            {/* Sections */}
            <div className="pt-2 border-t border-border/50 mt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 pb-1 pt-2">Explore</p>
              {sections.map((s) => (
                <Link
                  key={s.hash}
                  to={`/${s.hash}`}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors pl-10"
                >
                  {s.label}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-3">
              <Button asChild className="w-full rounded-full">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  Launch App
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

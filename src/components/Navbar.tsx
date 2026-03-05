import {
  Leaf, Menu, Home, LayoutDashboard, Vote, Users, BarChart3,
  Sparkles, Eye, Network, Link2, ChefHat, Brain, DollarSign, Gift,
  Globe, Info, Boxes, Search
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import MegaMenu, { type MegaMenuGroup } from "./navigation/MegaMenu";
import MobileDrawer from "./navigation/MobileDrawer";

// Direct top-level links
const directLinks = [
  { label: "Home", to: "/", icon: Home },
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
];

// Mega menu groups
const menuGroups: MegaMenuGroup[] = [
  {
    label: "AI",
    icon: Sparkles,
    badge: "NEW",
    items: [
      { label: "AI Chat", to: "/ai", icon: Sparkles, description: "Conversational AI assistant" },
      { label: "Vision", to: "/ai/vision", icon: Eye, description: "Computer vision analysis" },
      { label: "Agents", to: "/ai/agents", icon: Network, description: "Multi-agent orchestration" },
      { label: "Blockchain", to: "/ai/blockchain", icon: Link2, description: "On-chain impact tracking" },
      { label: "Recipes", to: "/ai/recipes", icon: ChefHat, description: "Nutrition-first bundling" },
      { label: "MARL Pricing", to: "/ai/marl", icon: Brain, description: "RL dynamic pricing (91%)" },
    ],
  },
  {
    label: "Dashboards",
    icon: BarChart3,
    items: [
      { label: "Business", to: "/business", icon: BarChart3, description: "Revenue & partner metrics" },
      { label: "Shelter Queue", to: "/shelter", icon: Users, description: "Priority matching queue" },
      { label: "Pricing", to: "/pricing", icon: DollarSign, description: "Live pricing waterfall" },
    ],
  },
  {
    label: "Impact",
    icon: Globe,
    items: [
      { label: "Explorer", to: "/explorer", icon: Globe, description: "Live rescue timeline" },
      { label: "EBT Bundles", to: "/bundles", icon: Gift, description: "3x impact multiplier" },
      { label: "DAO", to: "/dao", icon: Vote, description: "Governance & proposals" },
      { label: "About", to: "/about", icon: Info, description: "Mission & team" },
    ],
  },
];

const sections = [
  { label: "How it works", hash: "#features" },
  { label: "Impact Stats", hash: "#impact" },
  { label: "Team", hash: "#team" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b border-border/40"
        style={{
          background: "hsl(var(--card) / 0.85)",
          backdropFilter: "blur(16px) saturate(1.4)",
          WebkitBackdropFilter: "blur(16px) saturate(1.4)",
        }}
        aria-label="primary navigation"
      >
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-extrabold text-foreground font-display">
              Nourish<span className="text-accent">Net</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Direct links */}
            {directLinks.map((item) => {
              const isActive = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            {/* Mega menu groups */}
            {menuGroups.map((group) => (
              <MegaMenu key={group.label} group={group} />
            ))}

            {/* Explore sections (homepage anchors) */}
            {pathname === "/" && (
              <>
                {sections.map((s) => (
                  <Link
                    key={s.hash}
                    to={`/${s.hash}`}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    {s.label}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="hidden lg:inline-flex rounded-full px-5">
              <Link to="/dashboard">Launch App</Link>
            </Button>

            <button
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors text-foreground"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        groups={menuGroups}
        directLinks={directLinks}
      />
    </>
  );
};

export default Navbar;

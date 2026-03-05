import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MegaMenuGroup } from "./MegaMenu";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  groups: MegaMenuGroup[];
  directLinks: { label: string; to: string; icon: React.ComponentType<{ className?: string }> }[];
}

const MobileDrawer = ({ open, onClose, groups, directLinks }: MobileDrawerProps) => {
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-[300px] bg-card border-r border-border",
          "shadow-2xl animate-in slide-in-from-left duration-300",
          "flex flex-col overflow-y-auto"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="text-lg font-extrabold font-display text-foreground">
            Nourish<span className="text-accent">Net</span>
          </span>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Direct Links */}
        <div className="px-3 pt-4 pb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 pb-2">
            Main
          </p>
          {directLinks.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Groups */}
        {groups.map((group) => (
          <div key={group.label} className="px-3 pb-2">
            <button
              onClick={() =>
                setExpanded(expanded === group.label ? null : group.label)
              }
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <group.icon className="h-3.5 w-3.5" />
                {group.label}
                {group.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-accent text-accent-foreground leading-none normal-case">
                    {group.badge}
                  </span>
                )}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  expanded === group.label && "rotate-180"
                )}
              />
            </button>

            {expanded === group.label && (
              <div className="space-y-0.5 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                {group.items.map((item) => {
                  const isActive = pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 pl-9 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* CTA */}
        <div className="mt-auto px-5 py-5 border-t border-border">
          <Button asChild className="w-full rounded-full">
            <Link to="/dashboard" onClick={onClose}>
              Launch App
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;

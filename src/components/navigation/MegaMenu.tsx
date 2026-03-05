import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface MegaMenuGroup {
  label: string;
  icon: LucideIcon;
  badge?: string;
  items: {
    label: string;
    to: string;
    icon: LucideIcon;
    description?: string;
  }[];
}

interface MegaMenuProps {
  group: MegaMenuGroup;
}

const MegaMenu = ({ group }: MegaMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { pathname } = useLocation();

  const isGroupActive = group.items.some((item) => pathname === item.to);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
          isGroupActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <group.icon className="h-4 w-4" />
        {group.label}
        {group.badge && (
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-accent text-accent-foreground leading-none">
            {group.badge}
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full left-0 mt-2 w-72 rounded-xl border border-border/50",
            "bg-card/95 backdrop-blur-xl shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            "p-2"
          )}
          style={{
            boxShadow:
              "0 8px 32px hsl(var(--primary) / 0.08), 0 2px 8px hsl(var(--foreground) / 0.06)",
          }}
        >
          {group.items.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/60"
                )}
              >
                <item.icon className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MegaMenu;

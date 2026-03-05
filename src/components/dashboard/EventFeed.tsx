import { useRef, useEffect } from "react";
import { Radio, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AgentEvent, AgentType } from "@/lib/agents";

const agentColors: Record<AgentType, string> = {
  scout: "border-l-blue-500",
  coordinator: "border-l-amber-500",
  logistics: "border-l-emerald-500",
  human: "border-l-violet-500",
};

const agentLabels: Record<AgentType, string> = {
  scout: "Scout",
  coordinator: "Coordinator",
  logistics: "Logistics",
  human: "Human",
};

interface Props {
  events: AgentEvent[];
  onClear: () => void;
}

const EventFeed = ({ events, onClear }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
          <Radio className="h-4 w-4 text-accent" /> Live Agent Event Feed
        </h3>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-muted-foreground">
          <Trash2 className="h-3 w-3 mr-1" /> Clear
        </Button>
      </div>
      <div className="h-[280px] overflow-y-auto space-y-2 bg-secondary/30 rounded-xl p-3">
        {events.map((e) => (
          <div key={e.id} className={`border-l-[3px] ${agentColors[e.agent]} pl-3 py-1 text-sm text-foreground`}>
            <span className="font-semibold text-muted-foreground">[{agentLabels[e.agent]}]</span>{" "}
            {e.message}
            <span className="text-xs text-muted-foreground/60 ml-2">
              {e.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-muted-foreground">streaming events</span>
      </div>
    </div>
  );
};

export default EventFeed;

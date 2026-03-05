import { Search, GitBranch, Truck } from "lucide-react";
import { motion } from "framer-motion";
import type { AgentType } from "@/lib/agents";

const agentConfig: Record<AgentType, { icon: typeof Search; label: string; model: string; colorClass: string; pulseClass: string }> = {
  scout: { icon: Search, label: "Scout Agent", model: "Llama 3.1 8B", colorClass: "text-blue-500", pulseClass: "shadow-blue-400/40" },
  coordinator: { icon: GitBranch, label: "Coordinator Agent", model: "Mistral 7B", colorClass: "text-amber-500", pulseClass: "shadow-amber-400/40" },
  logistics: { icon: Truck, label: "Logistics Agent", model: "Gemma 2B", colorClass: "text-emerald-500", pulseClass: "shadow-emerald-400/40" },
  human: { icon: Search, label: "Human", model: "", colorClass: "text-violet-500", pulseClass: "" },
};

interface Props {
  agentStates: Record<"scout" | "coordinator" | "logistics", { lastActivity: string; status: string }>;
}

const AgentCards = ({ agentStates }: Props) => {
  const agents: ("scout" | "coordinator" | "logistics")[] = ["scout", "coordinator", "logistics"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {agents.map((key, i) => {
        const cfg = agentConfig[key];
        const state = agentStates[key];
        const Icon = cfg.icon;
        return (
          <motion.div
            key={key}
            className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-secondary ${cfg.colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{cfg.label}</h3>
                  <span className="text-xs text-muted-foreground">{cfg.model}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse`} />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{state.status}</p>
            <p className="text-xs text-muted-foreground/70">Last: {state.lastActivity}</p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AgentCards;

import { ShieldCheck, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HumanTask } from "@/lib/agents";

interface Props {
  tasks: HumanTask[];
  onRespond: (id: string, decision: "accepted" | "rejected") => void;
}

const HumanSupervisor = ({ tasks, onRespond }: Props) => {
  const pending = tasks.filter((t) => t.status === "pending");

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-accent" /> Human Supervisor
        </h3>
        {pending.length > 0 && (
          <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
            {pending.length} pending
          </span>
        )}
      </div>
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`rounded-xl p-4 border ${
              task.status === "pending"
                ? "border-border bg-secondary/30"
                : task.status === "accepted"
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-red-200 bg-red-50/50"
            }`}
          >
            <h4 className="font-semibold text-foreground text-sm">{task.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
            {task.status === "pending" ? (
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => onRespond(task.id, "accepted")} className="text-xs h-8">
                  <Check className="h-3 w-3 mr-1" /> Accept
                </Button>
                <Button size="sm" variant="outline" onClick={() => onRespond(task.id, "rejected")} className="text-xs h-8">
                  <X className="h-3 w-3 mr-1" /> Reject
                </Button>
              </div>
            ) : (
              <span className={`text-xs font-semibold mt-2 inline-block ${task.status === "accepted" ? "text-emerald-600" : "text-red-500"}`}>
                {task.status === "accepted" ? "✓ Accepted" : "✗ Rejected"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HumanSupervisor;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Leaf, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentCards from "@/components/dashboard/AgentCards";
import EventFeed from "@/components/dashboard/EventFeed";
import HumanSupervisor from "@/components/dashboard/HumanSupervisor";
import AgentChatPanel from "@/components/dashboard/AgentChatPanel";
import ImpactDashboard from "@/components/dashboard/ImpactDashboard";
import { PredictionDashboard } from "@/components/PredictionDashboard";
import { useEventFeed, useHumanTasks, useImpactCounters, useAgentChat } from "@/lib/agents";

const Dashboard = () => {
  const { events, clear } = useEventFeed(3500);
  const { tasks, respond } = useHumanTasks();
  const { meals, co2, people } = useImpactCounters();
  const { messages, send } = useAgentChat();

  // Derive agent states from latest events
  const lastEvent = (agent: string) => {
    const e = [...events].reverse().find((ev) => ev.agent === agent);
    return e ? e.message : "Waiting…";
  };

  const agentStates = {
    scout: { lastActivity: "just now", status: lastEvent("scout") },
    coordinator: { lastActivity: "just now", status: lastEvent("coordinator") },
    logistics: { lastActivity: "just now", status: lastEvent("logistics") },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-accent" />
              <span className="text-lg font-bold text-primary font-display">NourishNet Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-muted-foreground">3 agents active</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 space-y-6">
        {/* Agent Status Cards */}
        <AgentCards agentStates={agentStates} />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <EventFeed events={events} onClear={clear} />
            <ImpactDashboard meals={meals} co2={co2} people={people} />
            <PredictionDashboard businessId="demo-business" />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <HumanSupervisor tasks={tasks} onRespond={respond} />
            <AgentChatPanel messages={messages} onSend={send} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Eye, Shield, Truck, Link2, Cpu, Activity, Zap,
  CheckCircle2, AlertTriangle, Clock, ArrowRight, Wifi,
  Brain, Network, Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import Footer from "@/components/Footer";

interface AgentNode {
  id: string;
  name: string;
  model: string;
  icon: typeof Bot;
  color: string;
  bgColor: string;
  status: "idle" | "processing" | "complete" | "error";
  lastAction: string;
  throughput: number;
  accuracy: number;
  latency: string;
}

interface PipelineEvent {
  id: string;
  timestamp: Date;
  fromAgent: string;
  toAgent: string;
  eventType: string;
  payload: string;
  status: "pending" | "delivered" | "processed";
}

const initialAgents: AgentNode[] = [
  { id: "scout", name: "Scout Vision", model: "YOLOv8n + Llama 3.1", icon: Eye, color: "text-primary", bgColor: "bg-primary/10", status: "idle", lastAction: "Monitoring bins…", throughput: 847, accuracy: 95.2, latency: "4.1ms" },
  { id: "risk", name: "Risk Engine", model: "Isolation Forest + XGBoost", icon: Shield, color: "text-accent", bgColor: "bg-accent/10", status: "idle", lastAction: "Scoring waste risk…", throughput: 1243, accuracy: 94.0, latency: "12ms" },
  { id: "coordinator", name: "Coordinator", model: "Mistral 7B v0.3", icon: Brain, color: "text-primary", bgColor: "bg-primary/10", status: "idle", lastAction: "Matching nutrition gaps…", throughput: 523, accuracy: 94.0, latency: "380ms" },
  { id: "logistics", name: "Logistics", model: "Gemma 2B + Maps API", icon: Truck, color: "text-accent", bgColor: "bg-accent/10", status: "idle", lastAction: "Optimizing routes…", throughput: 312, accuracy: 97.0, latency: "1.2s" },
  { id: "blockchain", name: "Blockchain", model: "Polygon PoS + ERC-721", icon: Link2, color: "text-primary", bgColor: "bg-primary/10", status: "idle", lastAction: "Minting NFTs…", throughput: 189, accuracy: 100, latency: "2.3s" },
];

const eventTemplates = [
  { from: "scout", to: "risk", type: "waste.detected", payload: "4.2kg salmon · 96% conf · Bin #3" },
  { from: "risk", to: "coordinator", type: "waste.critical", payload: "92% waste risk · £127 value · 3.5h expiry" },
  { from: "coordinator", to: "logistics", type: "match.ready", payload: "Shelter Ahmed · Protein gap -43% · Score 94/100" },
  { from: "logistics", to: "blockchain", type: "rescue.dispatched", payload: "Driver Kenji · ETA 18min · 2.3km route" },
  { from: "blockchain", to: "scout", type: "impact.verified", payload: "NFT #8847 minted · 12 meals · 3.1kg CO₂ saved" },
];

const AgentOrchestration = () => {
  const [agents, setAgents] = useState<AgentNode[]>(initialAgents);
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [activeStep, setActiveStep] = useState(-1);
  const [totalEvents, setTotalEvents] = useState(4827);
  const [avgLatency, setAvgLatency] = useState(7.4);
  const [isRunning, setIsRunning] = useState(true);
  const cycleRef = useRef(0);

  useEffect(() => {
    if (!isRunning) return;

    const runCycle = () => {
      const stepIdx = cycleRef.current % eventTemplates.length;
      const template = eventTemplates[stepIdx];

      setActiveStep(stepIdx);

      // Activate sending agent
      setAgents(prev => prev.map(a =>
        a.id === template.from ? { ...a, status: "processing", lastAction: `Sending ${template.type}…` } :
        a.id === template.to ? { ...a, status: "processing", lastAction: `Receiving ${template.type}…` } :
        { ...a, status: a.status === "processing" ? "complete" : a.status }
      ));

      const newEvent: PipelineEvent = {
        id: `evt-${Date.now()}-${stepIdx}`,
        timestamp: new Date(),
        fromAgent: template.from,
        toAgent: template.to,
        eventType: template.type,
        payload: template.payload,
        status: "pending",
      };

      setEvents(prev => [newEvent, ...prev].slice(0, 12));
      setTotalEvents(t => t + 1);

      // Mark as delivered after short delay
      setTimeout(() => {
        setEvents(prev => prev.map((e, i) => i === 0 ? { ...e, status: "delivered" } : e));
        setAgents(prev => prev.map(a =>
          a.id === template.to ? { ...a, status: "processing", lastAction: template.payload } : a
        ));
      }, 800);

      // Mark as processed
      setTimeout(() => {
        setEvents(prev => prev.map((e, i) => i === 0 ? { ...e, status: "processed" } : e));
        setAgents(prev => prev.map(a =>
          a.id === template.to ? { ...a, status: "complete", lastAction: `Processed: ${template.type}`, throughput: a.throughput + 1 } :
          a.id === template.from ? { ...a, status: "complete" } : a
        ));
      }, 2200);

      // Reset
      setTimeout(() => {
        setAgents(prev => prev.map(a => ({ ...a, status: "idle" })));
        setActiveStep(-1);
      }, 3500);

      cycleRef.current++;
    };

    runCycle();
    const interval = setInterval(runCycle, 5000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const getAgentName = (id: string) => agents.find(a => a.id === id)?.name ?? id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Breadcrumbs />
      <main className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Network className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
                Agent Orchestration
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Live 5-agent MCP pipeline — Scout → Risk → Coordinator → Logistics → Blockchain
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isRunning ? "default" : "outline"}
              onClick={() => setIsRunning(!isRunning)}
              className="rounded-full"
            >
              {isRunning ? <><Wifi className="h-4 w-4 mr-2" /> Pipeline Active</> : <><Cpu className="h-4 w-4 mr-2" /> Resume Pipeline</>}
            </Button>
            {isRunning && (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-muted-foreground">MCP Bus</span>
              </div>
            )}
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: totalEvents.toLocaleString(), icon: Activity, color: "text-primary" },
            { label: "Agents Active", value: `${agents.filter(a => a.status !== "error").length}/5`, icon: Bot, color: "text-primary" },
            { label: "Avg Latency", value: `${avgLatency.toFixed(1)}s`, icon: Clock, color: "text-accent" },
            { label: "Pipeline Uptime", value: "99.7%", icon: Zap, color: "text-primary" },
          ].map(m => (
            <Card key={m.label}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{m.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
                  </div>
                  <m.icon className={`h-5 w-5 ${m.color} opacity-50`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Agent Pipeline Visualization */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Live Agent Pipeline
              {activeStep >= 0 && (
                <Badge variant="outline" className="ml-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse mr-1" />
                  Processing Step {activeStep + 1}/5
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-3 py-4">
              {agents.map((agent, i) => {
                const isActive = activeStep >= 0 && (
                  eventTemplates[activeStep]?.from === agent.id ||
                  eventTemplates[activeStep]?.to === agent.id
                );
                const isSender = activeStep >= 0 && eventTemplates[activeStep]?.from === agent.id;
                const isReceiver = activeStep >= 0 && eventTemplates[activeStep]?.to === agent.id;

                return (
                  <div key={agent.id} className="flex items-center gap-3">
                    <motion.div
                      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.6, repeat: isActive ? Infinity : 0 }}
                      className={`relative flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border-2 transition-all duration-300 min-w-[120px] ${
                        isActive ? "border-accent bg-accent/5 shadow-md" :
                        agent.status === "complete" ? "border-primary/30 bg-primary/5" :
                        "border-border bg-card"
                      }`}
                    >
                      {/* Status indicator */}
                      <div className={`absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-background ${
                        agent.status === "processing" ? "bg-accent animate-pulse" :
                        agent.status === "complete" ? "bg-primary" :
                        agent.status === "error" ? "bg-destructive" :
                        "bg-muted-foreground/30"
                      }`} />

                      <agent.icon className={`h-6 w-6 ${isActive ? "text-accent" : agent.color}`} />
                      <div className="text-center">
                        <p className={`text-xs font-bold ${isActive ? "text-accent" : "text-foreground"}`}>
                          {agent.name}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{agent.model}</p>
                      </div>

                      {/* Mini stats */}
                      <div className="flex gap-2 text-[9px] text-muted-foreground">
                        <span>{agent.accuracy}%</span>
                        <span>·</span>
                        <span>{agent.latency}</span>
                      </div>

                      {/* Direction indicators */}
                      {isSender && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute -bottom-5 text-[9px] font-semibold text-accent"
                        >
                          SENDING →
                        </motion.div>
                      )}
                      {isReceiver && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute -bottom-5 text-[9px] font-semibold text-primary"
                        >
                          ← RECEIVING
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Connector arrow */}
                    {i < agents.length - 1 && (
                      <div className="flex items-center">
                        <motion.div
                          animate={activeStep === i ? { scaleX: [1, 1.3, 1], opacity: [0.5, 1, 0.5] } : {}}
                          transition={{ duration: 0.8, repeat: activeStep === i ? Infinity : 0 }}
                          className={`w-8 h-0.5 rounded-full transition-colors ${
                            activeStep === i ? "bg-accent" : "bg-border"
                          }`}
                        />
                        <ArrowRight className={`h-3 w-3 -ml-1 ${activeStep === i ? "text-accent" : "text-border"}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Current action */}
            <AnimatePresence mode="wait">
              {activeStep >= 0 && (
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-6 px-4 py-3 rounded-xl bg-secondary/50 border border-border text-center"
                >
                  <p className="text-sm text-foreground">
                    <span className="font-semibold text-accent">{getAgentName(eventTemplates[activeStep].from)}</span>
                    {" → "}
                    <span className="font-semibold text-primary">{getAgentName(eventTemplates[activeStep].to)}</span>
                    {" · "}
                    <span className="text-muted-foreground">{eventTemplates[activeStep].payload}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Agent Detail Cards + Event Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Agent Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agents.map(agent => (
              <Card key={agent.id} className={`transition-all ${
                agent.status === "processing" ? "border-accent/40 shadow-sm" : ""
              }`}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-xl ${agent.bgColor} flex items-center justify-center`}>
                      <agent.icon className={`h-5 w-5 ${agent.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-foreground">{agent.name}</p>
                        <Badge variant="outline" className="text-[10px]">
                          {agent.status === "processing" ? "⚡ Active" : agent.status === "complete" ? "✓ Done" : "○ Idle"}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{agent.model}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3 truncate">{agent.lastAction}</p>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <p className="text-sm font-bold text-foreground">{agent.throughput}</p>
                      <p className="text-[9px] text-muted-foreground">Events</p>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <p className="text-sm font-bold text-primary">{agent.accuracy}%</p>
                      <p className="text-[9px] text-muted-foreground">Accuracy</p>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <p className="text-sm font-bold text-accent">{agent.latency}</p>
                      <p className="text-[9px] text-muted-foreground">Latency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Event Feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                MCP Event Bus
              </h2>
              <Badge variant="outline" className="text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                Live
              </Badge>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              <AnimatePresence>
                {events.map(event => {
                  const mins = Math.floor((Date.now() - event.timestamp.getTime()) / 1000);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Card className={`transition-all ${
                        event.status === "pending" ? "border-accent/30 bg-accent/5" : ""
                      }`}>
                        <CardContent className="py-3 px-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-[9px] ${
                              event.status === "processed" ? "bg-primary/10 text-primary" :
                              event.status === "delivered" ? "bg-accent/10 text-accent" :
                              "bg-secondary text-secondary-foreground"
                            }`}>
                              {event.eventType}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground ml-auto">{mins}s ago</span>
                          </div>
                          <p className="text-xs text-foreground">
                            <span className="font-semibold">{getAgentName(event.fromAgent)}</span>
                            <ArrowRight className="inline h-3 w-3 mx-1 text-muted-foreground" />
                            <span className="font-semibold">{getAgentName(event.toAgent)}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{event.payload}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {event.status === "processed" && <CheckCircle2 className="h-3 w-3 text-primary" />}
                            {event.status === "delivered" && <Zap className="h-3 w-3 text-accent" />}
                            {event.status === "pending" && <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />}
                            <span className="text-[9px] text-muted-foreground capitalize">{event.status}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {events.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Cpu className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Waiting for events…</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Architecture Info */}
        <div className="rounded-3xl p-8 text-primary-foreground" style={{ background: "var(--gradient-impact)" }}>
          <h2 className="text-2xl font-bold mb-2 text-center">OpenClaw MCP Architecture</h2>
          <p className="text-sm opacity-80 text-center mb-6">
            5 autonomous agents coordinated via Model Context Protocol event bus
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {[
              { label: "Scout Vision", detail: "YOLOv8n + Llama 3.1" },
              { label: "Risk Engine", detail: "Isolation Forest + XGBoost" },
              { label: "Coordinator", detail: "Mistral 7B + Nutrition API" },
              { label: "Logistics", detail: "Gemma 2B + Maps" },
              { label: "Blockchain", detail: "Polygon PoS + ERC-721" },
            ].map(a => (
              <div key={a.label} className="p-3 rounded-xl bg-primary-foreground/10">
                <p className="font-bold text-sm">{a.label}</p>
                <p className="text-[10px] opacity-70 mt-1">{a.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AgentOrchestration;

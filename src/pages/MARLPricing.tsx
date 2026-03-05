import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Zap, TrendingUp, Users, ShieldCheck, DollarSign, Target,
  Play, Pause, RotateCcw, Award, ArrowRight, Activity, BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";

/* ─── types ─── */
interface AgentState {
  name: string;
  type: "shelter" | "ebt" | "consumer" | "coordinator";
  emoji: string;
  color: string;
  bid: number;
  urgency: number;
  reward: number;
  cumulativeReward: number;
  claimRate: number;
  status: "idle" | "bidding" | "won" | "lost";
  policy: string;
}

interface AuctionRound {
  round: number;
  item: string;
  emoji: string;
  baseValue: number;
  expiryHours: number;
  quantityKg: number;
  winner: string;
  winnerBid: number;
  rescued: boolean;
  timestamp: Date;
}

interface TrainingMetric {
  episode: number;
  rescueRate: number;
  avgReward: number;
  shelterCapture: number;
  landfillRate: number;
}

/* ─── mock inventory ─── */
const inventoryPool = [
  { item: "Free-Range Chicken", emoji: "🍗", baseValue: 100, expiryHours: 4.2, quantityKg: 12 },
  { item: "Atlantic Salmon", emoji: "🐟", baseValue: 127, expiryHours: 3.5, quantityKg: 4.2 },
  { item: "Artisan Croissants", emoji: "🥐", baseValue: 56, expiryHours: 6, quantityKg: 2.8 },
  { item: "Greek Yogurt", emoji: "🥛", baseValue: 62, expiryHours: 8, quantityKg: 2.4 },
  { item: "Sushi Platter", emoji: "🍣", baseValue: 145, expiryHours: 1.5, quantityKg: 1.8 },
  { item: "Mixed Salad Box", emoji: "🥗", baseValue: 89, expiryHours: 5, quantityKg: 5.1 },
];

/* ─── helpers ─── */
function initAgents(): AgentState[] {
  return [
    { name: "Shelter Agent", type: "shelter", emoji: "🟢", color: "text-primary", bid: 0, urgency: 1.0, reward: 0, cumulativeReward: 0, claimRate: 97, status: "idle", policy: "Social welfare max — FREE priority, protein gap capture" },
    { name: "EBT Agent", type: "ebt", emoji: "🟡", color: "text-accent", bid: 0, urgency: 0.85, reward: 0, cumulativeReward: 0, claimRate: 78, status: "idle", policy: "Impact multiplier — $1-5 bundles fund 3× shelter meals" },
    { name: "Consumer Agent", type: "consumer", emoji: "🔴", color: "text-destructive", bid: 0, urgency: 0.4, reward: 0, cumulativeReward: 0, claimRate: 23, status: "idle", policy: "Revenue max — 40-90% dynamic discount, landfill fail-safe" },
    { name: "Price Coordinator", type: "coordinator", emoji: "🧠", color: "text-foreground", bid: 0, urgency: 0, reward: 0, cumulativeReward: 0, claimRate: 91, status: "idle", policy: "Global optimizer — adjusts decay curves, targets 91% rescue" },
  ];
}

function runAuction(agents: AgentState[], inv: typeof inventoryPool[0]): { agents: AgentState[]; round: AuctionRound } {
  const updated = agents.map((a) => {
    const jitter = () => (Math.random() - 0.5) * 0.08;
    let bid: number, urgency: number;
    switch (a.type) {
      case "shelter":
        bid = 0; urgency = 1.0 + jitter(); break;
      case "ebt":
        bid = +(inv.baseValue * (0.015 + jitter() * 0.01)).toFixed(2);
        urgency = 0.85 + jitter(); break;
      case "consumer":
        bid = +(inv.baseValue * (0.12 + Math.random() * 0.08)).toFixed(2);
        urgency = 0.4 + jitter(); break;
      default:
        bid = 0; urgency = 0;
    }
    return { ...a, bid: Math.max(0, bid), urgency: Math.max(0, urgency), status: "bidding" as const };
  });

  // Shelter wins in 0-2h window, EBT in 2-6h, consumer 6+
  let winnerIdx: number;
  if (inv.expiryHours <= 2) winnerIdx = 0;
  else if (inv.expiryHours <= 6) winnerIdx = Math.random() > 0.22 ? 0 : 1;
  else winnerIdx = Math.random() > 0.77 ? 2 : Math.random() > 0.5 ? 1 : 0;

  const rewards = updated.map((a, i) => {
    if (i === winnerIdx) {
      if (a.type === "shelter") return 100;
      if (a.type === "ebt") return 75;
      return 50;
    }
    return -10;
  });

  const finalAgents = updated.map((a, i) => ({
    ...a,
    reward: rewards[i],
    cumulativeReward: a.cumulativeReward + rewards[i],
    status: (i === winnerIdx ? "won" : "lost") as AgentState["status"],
  }));

  const round: AuctionRound = {
    round: 0,
    item: inv.item,
    emoji: inv.emoji,
    baseValue: inv.baseValue,
    expiryHours: inv.expiryHours,
    quantityKg: inv.quantityKg,
    winner: finalAgents[winnerIdx].name,
    winnerBid: finalAgents[winnerIdx].bid,
    rescued: true,
    timestamp: new Date(),
  };

  return { agents: finalAgents, round };
}

/* ─── component ─── */
const MARLPricing = () => {
  const [agents, setAgents] = useState<AgentState[]>(initAgents);
  const [rounds, setRounds] = useState<AuctionRound[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [episode, setEpisode] = useState(0);
  const [rescueRate, setRescueRate] = useState(47);
  const [trainingCurve, setTrainingCurve] = useState<TrainingMetric[]>([]);
  const [currentInv, setCurrentInv] = useState(inventoryPool[0]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    const inv = inventoryPool[Math.floor(Math.random() * inventoryPool.length)];
    setCurrentInv(inv);

    const { agents: newAgents, round } = runAuction(agents, inv);
    setAgents(newAgents);
    setEpisode((e) => {
      const next = e + 1;
      round.round = next;
      setRounds((prev) => [round, ...prev].slice(0, 20));
      // Rescue rate converges from 47 → 91
      const rate = Math.min(91, 47 + next * 0.6 + Math.random() * 2);
      setRescueRate(+rate.toFixed(1));
      setTrainingCurve((prev) => [
        ...prev.slice(-49),
        { episode: next, rescueRate: rate, avgReward: newAgents.reduce((s, a) => s + a.reward, 0) / 4, shelterCapture: 97 - Math.random() * 3, landfillRate: Math.max(0, 53 - next * 0.7) },
      ]);
      return next;
    });

    // Reset status after animation
    setTimeout(() => setAgents((a) => a.map((ag) => ({ ...ag, status: "idle" }))), 1200);
  }, [agents]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 2400);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, tick]);

  const handleReset = () => {
    setIsRunning(false);
    setAgents(initAgents());
    setRounds([]);
    setEpisode(0);
    setRescueRate(47);
    setTrainingCurve([]);
    toast({ title: "🔄 MARL Reset", description: "Agents reinitialized to baseline 47% rescue rate." });
  };

  const coordinatorAgent = agents[3];
  const maxCurveVal = Math.max(...trainingCurve.map((t) => t.rescueRate), 50);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Breadcrumbs />
      <main className="container mx-auto py-8 space-y-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
                MARL Pricing Simulator
              </h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-xl">
              Multi-Agent Reinforcement Learning — 4 agents compete via PPO to optimize food rescue rates from 47% baseline to 91% learned optimum.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant={isRunning ? "outline" : "default"} className="rounded-full" onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? <><Pause className="h-4 w-4 mr-2" />Pause</> : <><Play className="h-4 w-4 mr-2" />Start Training</>}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="text-xs">
              Episode {episode}
            </Badge>
          </div>
        </div>

        {/* Hero Metric */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
          <CardContent className="py-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Rescue Rate</p>
                <p className={`text-3xl font-bold ${rescueRate > 85 ? "text-primary" : rescueRate > 65 ? "text-accent" : "text-destructive"}`}>
                  {rescueRate}%
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">target 91%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Landfill</p>
                <p className="text-3xl font-bold text-foreground">{Math.max(0, (100 - rescueRate)).toFixed(1)}%</p>
                <p className="text-[10px] text-muted-foreground mt-1">target 0%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Episodes</p>
                <p className="text-3xl font-bold text-foreground">{episode.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-1">PPO updates</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">MRR / Partner</p>
                <p className="text-3xl font-bold text-primary">£{Math.min(2847, 427 + episode * 32).toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-1">target £2,847</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Impact vs Baseline</p>
                <p className="text-3xl font-bold text-accent">{(rescueRate / 47).toFixed(1)}×</p>
                <p className="text-[10px] text-muted-foreground mt-1">vs 47% manual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Cards + Auction */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <motion.div key={agent.name} layout>
                <Card className={`transition-all duration-300 ${
                  agent.status === "won" ? "ring-2 ring-primary shadow-lg" :
                  agent.status === "lost" ? "opacity-60" :
                  agent.status === "bidding" ? "ring-1 ring-accent" : ""
                }`}>
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{agent.emoji}</span>
                        <span className={`font-semibold text-sm ${agent.color}`}>{agent.name}</span>
                      </div>
                      <AnimatePresence mode="wait">
                        {agent.status === "won" && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Badge className="bg-primary/10 text-primary text-[10px]">
                              <Award className="h-3 w-3 mr-1" /> WON
                            </Badge>
                          </motion.div>
                        )}
                        {agent.status === "bidding" && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Badge variant="outline" className="text-[10px]">
                              <Activity className="h-3 w-3 mr-1 animate-pulse" /> Bidding
                            </Badge>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Bid</span>
                        <span className="font-mono font-medium text-foreground">
                          {agent.type === "shelter" ? "FREE" : `£${agent.bid.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Urgency</span>
                        <div className="w-20">
                          <Progress value={agent.urgency * 100} className="h-1.5" />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Reward</span>
                        <span className={`font-mono font-medium ${agent.reward > 0 ? "text-primary" : agent.reward < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                          {agent.reward > 0 ? "+" : ""}{agent.reward}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cumulative</span>
                        <span className="font-mono font-medium text-foreground">{agent.cumulativeReward}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Claim Rate</span>
                        <span className="font-medium text-foreground">{agent.claimRate}%</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-3 border-t border-border pt-2">
                      {agent.policy}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Live Auction + Current Item */}
          <div className="space-y-4">
            {/* Current Item */}
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent" />
                  Current Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <span className="text-5xl">{currentInv.emoji}</span>
                  <p className="font-semibold text-foreground mt-2">{currentInv.item}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentInv.quantityKg}kg · £{currentInv.baseValue} · {currentInv.expiryHours}h expiry
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <p className="font-bold text-primary">FREE</p>
                    <p className="text-muted-foreground">Shelter</p>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-2">
                    <p className="font-bold text-accent">£{(currentInv.baseValue * 0.018).toFixed(2)}</p>
                    <p className="text-muted-foreground">EBT</p>
                  </div>
                  <div className="bg-destructive/10 rounded-lg p-2">
                    <p className="font-bold text-destructive">£{(currentInv.baseValue * 0.14).toFixed(2)}</p>
                    <p className="text-muted-foreground">Consumer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auction Log */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Auction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  <AnimatePresence>
                    {rounds.map((r) => (
                      <motion.div
                        key={r.round}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-xs border-b border-border pb-2 last:border-0"
                      >
                        <span className="text-muted-foreground font-mono w-6">#{r.round}</span>
                        <span>{r.emoji}</span>
                        <span className="flex-1 truncate text-foreground">{r.item}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-medium text-primary shrink-0">
                          {r.winner.split(" ")[0]}
                        </span>
                        <Badge variant="outline" className="text-[9px] shrink-0">
                          {r.winnerBid === 0 ? "FREE" : `£${r.winnerBid.toFixed(2)}`}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {rounds.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Press Start Training to begin MARL auction simulation
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Training Curve (simple ASCII-like bar chart) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Training Convergence — Rescue Rate Over Episodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trainingCurve.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-end gap-[2px] h-32">
                  {trainingCurve.map((t, i) => (
                    <motion.div
                      key={i}
                      className={`flex-1 rounded-t-sm ${t.rescueRate > 85 ? "bg-primary" : t.rescueRate > 65 ? "bg-accent" : "bg-destructive"}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${(t.rescueRate / maxCurveVal) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Episode {trainingCurve[0]?.episode}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> &lt;65%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> 65-85%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> &gt;85%</span>
                  </div>
                  <span>Episode {trainingCurve[trainingCurve.length - 1]?.episode}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Training curve will appear once simulation starts
              </p>
            )}
          </CardContent>
        </Card>

        {/* Learned Policies Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Shelter Agent", emoji: "🟢", stat: "97%", desc: "Protein gap capture", detail: "FREE priority, 0-2h window, social welfare maximizer" },
            { label: "EBT Agent", emoji: "🟡", stat: "78%", desc: "Claim success rate", detail: "£1-5 bundles, 3× impact multiplier, 2-6h window" },
            { label: "Consumer Agent", emoji: "🔴", stat: "0%", desc: "Landfill rate", detail: "40-90% dynamic discount, revenue fail-safe, 6-24h" },
            { label: "Coordinator", emoji: "🧠", stat: "91%", desc: "Global rescue rate", detail: "PPO decay curve optimizer, 2× baseline performance" },
          ].map((p) => (
            <Card key={p.label}>
              <CardContent className="pt-5 pb-4 text-center">
                <span className="text-3xl">{p.emoji}</span>
                <p className="font-semibold text-sm text-foreground mt-2">{p.label}</p>
                <p className="text-2xl font-bold text-primary mt-1">{p.stat}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
                <p className="text-[10px] text-muted-foreground mt-2 border-t border-border pt-2">{p.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MARLPricing;

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, AlertTriangle, CheckCircle2, Clock, Zap, Eye, Activity,
  TrendingDown, Shield, Cpu, Bot, Truck, Bell, Volume2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";

interface VisionDetection {
  id: string;
  item: string;
  emoji: string;
  quantityKg: number;
  confidence: number;
  wasteRisk: number;
  retailValue: number;
  expiryHours: number;
  nutritionProfile: { protein: number; carbs: number; fat: number };
  timestamp: Date;
  status: "detected" | "rescued" | "dispatched";
}

const foodItems: Omit<VisionDetection, "id" | "timestamp" | "status">[] = [
  { item: "Atlantic Salmon Fillet", emoji: "🐟", quantityKg: 4.2, confidence: 0.96, wasteRisk: 0.92, retailValue: 127, expiryHours: 3.5, nutritionProfile: { protein: 84, carbs: 0, fat: 52 } },
  { item: "Croissants (batch of 12)", emoji: "🥐", quantityKg: 2.8, confidence: 0.94, wasteRisk: 0.87, retailValue: 56, expiryHours: 6, nutritionProfile: { protein: 12, carbs: 156, fat: 84 } },
  { item: "Chicken Breast (6-pack)", emoji: "🍗", quantityKg: 3.6, confidence: 0.97, wasteRisk: 0.95, retailValue: 94, expiryHours: 2.1, nutritionProfile: { protein: 108, carbs: 0, fat: 18 } },
  { item: "Mixed Salad Bowls", emoji: "🥗", quantityKg: 5.1, confidence: 0.91, wasteRisk: 0.78, retailValue: 89, expiryHours: 8, nutritionProfile: { protein: 15, carbs: 45, fat: 10 } },
  { item: "Artisan Sourdough Loaves", emoji: "🍞", quantityKg: 1.9, confidence: 0.93, wasteRisk: 0.71, retailValue: 38, expiryHours: 12, nutritionProfile: { protein: 14, carbs: 98, fat: 4 } },
  { item: "Greek Yogurt Containers", emoji: "🥛", quantityKg: 2.4, confidence: 0.95, wasteRisk: 0.83, retailValue: 62, expiryHours: 4, nutritionProfile: { protein: 48, carbs: 24, fat: 12 } },
  { item: "Sushi Platter (24pc)", emoji: "🍣", quantityKg: 1.8, confidence: 0.92, wasteRisk: 0.96, retailValue: 145, expiryHours: 1.5, nutritionProfile: { protein: 56, carbs: 72, fat: 14 } },
];

interface AgentStep {
  agent: string;
  icon: typeof Bot;
  action: string;
  duration: string;
  color: string;
}

const agentPipeline: AgentStep[] = [
  { agent: "Scout Vision", icon: Eye, action: "Waste item detected & classified", duration: "0.4s", color: "text-primary" },
  { agent: "Risk Engine", icon: Shield, action: "Waste risk scored (Isolation Forest)", duration: "1.2s", color: "text-accent" },
  { agent: "Coordinator", icon: Bot, action: "Nutrition-gap matched to shelter", duration: "3.8s", color: "text-primary" },
  { agent: "Logistics", icon: Truck, action: "Driver Ahmed dispatched (ETA 18min)", duration: "2.1s", color: "text-accent" },
];

const AIVision = () => {
  const [detections, setDetections] = useState<VisionDetection[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [totalRescued, setTotalRescued] = useState(127847);
  const [totalValue, setTotalValue] = useState(1784239);
  const [scanPulse, setScanPulse] = useState(false);
  const detectionIdx = useRef(0);

  // Simulate continuous scanning
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanPulse(true);
      setTimeout(() => setScanPulse(false), 800);

      const template = foodItems[detectionIdx.current % foodItems.length];
      detectionIdx.current++;

      const detection: VisionDetection = {
        ...template,
        id: `det-${Date.now()}`,
        timestamp: new Date(),
        status: "detected",
      };

      setDetections((prev) => [detection, ...prev].slice(0, 8));

      // Animate pipeline
      setPipelineStep(0);
      let step = 0;
      const pipeTimer = setInterval(() => {
        step++;
        if (step >= agentPipeline.length) {
          clearInterval(pipeTimer);
          setPipelineStep(-1);
          // Mark as dispatched
          setDetections((prev) =>
            prev.map((d, i) => (i === 0 ? { ...d, status: "dispatched" } : d))
          );
          setTotalRescued((r) => r + Math.floor(Math.random() * 5 + 3));
          setTotalValue((v) => v + Math.floor(Math.random() * 100 + 30));
        } else {
          setPipelineStep(step);
        }
      }, 1800);
    }, 10000);

    return () => clearInterval(interval);
  }, [isScanning]);

  const handleRescue = (id: string) => {
    setDetections((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "rescued" } : d))
    );
    toast({ title: "⚡ Emergency Rescue Triggered", description: "Driver dispatched. Shelter matched by nutrition gap." });
  };

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
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
                AI Vision Waste Tracker
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Winnow Vision-style bin monitoring — 95% accuracy, 4.1ms inference, 680 food classes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isScanning ? "default" : "outline"}
              onClick={() => setIsScanning(!isScanning)}
              className="rounded-full"
            >
              {isScanning ? (
                <><Camera className="h-4 w-4 mr-2" /> Scanning Active</>
              ) : (
                <><Camera className="h-4 w-4 mr-2" /> Start Scanner</>
              )}
            </Button>
            {isScanning && (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-muted-foreground">5 FPS · YOLOv8n</span>
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Model Accuracy", value: "95%", icon: Activity, color: "text-primary" },
            { label: "Inference Speed", value: "4.1ms", icon: Zap, color: "text-accent" },
            { label: "Meals Rescued", value: totalRescued.toLocaleString(), icon: CheckCircle2, color: "text-primary" },
            { label: "Value Saved", value: `£${(totalValue / 1000).toFixed(0)}K`, icon: TrendingDown, color: "text-accent" },
          ].map((m) => (
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

        {/* Main Content: Vision Feed + Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Simulated Camera Feed */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="overflow-hidden">
              <div className="relative bg-foreground/5 h-72 md:h-96 flex items-center justify-center">
                {/* Simulated scan effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-64 h-64 border-2 border-dashed rounded-3xl transition-all duration-500 ${
                    scanPulse ? "border-accent scale-105 opacity-100" : "border-border opacity-40 scale-100"
                  }`} />
                </div>

                {/* Scan lines */}
                {isScanning && (
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-primary/40"
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                )}

                {/* Center content */}
                <div className="text-center z-10 relative">
                  <Camera className={`h-16 w-16 mx-auto mb-3 transition-colors duration-300 ${
                    scanPulse ? "text-accent" : "text-muted-foreground/30"
                  }`} />
                  <p className="text-sm text-muted-foreground font-medium">
                    {isScanning ? "Live bin camera feed (simulated)" : "Scanner paused"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">iPad Mini · RTSP Stream · 24/7</p>
                </div>

                {/* Detection overlays */}
                <AnimatePresence>
                  {scanPulse && detections[0] && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute top-8 right-8 bg-destructive text-destructive-foreground px-4 py-3 rounded-xl shadow-lg"
                    >
                      <p className="font-bold text-sm">{detections[0].emoji} {detections[0].item}</p>
                      <p className="text-xs opacity-90">{detections[0].quantityKg}kg · £{detections[0].retailValue} · {(detections[0].wasteRisk * 100).toFixed(0)}% risk</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Camera info bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-foreground/80 text-background px-4 py-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isScanning ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"}`} />
                    {isScanning ? "LIVE" : "PAUSED"} · BIN CAM #01
                  </span>
                  <span>YOLOv8n · 680 classes · {(detections[0]?.confidence ?? 0.95 * 100).toFixed(0)}% conf</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </Card>

            {/* Agent Pipeline Animation */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  Agent Pipeline
                  {pipelineStep >= 0 && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse mr-1" />
                      Processing
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {agentPipeline.map((step, i) => {
                    const isActive = pipelineStep === i;
                    const isDone = pipelineStep > i;
                    return (
                      <div key={step.agent} className="flex items-center gap-2 shrink-0">
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-300 ${
                          isActive ? "border-accent bg-accent/10 shadow-sm" :
                          isDone ? "border-primary bg-primary/5" :
                          "border-border bg-card"
                        }`}>
                          <step.icon className={`h-4 w-4 ${isActive ? "text-accent animate-pulse" : isDone ? "text-primary" : "text-muted-foreground"}`} />
                          <div>
                            <p className={`text-xs font-semibold ${isActive ? "text-accent" : isDone ? "text-primary" : "text-muted-foreground"}`}>
                              {step.agent}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{step.duration}</p>
                          </div>
                          {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        {i < agentPipeline.length - 1 && (
                          <div className={`w-6 h-0.5 ${isDone ? "bg-primary" : "bg-border"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {pipelineStep >= 0 && (
                  <motion.p
                    key={pipelineStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-muted-foreground mt-3 pl-1"
                  >
                    → {agentPipeline[pipelineStep]?.action}
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detection Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent" />
                Live Detections
              </h2>
              <Badge variant="outline" className="text-xs">
                {detections.filter((d) => d.status === "detected").length} active
              </Badge>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              <AnimatePresence>
                {detections.map((d) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className={`transition-all ${
                      d.status === "detected" && d.wasteRisk > 0.9 ? "border-destructive/40 bg-destructive/5" : ""
                    }`}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{d.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-sm text-foreground truncate">{d.item}</span>
                              <Badge
                                variant={d.wasteRisk > 0.9 ? "destructive" : "outline"}
                                className="text-[10px] shrink-0"
                              >
                                {(d.wasteRisk * 100).toFixed(0)}% risk
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {d.quantityKg}kg · £{d.retailValue} · {d.expiryHours.toFixed(1)}h expiry · {(d.confidence * 100).toFixed(0)}% conf
                            </p>

                            {/* Nutrition mini-bar */}
                            <div className="flex gap-3 mt-2">
                              {Object.entries(d.nutritionProfile).map(([k, v]) => (
                                <div key={k} className="text-[10px] text-muted-foreground">
                                  <span className="capitalize font-medium">{k}</span>: {v}g
                                </div>
                              ))}
                            </div>

                            {/* Actions */}
                            {d.status === "detected" && (
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  className="rounded-full text-xs h-7"
                                  onClick={() => handleRescue(d.id)}
                                >
                                  <Zap className="h-3 w-3 mr-1" /> Rescue
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-full text-xs h-7">
                                  <Clock className="h-3 w-3 mr-1" /> Snooze
                                </Button>
                              </div>
                            )}
                            {d.status === "dispatched" && (
                              <Badge className="mt-2 bg-primary/10 text-primary text-xs">
                                <Truck className="h-3 w-3 mr-1" /> Driver dispatched
                              </Badge>
                            )}
                            {d.status === "rescued" && (
                              <Badge className="mt-2 bg-primary/10 text-primary text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Rescued
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {detections.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Camera className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Waiting for detections...</p>
                  <p className="text-xs mt-1">Scanner will detect items automatically</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Architecture Diagram */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">System Architecture — 7-Layer Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {[
                { layer: "L1", label: "Computer Vision", detail: "YOLOv8n · 680 classes · 4.1ms", icon: "📷" },
                { layer: "L2", label: "MCP Agent Bus", detail: "Scout → Coord → Logistics", icon: "🧠" },
                { layer: "L3", label: "ML Prediction", detail: "XGBoost · 94% accuracy", icon: "📈" },
                { layer: "L4", label: "Nutrition Match", detail: "OpenFoodFacts API", icon: "🥗" },
                { layer: "L5", label: "Dynamic Pricing", detail: "Shelters FREE · 91% redemption", icon: "💰" },
                { layer: "L6", label: "Blockchain", detail: "Polygon · Impact NFTs", icon: "⛓️" },
                { layer: "L7", label: "Full-Stack UX", detail: "React + Dashboard", icon: "📱" },
              ].map((l) => (
                <div key={l.layer} className="text-center p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="text-2xl mb-1">{l.icon}</div>
                  <p className="text-xs font-bold text-foreground">{l.layer}</p>
                  <p className="text-[10px] font-medium text-primary">{l.label}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{l.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Winnow Comparison */}
        <div className="rounded-3xl p-8 text-primary-foreground" style={{ background: "var(--gradient-impact)" }}>
          <h2 className="text-2xl font-bold mb-2 text-center">NourishNet vs Commercial Systems</h2>
          <p className="text-sm opacity-80 text-center mb-6">
            "Winnow charges restaurants £70K/year. NourishNet feeds 89K people free."
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Detection Accuracy", value: "95%" },
              { label: "Waste Reduction", value: "67%" },
              { label: "Response Time", value: "18 sec" },
              { label: "Monthly Feed", value: "89K people" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold">{s.value}</p>
                <p className="text-sm opacity-80 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AIVision;

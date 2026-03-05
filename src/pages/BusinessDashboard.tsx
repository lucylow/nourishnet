import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Leaf, ArrowLeft, Activity, TrendingDown, DollarSign, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { mockDetections, wastePredictionData, businessSavingsData, type WasteDetection } from "@/lib/mock-data";
import Navbar from "@/components/Navbar";

const BusinessDashboard = () => {
  const [detections, setDetections] = useState<WasteDetection[]>(mockDetections.slice(0, 3));
  const [savingsTotal, setSavingsTotal] = useState(8789);

  // Simulate new detections arriving
  useEffect(() => {
    const interval = setInterval(() => {
      setDetections((prev) => {
        if (prev.length >= mockDetections.length) return prev;
        return [...prev, mockDetections[prev.length]];
      });
      setSavingsTotal((s) => s + Math.floor(Math.random() * 50 + 10));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
              Business Waste Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">AI-powered waste prediction & prevention</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-muted-foreground">AI Scanner Active</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Waste Prevented", value: "67%", sub: "vs last month", icon: TrendingDown, color: "text-primary" },
            { label: "Savings This Month", value: `£${savingsTotal.toLocaleString()}`, sub: "↑ 23% vs avg", icon: DollarSign, color: "text-accent" },
            { label: "Detection Accuracy", value: "95%", sub: "YOLOv8n model", icon: Activity, color: "text-primary" },
            { label: "Active Alerts", value: String(detections.filter(d => d.wasteRisk > 80).length), sub: "Critical items", icon: AlertTriangle, color: "text-destructive" },
          ].map((m) => (
            <Card key={m.label}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{m.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
                  </div>
                  <m.icon className={`h-5 w-5 ${m.color} opacity-60`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waste Prediction Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Weekly Waste Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wastePredictionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} name="Predicted (kg)" />
                    <Area type="monotone" dataKey="prevented" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" name="Prevented (kg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block" /> Predicted waste</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-accent inline-block border-dashed" /> Prevented</span>
              </div>
            </CardContent>
          </Card>

          {/* Savings Over Time */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-accent" />
                Savings vs Waste (6 months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={businessSavingsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="waste" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Waste Cost (£)" opacity={0.7} />
                    <Bar dataKey="savings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Savings (£)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Waste Detection Feed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-accent" />
              Live AI Waste Detections
              <Badge variant="outline" className="ml-auto text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {detections.map((d) => (
                <div key={d.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="text-3xl">{d.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-foreground">{d.item}</span>
                      <Badge variant={d.wasteRisk > 85 ? "destructive" : "outline"} className="text-xs">
                        {d.wasteRisk}% risk
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {d.business} · {d.quantityKg}kg · £{d.retailValue} value · {d.expiryHours.toFixed(1)}h until expiry
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" className="rounded-full text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Rescue
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full text-xs">
                      <Clock className="h-3 w-3 mr-1" /> Snooze
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Predictive Alert */}
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                <Activity className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">AI Prediction: Tuesday 4 PM</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Bakery #127 will likely waste <strong>8.7kg croissants</strong> (94% confidence).
                  Recommendation: Reduce croissant bake by 17% → Expected savings: £847/mo.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="rounded-full">Enable Auto-Match (94% success)</Button>
                  <Button size="sm" variant="outline" className="rounded-full">View Full Forecast</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BusinessDashboard;

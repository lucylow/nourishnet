import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Globe, Leaf, Users, TrendingUp, Clock, Zap, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockRescueTimeline, type RescueEvent } from "@/lib/mock-data";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import Footer from "@/components/Footer";

function useAnimatedCounter(end: number, duration = 2000, inView: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [end, duration, inView]);
  return count;
}

const ImpactExplorer = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  
  const meals = useAnimatedCounter(127847, 2500, inView);
  const co2 = useAnimatedCounter(59200, 2500, inView);
  const value = useAnimatedCounter(1784239, 2500, inView);
  const shelters = useAnimatedCounter(43, 1500, inView);
  const partners = useAnimatedCounter(127, 1500, inView);
  const accuracy = useAnimatedCounter(95, 1500, inView);

  const [liveEvents, setLiveEvents] = useState<RescueEvent[]>(mockRescueTimeline);

  // Simulate new rescues
  useEffect(() => {
    const interval = setInterval(() => {
      const businesses = ["Express Mart", "Corner Café", "Green Grocer", "Patisserie Valerie", "Sunrise Bakery"];
      const shelterNames = ["Community Kitchen East", "Shelter A — Hackney", "Food Bank North"];
      const types: RescueEvent["type"][] = ["cv-detection", "predicted", "manual"];
      const newEvent: RescueEvent = {
        id: `r-${Date.now()}`,
        timestamp: new Date(),
        business: businesses[Math.floor(Math.random() * businesses.length)],
        shelter: shelterNames[Math.floor(Math.random() * shelterNames.length)],
        meals: Math.floor(Math.random() * 20 + 5),
        co2Kg: +(Math.random() * 8 + 1).toFixed(1),
        value: Math.floor(Math.random() * 150 + 30),
        type: types[Math.floor(Math.random() * types.length)],
      };
      setLiveEvents((prev) => [newEvent, ...prev].slice(0, 10));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const typeLabel = (type: RescueEvent["type"]) => {
    switch (type) {
      case "cv-detection": return { label: "AI Vision", color: "bg-primary/10 text-primary" };
      case "predicted": return { label: "Predicted", color: "bg-accent/10 text-accent" };
      case "manual": return { label: "Manual", color: "bg-secondary text-secondary-foreground" };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 space-y-10" ref={ref}>
        {/* Hero Counters */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Globe className="h-4 w-4" />
            Live Impact Explorer
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground font-display">
            Every rescue, tracked & verified
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time monitoring of NourishNet's AI-powered food rescue system — from CV detection to blockchain certification.
          </p>
        </div>

        {/* Main Counters */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Meals Rescued", value: meals.toLocaleString(), icon: Users, color: "text-primary" },
            { label: "CO₂ Avoided", value: `${(co2 / 1000).toFixed(1)}T`, icon: Leaf, color: "text-primary" },
            { label: "Retail Value Saved", value: `£${(value / 1000).toFixed(0)}K`, icon: TrendingUp, color: "text-accent" },
            { label: "Shelters Served", value: String(shelters), icon: Users, color: "text-primary" },
            { label: "Business Partners", value: String(partners), icon: BarChart3, color: "text-accent" },
            { label: "Scout Accuracy", value: `${accuracy}%`, icon: Zap, color: "text-primary" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="text-center hover:shadow-md transition-shadow">
                <CardContent className="pt-6 pb-5">
                  <item.icon className={`h-6 w-6 mx-auto mb-2 ${item.color}`} />
                  <p className={`text-3xl md:text-4xl font-extrabold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">{item.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Agent Performance */}
        <div className="rounded-3xl p-8 text-primary-foreground" style={{ background: "var(--gradient-impact)" }}>
          <h2 className="text-2xl font-bold mb-6 text-center">Agent Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Scout Accuracy", value: "95%" },
              { label: "Avg Coordination Time", value: "2m 18s" },
              { label: "Pickup Success", value: "97%" },
              { label: "Nutrition Match Avg", value: "94/100" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold">{s.value}</p>
                <p className="text-sm opacity-80 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Rescue Timeline */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Live Rescue Timeline
            <Badge variant="outline" className="ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
              Live
            </Badge>
          </h2>
          <div className="space-y-3">
            {liveEvents.map((event, i) => {
              const t = typeLabel(event.type);
              const mins = Math.floor((Date.now() - event.timestamp.getTime()) / 60000);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="py-4 flex items-center gap-4">
                      <div className="text-xs text-muted-foreground w-16 shrink-0 text-right">
                        {mins === 0 ? "just now" : `${mins}m ago`}
                      </div>
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-semibold">{event.business}</span>
                          {" → "}
                          <span className="font-semibold">{event.shelter}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event.meals} meals · {event.co2Kg}kg CO₂ saved · £{event.value} value
                        </p>
                      </div>
                      <Badge className={`${t.color} text-xs shrink-0`}>{t.label}</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ImpactExplorer;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, TrendingUp, Trophy, Zap, Shield, BarChart3, ArrowUp, ArrowDown,
  ChevronRight, Receipt, Coins, Star, Crown, Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import {
  mockListings, mockLeaderboard,
  type PricedListing, type PricingTier, type LeaderboardEntry,
} from "@/lib/pricing-data";

/* ─── Tier card ─── */
const TierCard = ({ tier, listingId }: { tier: PricingTier; listingId: string }) => {
  const pct = tier.available > 0 ? (tier.claimed / tier.available) * 100 : 0;
  return (
    <div className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
      pct >= 100 ? "border-primary/30 bg-primary/5 opacity-70" : "border-border"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{tier.emoji}</span>
          <span className="font-semibold text-sm text-foreground">{tier.name}</span>
        </div>
        <Badge className={`${tier.bgColor} ${tier.color} text-xs`}>
          {tier.accessWindow}
        </Badge>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-2xl font-extrabold ${tier.color}`}>
          {tier.price === 0 ? "FREE" : `£${tier.price.toFixed(2)}`}
        </span>
        {tier.price > 0 && (
          <span className="text-sm text-muted-foreground line-through">£{tier.originalPrice}</span>
        )}
        {tier.discount > 0 && (
          <Badge variant="outline" className="text-[10px]">{tier.discount}% off</Badge>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{tier.claimed}/{tier.available} claimed</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>
    </div>
  );
};

/* ─── Listing waterfall ─── */
const ListingWaterfall = ({ listing }: { listing: PricedListing }) => (
  <Card className="overflow-hidden">
    <CardContent className="pt-5 pb-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{listing.emoji}</div>
          <div>
            <p className="font-bold text-foreground text-sm">{listing.item}</p>
            <p className="text-xs text-muted-foreground">
              {listing.business} · {listing.quantityKg}kg · {listing.expiryHours.toFixed(1)}h expiry
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-primary">{listing.rescueRate}% rescued</p>
          <p className="text-xs text-muted-foreground">Base: £{listing.baseValue}</p>
        </div>
      </div>

      {/* Tier waterfall */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {listing.tiers.map((tier) => (
          <TierCard key={tier.name} tier={tier} listingId={listing.id} />
        ))}
      </div>

      {/* Revenue attribution */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/50 border border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">£{listing.b2bFee} B2B Fee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">{listing.foodTokens} FOOD tokens</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-full text-xs">
          <Receipt className="h-3 w-3 mr-1" /> Tax Receipt
        </Button>
      </div>
    </CardContent>
  </Card>
);

/* ─── Leaderboard row ─── */
const LeaderRow = ({ entry }: { entry: LeaderboardEntry }) => (
  <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
    entry.isYou ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/50"
  }`}>
    <div className="w-8 text-center font-extrabold text-lg">
      {entry.rank <= 3 ? (
        <span>{entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}</span>
      ) : (
        <span className="text-muted-foreground">{entry.rank}</span>
      )}
    </div>
    <div className="flex-1">
      <p className={`text-sm font-semibold ${entry.isYou ? "text-primary" : "text-foreground"}`}>
        {entry.name} {entry.isYou && <Badge className="ml-1 text-[10px] bg-primary/20 text-primary">YOU</Badge>}
      </p>
      <p className="text-xs text-muted-foreground">{entry.mealsRescued.toLocaleString()} meals rescued</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-bold text-primary">{entry.rescueRate}%</p>
      <p className="text-xs text-muted-foreground">£{entry.monthlyRevenue.toLocaleString()}/mo</p>
    </div>
  </div>
);

/* ─── Main page ─── */
const PricingDashboard = () => {
  const [listings, setListings] = useState(mockListings);
  const [totalRevenue, setTotalRevenue] = useState(2847);
  const [totalMeals, setTotalMeals] = useState(1489);
  const [networkMRR, setNetworkMRR] = useState(234000);

  // Simulate live price ticking
  useEffect(() => {
    const interval = setInterval(() => {
      setListings((prev) =>
        prev.map((l) => ({
          ...l,
          expiryHours: Math.max(0.1, l.expiryHours - 0.02),
          tiers: l.tiers.map((t) => ({
            ...t,
            claimed: Math.min(t.available, t.claimed + (Math.random() > 0.85 ? 1 : 0)),
            price: t.recipientType === "shelter" ? 0 : Math.max(0.5, t.price - (Math.random() > 0.7 ? 0.01 : 0)),
          })),
        }))
      );
      setTotalRevenue((r) => r + Math.floor(Math.random() * 3));
      setTotalMeals((m) => m + (Math.random() > 0.6 ? 1 : 0));
      setNetworkMRR((m) => m + Math.floor(Math.random() * 50));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
              Dynamic Pricing Waterfall
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              AI-powered priority pricing — Shelters FREE first, then £1-5 EBT, consumer fallback
            </p>
          </div>
          <Badge variant="outline" className="self-start md:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
            Prices update every 15s
          </Badge>
        </div>

        {/* Revenue Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Your Monthly Revenue", value: `£${totalRevenue.toLocaleString()}`, sub: "↑ 23% vs avg", icon: DollarSign, color: "text-accent" },
            { label: "Rescue Rate", value: "91%", sub: "2x Flashfood avg", icon: TrendingUp, color: "text-primary" },
            { label: "Meals Funded", value: totalMeals.toLocaleString(), sub: "This month", icon: Zap, color: "text-primary" },
            { label: "Network MRR", value: `£${(networkMRR / 1000).toFixed(0)}K`, sub: "127 partners", icon: BarChart3, color: "text-accent" },
          ].map((m) => (
            <Card key={m.label}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{m.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
                  </div>
                  <m.icon className={`h-5 w-5 ${m.color} opacity-50`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How it works */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">Priority Waterfall Algorithm</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { emoji: "🟢", label: "0-2h: Shelters FREE", desc: "Nutrition-matched priority" },
                { emoji: "🟡", label: "2-6h: EBT £1-5", desc: "3x shelter meals funded" },
                { emoji: "🔴", label: "6-24h: Consumer 40-90% off", desc: "Dynamic decay curve" },
                { emoji: "⚫", label: "Never landfill", desc: "£25 B2B fee + NFT proof" },
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-sm">
                  <span>{step.emoji}</span>
                  <div>
                    <span className="font-semibold text-foreground">{step.label}</span>
                    <span className="text-muted-foreground ml-1">· {step.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Listings */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-accent" />
            Active Pricing Waterfalls
            <Badge variant="outline" className="ml-2 text-xs">{listings.length} listings</Badge>
          </h2>
          <div className="space-y-4">
            {listings.map((listing) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ListingWaterfall listing={listing} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              Partner Leaderboard
              <Badge variant="outline" className="ml-2 text-xs">Weekly</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {mockLeaderboard.map((entry) => (
                <LeaderRow key={entry.rank} entry={entry} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="rounded-3xl p-8 text-primary-foreground text-center" style={{ background: "var(--gradient-impact)" }}>
          <h2 className="text-2xl font-bold mb-2">The NourishNet Pricing Advantage</h2>
          <p className="opacity-80 mb-6 max-w-xl mx-auto">
            "Consumer apps discount randomly. NourishNet feeds shelters FIRST, then cascades. 91% rescue vs 47% baseline."
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Redemption Rate", value: "91%" },
              { label: "Avg Partner Savings", value: "£2,847/mo" },
              { label: "Payback Period", value: "5.2 days" },
              { label: "Shelter Impact", value: "4x vs flat" },
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

export default PricingDashboard;

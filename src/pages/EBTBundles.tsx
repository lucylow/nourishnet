import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ShoppingCart, Heart, Leaf, Sparkles, CreditCard,
  Check, ArrowRight, Camera, X, Gift, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import { mockBundles, type ImpactBundle } from "@/lib/pricing-data";

const BundleCard = ({
  bundle,
  onClaim,
  disabled,
}: {
  bundle: ImpactBundle;
  onClaim: (id: string) => void;
  disabled: boolean;
}) => {
  const pct = bundle.available > 0 ? (bundle.claimed / bundle.available) * 100 : 0;
  const left = bundle.available - bundle.claimed;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{bundle.emoji}</div>
            <div>
              <p className="font-bold text-sm text-foreground">{bundle.name}</p>
              <p className="text-xs text-muted-foreground">{bundle.nutritionHighlight}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {bundle.expiryHours.toFixed(0)}h left
          </Badge>
        </div>

        {/* Items */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {bundle.items.map((item) => (
            <span key={item} className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
              {item}
            </span>
          ))}
        </div>

        {/* Price & value */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-extrabold text-accent">£{bundle.price.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground line-through">£{bundle.retailValue.toFixed(2)}</span>
          <Badge className="bg-accent/10 text-accent text-[10px]">
            {Math.round((1 - bundle.price / bundle.retailValue) * 100)}% off
          </Badge>
        </div>

        {/* Impact multiplier */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-lg font-bold text-primary">{bundle.mealsProvided}</p>
            <p className="text-[10px] text-muted-foreground">Your meals</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-lg font-bold text-primary">{bundle.shelterMealsFunded}</p>
            <p className="text-[10px] text-muted-foreground">Shelter meals</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-lg font-bold text-primary">{bundle.co2Saved}kg</p>
            <p className="text-[10px] text-muted-foreground">CO₂ saved</p>
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{left} left of {bundle.available}</span>
            <span>{pct.toFixed(0)}% claimed</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>

        <Button
          className="w-full rounded-full"
          size="sm"
          disabled={disabled || left <= 0}
          onClick={() => onClaim(bundle.id)}
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
          {left <= 0 ? "Sold Out" : `Add to Cart · £${bundle.price.toFixed(2)}`}
        </Button>
      </CardContent>
    </Card>
  );
};

const EBTBundles = () => {
  const [ebtVerified, setEbtVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [claimedCount, setClaimedCount] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalShelterMeals, setTotalShelterMeals] = useState(0);
  const weeklyLimit = 10;

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setEbtVerified(true);
      toast({ title: "✅ EBT Verified", description: "Welcome! You can now access £1-5 impact bundles." });
    }, 2000);
  };

  const handleClaim = (id: string) => {
    const bundle = mockBundles.find((b) => b.id === id);
    if (!bundle || claimedCount >= weeklyLimit) return;
    setClaimedCount((c) => c + 1);
    setTotalSaved((s) => +(s + (bundle.retailValue - bundle.price)).toFixed(2));
    setTotalShelterMeals((m) => m + bundle.shelterMealsFunded);
    toast({
      title: `${bundle.emoji} ${bundle.name} claimed!`,
      description: `You saved £${(bundle.retailValue - bundle.price).toFixed(2)} and funded ${bundle.shelterMealsFunded} shelter meals.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Breadcrumbs />
      <main className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
            <Gift className="h-4 w-4" />
            £1-5 Impact Bundles
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-foreground font-display">
            Your purchase funds <span className="text-primary">3x shelter meals</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Access premium surplus food at 85-95% off retail. Every bundle you buy directly funds free meals for shelters.
          </p>
        </div>

        {/* EBT Verification Gate */}
        <AnimatePresence mode="wait">
          {!ebtVerified ? (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="max-w-md mx-auto border-accent/30">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Verify EBT / SNAP Card</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Show your EBT card to unlock £1-5 impact bundles. Your purchases fund 3x shelter meals automatically.
                  </p>
                  <Button
                    size="lg"
                    className="rounded-full w-full"
                    onClick={handleVerify}
                    disabled={verifying}
                  >
                    {verifying ? (
                      <><Sparkles className="h-4 w-4 mr-2 animate-spin" /> Verifying...</>
                    ) : (
                      <><Camera className="h-4 w-4 mr-2" /> Scan EBT Card</>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Secure verification via Stripe Identity · Zero data stored
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="bundles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Verified badge + stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "EBT Status", value: "Verified ✓", icon: ShieldCheck, color: "text-primary" },
                  { label: "Weekly Limit", value: `${claimedCount}/${weeklyLimit}`, icon: ShoppingCart, color: "text-accent" },
                  { label: "You Saved", value: `£${totalSaved.toFixed(2)}`, icon: TrendingUp, color: "text-primary" },
                  { label: "Shelter Meals Funded", value: String(totalShelterMeals), icon: Heart, color: "text-accent" },
                ].map((m) => (
                  <Card key={m.label}>
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{m.label}</p>
                          <p className={`text-xl font-bold mt-1 ${m.color}`}>{m.value}</p>
                        </div>
                        <m.icon className={`h-5 w-5 ${m.color} opacity-50`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Impact multiplier banner */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-5 pb-5 flex items-center gap-4 flex-wrap">
                  <Sparkles className="h-6 w-6 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-foreground">Your Impact Multiplier: 3x</p>
                    <p className="text-sm text-muted-foreground">
                      Every £1 you spend funds £3 worth of shelter meals through our priority pricing waterfall.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-card border border-border text-center">
                      <p className="text-lg font-bold text-primary">£1.87</p>
                      <p className="text-[10px] text-muted-foreground">You pay</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground self-center" />
                    <div className="px-3 py-1.5 rounded-lg bg-card border border-border text-center">
                      <p className="text-lg font-bold text-primary">12</p>
                      <p className="text-[10px] text-muted-foreground">Shelter meals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bundle Grid */}
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Gift className="h-5 w-5 text-accent" />
                  Available Bundles
                  <Badge variant="outline" className="ml-2 text-xs">{mockBundles.length} available</Badge>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockBundles.map((bundle) => (
                    <BundleCard
                      key={bundle.id}
                      bundle={bundle}
                      onClaim={handleClaim}
                      disabled={claimedCount >= weeklyLimit}
                    />
                  ))}
                </div>
              </div>

              {/* Impact Tracker */}
              {(totalSaved > 0 || totalShelterMeals > 0) && (
                <div className="rounded-3xl p-8 text-primary-foreground text-center" style={{ background: "var(--gradient-impact)" }}>
                  <h2 className="text-2xl font-bold mb-2">Your Impact So Far</h2>
                  <p className="opacity-80 mb-6">Every bundle you claim makes a real difference</p>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-3xl font-extrabold">£{totalSaved.toFixed(2)}</p>
                      <p className="text-sm opacity-80 mt-1">You saved</p>
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold">{totalShelterMeals}</p>
                      <p className="text-sm opacity-80 mt-1">Shelter meals funded</p>
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold">{(totalShelterMeals * 0.27).toFixed(1)}kg</p>
                      <p className="text-sm opacity-80 mt-1">CO₂ avoided</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default EBTBundles;

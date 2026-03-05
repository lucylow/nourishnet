import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ChefHat, Zap, Clock, Users, Leaf, CheckCircle2, AlertTriangle,
  ArrowRight, Sparkles, Printer, ShoppingCart, Heart, Shield,
  TrendingUp, BarChart3, Thermometer, Globe, Star, ChevronDown,
  ChevronUp, Bot, Eye, Truck, Link2, Utensils,
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
  mockInventory, mockRecipeBundles, mockShelterNeeds, getWeatherTag,
  type InventoryItem, type RecipeBundle,
} from "@/lib/recipe-data";

/* ─── Inventory Item Row ─── */
const InventoryRow = ({ item, selected, onToggle }: {
  item: InventoryItem; selected: boolean; onToggle: (id: string) => void;
}) => {
  const urgencyColor = item.priority > 85 ? "text-destructive" : item.priority > 60 ? "text-accent" : "text-muted-foreground";
  return (
    <button
      onClick={() => onToggle(item.id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
        selected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 hover:bg-secondary/30"
      }`}
    >
      <div className="text-2xl">{item.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground truncate">{item.name}</span>
          <Badge variant="outline" className={`text-[10px] ${urgencyColor} shrink-0`}>
            {item.expiryHours}h left
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{item.quantityKg}kg · Priority {item.priority}%</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
        selected ? "border-primary bg-primary" : "border-border"
      }`}>
        {selected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
      </div>
    </button>
  );
};

/* ─── Recipe Card ─── */
const RecipeCard = ({ recipe, onConfirm, onPrint }: {
  recipe: RecipeBundle;
  onConfirm: (id: string) => void;
  onPrint: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  const scoreColor = recipe.nutritionScore >= 90 ? "text-primary" :
    recipe.nutritionScore >= 75 ? "text-accent" : "text-muted-foreground";

  const statusMap = {
    suggested: { label: "Suggested", className: "bg-accent/10 text-accent" },
    confirmed: { label: "Confirmed ✓", className: "bg-primary/10 text-primary" },
    dispatched: { label: "Driver En Route", className: "bg-primary/10 text-primary" },
    delivered: { label: "Delivered ✓", className: "bg-primary/10 text-primary" },
  };

  const s = statusMap[recipe.status];

  return (
    <Card className={`overflow-hidden transition-all ${
      recipe.status === "suggested" ? "hover:shadow-md" : ""
    } ${recipe.nutritionScore >= 90 ? "border-primary/20" : ""}`}>
      <CardContent className="pt-5 pb-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{recipe.emoji}</div>
            <div>
              <h3 className="font-bold text-foreground">{recipe.name}</h3>
              <p className="text-xs text-muted-foreground">{recipe.description}</p>
            </div>
          </div>
          <Badge className={`${s.className} text-xs shrink-0`}>{s.label}</Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <p className="text-lg font-bold text-foreground">{recipe.servings}</p>
            <p className="text-[10px] text-muted-foreground">Servings</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <p className="text-lg font-bold text-foreground">{recipe.prepTimeMin}m</p>
            <p className="text-[10px] text-muted-foreground">Prep Time</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <p className={`text-lg font-bold ${scoreColor}`}>{recipe.nutritionScore}</p>
            <p className="text-[10px] text-muted-foreground">Nutrition</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <p className="text-lg font-bold text-primary">{recipe.utilizationPercent}%</p>
            <p className="text-[10px] text-muted-foreground">Utilised</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {recipe.tags.map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">{tag}</span>
          ))}
          {recipe.weather && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent/10 text-accent">{recipe.weather}</span>
          )}
        </div>

        {/* Ingredients */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ingredients</p>
          <div className="flex flex-wrap gap-2">
            {recipe.ingredients.map(ing => (
              <div key={ing.item} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/50 border border-border">
                <span>{ing.emoji}</span>
                <span className="text-xs font-medium text-foreground">{ing.item}</span>
                <span className="text-[10px] text-muted-foreground">{ing.quantityKg}kg</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Per Serving */}
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {[
            { label: "Protein", value: `${recipe.nutritionPerServing.protein}g`, highlight: recipe.nutritionPerServing.protein >= 20 },
            { label: "Carbs", value: `${recipe.nutritionPerServing.carbs}g`, highlight: false },
            { label: "Fat", value: `${recipe.nutritionPerServing.fat}g`, highlight: false },
            { label: "Vit C", value: `${recipe.nutritionPerServing.vitC}mg`, highlight: recipe.nutritionPerServing.vitC >= 10 },
            { label: "Calories", value: `${recipe.nutritionPerServing.calories}`, highlight: false },
          ].map(n => (
            <div key={n.label} className={`text-center p-1.5 rounded-lg ${n.highlight ? "bg-primary/10 border border-primary/20" : "bg-secondary/30"}`}>
              <p className={`text-sm font-bold ${n.highlight ? "text-primary" : "text-foreground"}`}>{n.value}</p>
              <p className="text-[9px] text-muted-foreground">{n.label}</p>
            </div>
          ))}
        </div>

        {/* Shelter Match */}
        {recipe.matchedShelter && (
          <div className="px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/10 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-foreground">{recipe.matchedShelter.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {recipe.matchedShelter.gap} gap: {recipe.matchedShelter.gapPercent}% → Perfect match
                  </p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary text-xs">{recipe.matchedShelter.matchScore}/100</Badge>
            </div>
          </div>
        )}

        {/* Expandable Instructions */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors mb-3"
        >
          <span className="text-xs font-semibold text-muted-foreground">
            {expanded ? "Hide" : "Show"} Instructions ({recipe.instructions.length} steps)
          </span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="space-y-2 pl-1">
                {recipe.instructions.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-2">
          {recipe.status === "suggested" && (
            <Button className="flex-1 rounded-full" size="sm" onClick={() => onConfirm(recipe.id)}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Confirm Bundle
            </Button>
          )}
          {recipe.status === "confirmed" && (
            <Button className="flex-1 rounded-full" size="sm" disabled>
              <Truck className="h-3.5 w-3.5 mr-1.5" /> Driver Dispatching…
            </Button>
          )}
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => onPrint(recipe.id)}>
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/* ─── Pipeline Step ─── */
const PipelineStep = ({ step, isActive, isDone }: {
  step: { icon: typeof Bot; label: string; detail: string; duration: string };
  isActive: boolean;
  isDone: boolean;
}) => (
  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-300 ${
    isActive ? "border-accent bg-accent/10 shadow-sm" :
    isDone ? "border-primary bg-primary/5" :
    "border-border bg-card"
  }`}>
    <step.icon className={`h-4 w-4 ${isActive ? "text-accent animate-pulse" : isDone ? "text-primary" : "text-muted-foreground"}`} />
    <div>
      <p className={`text-xs font-semibold ${isActive ? "text-accent" : isDone ? "text-primary" : "text-muted-foreground"}`}>{step.label}</p>
      <p className="text-[9px] text-muted-foreground">{step.duration}</p>
    </div>
    {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-primary ml-auto" />}
  </div>
);

/* ─── Main Page ─── */
const RecipeBundles = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>(["inv-1", "inv-2", "inv-3"]);
  const [recipes, setRecipes] = useState<RecipeBundle[]>(mockRecipeBundles);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [totalMeals, setTotalMeals] = useState(127847);
  const [redemptionRate, setRedemptionRate] = useState(91);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const weather = getWeatherTag();

  const pipelineSteps = [
    { icon: Eye, label: "Scout", detail: "Inventory detected", duration: "0.4s" },
    { icon: ChefHat, label: "Recipe Agent", detail: "Bundle generated", duration: "1.8s" },
    { icon: Bot, label: "Coordinator", detail: "Nutrition matched", duration: "3.2s" },
    { icon: Truck, label: "Logistics", detail: "Driver dispatched", duration: "2.1s" },
    { icon: Link2, label: "Blockchain", detail: "Impact NFT minted", duration: "2.3s" },
  ];

  const toggleItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleGenerate = () => {
    if (selectedItems.length < 2) {
      toast({ title: "Select at least 2 ingredients", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setPipelineStep(0);

    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step >= pipelineSteps.length) {
        clearInterval(timer);
        setPipelineStep(-1);
        setIsGenerating(false);
        toast({
          title: "🥘 Recipe bundles generated!",
          description: `${recipes.length} recipes from ${selectedItems.length} ingredients — ${recipes.reduce((a, r) => a + r.servings, 0)} total servings`,
        });
      } else {
        setPipelineStep(step);
      }
    }, 1500);
  };

  const handleConfirm = (id: string) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, status: "confirmed" as const } : r));
    setTotalMeals(m => m + Math.floor(Math.random() * 30 + 40));
    toast({ title: "✅ Bundle confirmed!", description: "Driver dispatched. Shelter notified." });

    // Auto-dispatch after 3s
    setTimeout(() => {
      setRecipes(prev => prev.map(r => r.id === id ? { ...r, status: "dispatched" as const } : r));
    }, 3000);
  };

  const handlePrint = (id: string) => {
    toast({ title: "🖨️ Recipe card sent to printer", description: "Include in delivery for kitchen staff." });
  };

  // Live counter
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalMeals(m => m + Math.floor(Math.random() * 3 + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const selectedInventory = mockInventory.filter(i => selectedItems.includes(i.id));
  const totalKg = selectedInventory.reduce((a, i) => a + i.quantityKg, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Breadcrumbs />
      <main className="container mx-auto py-8 space-y-8" ref={ref}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-accent" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
                AI Recipe Bundles
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Nutrition-first recipe generation from expiring inventory — 43% higher redemption vs loose items
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {weather.emoji} {weather.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              Recipe Engine Active
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Meals from Recipes", value: totalMeals.toLocaleString(), icon: Utensils, color: "text-primary" },
            { label: "Redemption Rate", value: `${redemptionRate}%`, icon: TrendingUp, color: "text-primary" },
            { label: "Nutrition Match Avg", value: "94/100", icon: Shield, color: "text-accent" },
            { label: "Zero-Waste Recipes", value: "67%", icon: Leaf, color: "text-primary" },
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

        {/* Impact comparison */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">Recipe Bundles vs Loose Items</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Redemption", before: "47%", after: "91%", improvement: "+94%" },
                { label: "Revenue/kg", before: "£4.27", after: "£18.47", improvement: "+4.3x" },
                { label: "Nutrition Score", before: "67/100", after: "94/100", improvement: "+40%" },
                { label: "Shelter Satisfaction", before: "3.2/5", after: "4.8/5", improvement: "+50%" },
              ].map(c => (
                <div key={c.label} className="text-center p-3 rounded-xl bg-card border border-border">
                  <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">{c.before}</span>
                    <ArrowRight className="h-3 w-3 text-primary" />
                    <span className="text-lg font-bold text-primary">{c.after}</span>
                  </div>
                  <Badge className="bg-primary/10 text-primary text-[10px] mt-1">{c.improvement}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Inventory Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent" />
                Expiring Inventory
              </h2>
              <Badge variant="outline" className="text-xs">{selectedItems.length} selected · {totalKg.toFixed(0)}kg</Badge>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {mockInventory
                .sort((a, b) => b.priority - a.priority)
                .map(item => (
                  <InventoryRow
                    key={item.id}
                    item={item}
                    selected={selectedItems.includes(item.id)}
                    onToggle={toggleItem}
                  />
                ))}
            </div>

            {/* Generate Button */}
            <Button
              className="w-full rounded-full"
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || selectedItems.length < 2}
            >
              {isGenerating ? (
                <><Sparkles className="h-4 w-4 mr-2 animate-spin" /> Generating Recipes…</>
              ) : (
                <><ChefHat className="h-4 w-4 mr-2" /> Generate Recipe Bundles ({selectedItems.length} items)</>
              )}
            </Button>

            {/* Pipeline Animation */}
            {pipelineStep >= 0 && (
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Agent Pipeline</p>
                  <div className="space-y-2">
                    {pipelineSteps.map((step, i) => (
                      <PipelineStep
                        key={step.label}
                        step={step}
                        isActive={pipelineStep === i}
                        isDone={pipelineStep > i}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Generated Recipes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                Generated Recipe Bundles
              </h2>
              <Badge variant="outline" className="text-xs">
                {recipes.reduce((a, r) => a + r.servings, 0)} total servings
              </Badge>
            </div>

            <div className="space-y-4">
              {recipes.map((recipe, i) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1 }}
                >
                  <RecipeCard
                    recipe={recipe}
                    onConfirm={handleConfirm}
                    onPrint={handlePrint}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Shelter Nutrition Gaps */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Shelter Nutrition Gaps — Recipe Match Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockShelterNeeds.map(shelter => (
                <div key={shelter.id} className="p-4 rounded-xl border border-border bg-secondary/20">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-sm text-foreground">{shelter.name}</p>
                    <Badge variant="outline" className="text-[10px]">{shelter.beds} beds</Badge>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Protein", value: shelter.proteinGap },
                      { label: "Vit C", value: shelter.vitCGap },
                      { label: "Carbs", value: shelter.carbGap },
                      { label: "Calories", value: shelter.calorieGap },
                    ].map(gap => (
                      <div key={gap.label} className="space-y-0.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">{gap.label}</span>
                          <span className={gap.value < -20 ? "text-destructive font-semibold" : gap.value < 0 ? "text-accent" : "text-primary"}>
                            {gap.value < 0 ? `${Math.abs(gap.value)}% shortfall` : `${gap.value}% surplus`}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full ${gap.value < -20 ? "bg-destructive" : gap.value < 0 ? "bg-accent" : "bg-primary"}`}
                            style={{ width: `${Math.min(Math.abs(gap.value), 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {shelter.preferences.map(p => (
                      <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">♡ {p}</span>
                    ))}
                    {shelter.avoidances.map(a => (
                      <span key={a} className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">✕ {a}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Pickup rate: {shelter.pickupRate}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demo flow */}
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">Hackathon Demo Flow (2m 43s)</h3>
                <div className="space-y-1">
                  {[
                    "1. Bakery counter: \"12kg chicken + 8kg tomatoes + 15kg rice detected\"",
                    "2. Recipe Agent: \"SESAME CHICKEN RICE BOWLS — 80 servings\"",
                    "3. Coordinator: \"Shelter A protein gap 43% → Perfect match (94/100)\"",
                    "4. Logistics: \"Ahmed dispatched → ETA 18 min\"",
                    "5. Blockchain: \"Impact NFT minted for 80 meals\"",
                  ].map(step => (
                    <p key={step} className="text-xs text-muted-foreground">{step}</p>
                  ))}
                </div>
                <p className="text-xs font-semibold text-accent mt-2">
                  "Consumer apps sell ingredients. NourishNet AI delivers dinners."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom */}
        <div className="rounded-3xl p-8 text-primary-foreground text-center" style={{ background: "var(--gradient-impact)" }}>
          <h2 className="text-2xl font-bold mb-2">Recipe Bundles: 16x Nutrition Impact</h2>
          <p className="opacity-80 mb-6 max-w-xl mx-auto">
            Complete meals vs random ingredients — every recipe matches a shelter's exact nutritional gaps.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Redemption Rate", value: "91%" },
              { label: "Avg Nutrition Score", value: "94/100" },
              { label: "Zero-Waste Recipes", value: "67%" },
              { label: "Shelter Satisfaction", value: "4.8/5" },
            ].map(s => (
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

export default RecipeBundles;

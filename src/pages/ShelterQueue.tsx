import { useState } from "react";
import { Heart, Truck, Zap, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockShelters, mockMatches, type PriorityMatch, type ShelterNutritionGap } from "@/lib/mock-data";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { toast } from "@/hooks/use-toast";

const nutrientLabels: Record<string, string> = { protein: "Protein", vitC: "Vitamin C", carbs: "Carbs", calories: "Calories" };

const NutrientBar = ({ nutrient, value }: { nutrient: string; value: number }) => {
  const isDeficit = value < 0;
  const absVal = Math.abs(value);
  const pct = Math.min(absVal, 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{nutrientLabels[nutrient] || nutrient}</span>
        <span className={isDeficit ? "text-destructive font-semibold" : "text-primary font-semibold"}>
          {isDeficit ? `${absVal}% shortfall` : `${absVal}% surplus`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isDeficit ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const MatchCard = ({ match, onClaim }: { match: PriorityMatch; onClaim: (id: string) => void }) => {
  const scoreColor = match.nutritionScore > 90 ? "bg-primary/10 text-primary" :
    match.nutritionScore > 75 ? "bg-blue-100 text-blue-700" : "bg-accent/10 text-accent";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{match.business}</p>
              <Badge className={`${scoreColor} text-xs mt-0.5`}>
                Nutrition Score: {match.nutritionScore}%
              </Badge>
            </div>
          </div>
          <Badge variant={match.status === "available" ? "default" : "outline"} className="text-xs capitalize">
            {match.status}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <p className="text-lg font-bold text-foreground">{match.quantityKg}kg</p>
            <p className="text-xs text-muted-foreground">{match.items.join(", ")}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <p className="text-lg font-bold text-primary">{match.meals}</p>
            <p className="text-xs text-muted-foreground">family meals</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <div className="flex items-center justify-center gap-1">
              <p className="text-lg font-bold text-primary">FREE</p>
            </div>
            <p className="text-xs text-muted-foreground line-through">£{match.retailValue}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1 rounded-full"
            size="sm"
            disabled={match.status !== "available"}
            onClick={() => onClaim(match.id)}
          >
            <Zap className="h-3.5 w-3.5 mr-1" />
            {match.status === "available" ? "Claim Now" : match.status === "claimed" ? "Claimed" : "En Route"}
          </Button>
          <Button variant="outline" size="sm" className="rounded-full">
            <Truck className="h-3.5 w-3.5 mr-1" />
            ETA {match.driverEta}min
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ShelterQueue = () => {
  const [matches, setMatches] = useState(mockMatches);
  const [selectedShelter, setSelectedShelter] = useState<ShelterNutritionGap>(mockShelters[0]);

  const handleClaim = (id: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "claimed" as const } : m))
    );
    toast({ title: "🎉 Claimed!", description: "Driver dispatched. Your rescue is on the way." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Breadcrumbs />
      <main className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
            Shelter Nutrition Queue
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Nutrition-first matching — surplus food matched to your community's gaps
          </p>
        </div>

        {/* Shelter Selector */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {mockShelters.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedShelter(s)}
              className={`shrink-0 px-4 py-3 rounded-xl border text-sm transition-all ${
                selectedShelter.id === s.id
                  ? "border-primary bg-primary/10 text-primary font-semibold"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              <div className="font-medium">{s.name}</div>
              <div className="text-xs mt-0.5">{s.beds} beds</div>
            </button>
          ))}
        </div>

        {/* Nutrition Gap Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Nutrition Gap Analysis — {selectedShelter.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries({
                protein: selectedShelter.protein,
                vitC: selectedShelter.vitC,
                carbs: selectedShelter.carbs,
                calories: selectedShelter.calories,
              }).map(([nutrient, value]) => (
                <NutrientBar key={nutrient} nutrient={nutrient} value={value} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last updated 2 hours ago · 7-day rolling average
            </p>
          </CardContent>
        </Card>

        {/* Priority Rescue Queue */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Priority Rescue Queue
            <Badge variant="outline" className="ml-2">{matches.filter(m => m.status === "available").length} available</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches
              .sort((a, b) => b.nutritionScore - a.nutritionScore)
              .map((match) => (
                <MatchCard key={match.id} match={match} onClaim={handleClaim} />
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShelterQueue;

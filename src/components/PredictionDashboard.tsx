import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type ForecastPoint = {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
  confidence: number;
};

type CrisisPrediction = {
  crisis_probability: number;
  crisis_level: string;
  days_to_crisis: number | null;
};

interface ScenarioStrategy {
  strategy: string;
  greenhouse_gas_kg: number;
  cost_gbp: number;
  meals_provided: number;
  distance_km: number | null;
  recommendation_rank: number;
  badge: string;
}

interface PredictionDashboardProps {
  businessId: string;
}

export const PredictionDashboard: React.FC<PredictionDashboardProps> = ({ businessId }) => {
  const [supplyForecast, setSupplyForecast] = useState<ForecastPoint[]>([]);
  const [crisisPrediction, setCrisisPrediction] = useState<CrisisPrediction | null>(null);
  const [scenarioStrategies, setScenarioStrategies] = useState<ScenarioStrategy[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const base = "/predictions";

        const supplyRes = await fetch(`${base}/supply/${businessId}?days=14`);
        if (supplyRes.ok) {
          const data = await supplyRes.json();
          const pts = (data.forecast?.points ?? []) as any[];
          setSupplyForecast(
            pts.map((p) => ({
              date: p.date,
              predicted: p.predicted,
              lower: p.lower,
              upper: p.upper,
              confidence: p.confidence,
            })),
          );
        }

        const crisisRes = await fetch(`${base}/crisis/uk/london`);
        if (crisisRes.ok) {
          const data = await crisisRes.json();
          const p = data.prediction;
          setCrisisPrediction({
            crisis_probability: p.crisis_probability,
            crisis_level: p.crisis_level,
            days_to_crisis: p.days_to_crisis ?? null,
          });
        }

        const scenarioRes = await fetch(`${base}/scenario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            food_type: "mixed vegetables",
            quantity_kg: 100,
            location: "London",
          }),
        });
        if (scenarioRes.ok) {
          const data = await scenarioRes.json();
          setScenarioStrategies(data.ranked_strategies ?? []);
        }
      } catch (err) {
        // For now, swallow errors – the rest of the dashboard still works.
        // eslint-disable-next-line no-console
        console.error("Failed to fetch predictions", err);
      }
    };

    load();
  }, [businessId]);

  if (!supplyForecast.length && !crisisPrediction && !scenarioStrategies.length) {
    return null;
  }

  const totalPredicted = supplyForecast.reduce((sum, p) => sum + (p.predicted ?? 0), 0);
  const overallConfidence =
    supplyForecast.length > 0
      ? supplyForecast.reduce((sum, p) => sum + (p.confidence ?? 0), 0) / supplyForecast.length
      : 0;

  return (
    <div className="space-y-4">
      {/* Supply forecast */}
      {supplyForecast.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Surplus forecast (next 14 days)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={supplyForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => new Date(d).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="#a5b4fc"
                    fillOpacity={0.15}
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="#a5b4fc"
                    fillOpacity={0.15}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span>Total predicted: {totalPredicted.toFixed(0)} kg</span>
              <span>Average confidence: {overallConfidence.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crisis monitor */}
      {crisisPrediction && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Food price crisis monitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">
                {crisisPrediction.crisis_probability.toFixed(1)}%
              </span>
              <Badge variant="outline">{crisisPrediction.crisis_level}</Badge>
            </div>
            {typeof crisisPrediction.days_to_crisis === "number" && (
              <Alert>
                Potential crisis in approximately {crisisPrediction.days_to_crisis} days.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scenario analysis */}
      {scenarioStrategies.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Scenario: 100 kg mixed vegetables in London
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {scenarioStrategies.map((s) => (
                <div
                  key={s.strategy}
                  className={`p-3 rounded-lg border ${
                    s.recommendation_rank === 1 ? "border-green-500 bg-green-50/60" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{s.strategy}</span>
                    <Badge variant={s.recommendation_rank === 1 ? "default" : "outline"}>
                      {s.badge}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>Meals: {s.meals_provided}</span>
                    <span>CO₂: {s.greenhouse_gas_kg} kg</span>
                    <span>Cost: £{s.cost_gbp}</span>
                    {typeof s.distance_km === "number" && (
                      <span>Distance: {s.distance_km.toFixed(1)} km</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


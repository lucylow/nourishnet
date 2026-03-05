import { TrendingUp } from "lucide-react";

interface Props {
  meals: number;
  co2: number;
  people: number;
}

const ImpactDashboard = ({ meals, co2, people }: Props) => (
  <div className="rounded-2xl p-6 text-primary-foreground" style={{ background: "var(--gradient-impact)" }}>
    <h3 className="font-bold flex items-center gap-2 text-sm mb-4">
      <TrendingUp className="h-4 w-4" /> Real-Time Impact
    </h3>
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <div className="text-2xl md:text-3xl font-extrabold">{meals.toLocaleString()}</div>
        <div className="text-xs opacity-80">meals rescued</div>
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-extrabold">{co2}</div>
        <div className="text-xs opacity-80">tonnes CO₂</div>
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-extrabold">{people}</div>
        <div className="text-xs opacity-80">people reached</div>
      </div>
    </div>
  </div>
);

export default ImpactDashboard;

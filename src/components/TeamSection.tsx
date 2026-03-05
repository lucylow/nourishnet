import { User } from "lucide-react";

const team = [
  { name: "Alex Chen", role: "Agent Architect" },
  { name: "Maya Kapoor", role: "Backend & FLock" },
  { name: "Omar Hassan", role: "Frontend & UX" },
  { name: "Priya Patel", role: "SDG & Partnerships" },
];

const TeamSection = () => (
  <section id="team" className="container mx-auto my-16">
    <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground mb-10">Meet the builders</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {team.map((t) => (
        <div key={t.name} className="text-center">
          <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-secondary border-[3px] border-accent flex items-center justify-center">
            <User className="h-12 w-12 text-primary" />
          </div>
          <h4 className="font-bold text-foreground">{t.name}</h4>
          <p className="text-sm text-muted-foreground">{t.role}</p>
        </div>
      ))}
    </div>
  </section>
);

export default TeamSection;

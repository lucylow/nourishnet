import { Bot, Cpu, MessageCircle, Send, Globe } from "lucide-react";

const techs = [
  { icon: Bot, label: "OpenClaw", sub: "agent orchestration" },
  { icon: Cpu, label: "FLock API", sub: "open-source LLMs" },
  { icon: MessageCircle, label: "WhatsApp", sub: "" },
  { icon: Send, label: "Telegram", sub: "" },
  { icon: Globe, label: "UN SDG 2, 12, 3", sub: "" },
];

const TechShowcase = () => (
  <section className="container mx-auto">
    <div className="bg-secondary rounded-4xl p-8 flex flex-wrap justify-center items-center gap-10">
      {techs.map((t) => (
        <div key={t.label} className="flex flex-col items-center gap-1 text-center">
          <t.icon className="h-10 w-10 text-primary" />
          <span className="font-bold text-foreground">{t.label}</span>
          {t.sub && <span className="text-xs text-muted-foreground">{t.sub}</span>}
        </div>
      ))}
    </div>
  </section>
);

export default TechShowcase;

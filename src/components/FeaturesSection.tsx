import { motion } from "framer-motion";
import { Search, GitBranch, Truck } from "lucide-react";

const features = [
  { icon: Search, title: "The Scout Agent", desc: "Monitors local businesses at closing time, identifies surplus food, and categorizes it using FLock's open-source LLMs." },
  { icon: GitBranch, title: "The Coordinator Agent", desc: "Matches supply with nearby NGOs or individuals based on proximity and urgency. Sends intelligent alerts." },
  { icon: Truck, title: "The Logistics Agent", desc: "Provides pickup codes, directions, and real-time updates. Closes the loop and tracks every rescued meal." },
];

const FeaturesSection = () => (
  <section id="features" className="container mx-auto py-16">
    <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground mb-3">How NourishNet works</h2>
    <p className="text-center text-lg text-muted-foreground max-w-[700px] mx-auto mb-12">
      Three autonomous agents orchestrate the entire food rescue pipeline — from spotting surplus to coordinating pickup.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          className="bg-card border border-border rounded-3xl p-7 shadow-[var(--shadow-card)] hover:-translate-y-2 transition-transform"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15 }}
        >
          <f.icon className="h-10 w-10 text-accent mb-4" />
          <h3 className="text-xl font-bold mb-2 text-foreground">{f.title}</h3>
          <p className="text-muted-foreground">{f.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default FeaturesSection;

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const checks = [
  "OpenClaw framework",
  "FLock API for inference",
  "Only open-source models",
  "WhatsApp / Telegram",
  "SDG 2, 3, 12",
];

const BountySection = () => (
  <section className="container mx-auto my-16 text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Built for the FLock.io Bounty</h2>
    <p className="text-lg text-muted-foreground max-w-[700px] mx-auto mb-8">
      NourishNet hits every requirement: autonomous agents, SDG alignment, FLock API, open-source models, multi-channel.
    </p>
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {checks.map((c, i) => (
        <motion.span
          key={c}
          className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-medium text-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <Check className="h-4 w-4 text-primary" /> {c}
        </motion.span>
      ))}
    </div>
    <div className="bg-secondary rounded-3xl px-8 py-5 inline-block">
      <p className="text-foreground font-semibold">
        Targeting 🥇 Gold, 🎨 Creativity &amp; 🛠 Technical Implementation prizes
      </p>
    </div>
  </section>
);

export default BountySection;

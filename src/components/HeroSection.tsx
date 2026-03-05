import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { MessageCircle, Send } from "lucide-react";

const HeroSection = () => (
  <section className="container mx-auto flex items-center gap-12 py-12 pb-16 flex-wrap">
    <motion.div
      className="flex-1 min-w-[340px]"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
    >
      <span className="inline-block bg-secondary text-secondary-foreground font-semibold px-4 py-1.5 rounded-full text-sm border border-border mb-4">
        🤖 AI for Good · FLock Track
      </span>
      <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-tight mb-6 text-foreground">
        Autonomous agents rescuing food,{" "}
        <span className="text-accent border-b-[3px] border-accent">fighting hunger.</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-[550px] mb-8">
        NourishNet connects businesses, NGOs, and people via WhatsApp/Telegram to redistribute surplus meals — powered by OpenClaw and FLock's open-source LLMs.
      </p>
      <div className="flex gap-3 flex-wrap">
        <Button size="lg" asChild>
          <Link to="/dashboard">
            Try live demo <Send className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" size="lg">Watch video</Button>
      </div>
      <div className="flex gap-8 mt-10">
        <div>
          <div className="text-3xl font-extrabold text-primary">1,247</div>
          <div className="text-sm text-muted-foreground">meals saved (live)</div>
        </div>
        <div>
          <div className="text-3xl font-extrabold text-primary">3.2</div>
          <div className="text-sm text-muted-foreground">tonnes CO₂ avoided</div>
        </div>
      </div>
    </motion.div>

    <motion.div
      className="flex-1 min-w-[300px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <div className="rounded-4xl p-6" style={{ background: "var(--gradient-hero)" }}>
        <div className="bg-card rounded-3xl p-5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">NourishNet Bot</span>
          </div>
          <div className="space-y-3 mb-4">
            <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] text-sm text-secondary-foreground">
              Hi! I'm your food rescue assistant. Send "hungry" to find meals nearby.
            </div>
            <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3 max-w-[85%] ml-auto text-sm">
              I'm hungry
            </div>
            <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] text-sm text-secondary-foreground">
              🍱 Great! There's a bakery 5 min away with 3 unsold sandwiches. Use code <strong>NOURISH5</strong> to pick up free. Expires in 30 min.
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">Live simulation · real agents</p>
        </div>
      </div>
    </motion.div>
  </section>
);

export default HeroSection;

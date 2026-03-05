import { Leaf } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground rounded-t-4xl mt-16 py-8">
    <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <Leaf className="h-5 w-5 text-accent" />
        <span className="font-bold font-display">NourishNet · AI for Zero Hunger</span>
      </div>
      <div className="flex gap-4 text-sm opacity-80">
        <a href="#" className="hover:text-accent transition-colors">GitHub</a>
        <a href="#" className="hover:text-accent transition-colors">Demo</a>
        <a href="#" className="hover:text-accent transition-colors">Hackathon submission</a>
      </div>
      <p className="text-sm opacity-60 w-full md:w-auto text-center">© 2026 · UK AI Agent Hackathon EP4 x OpenClaw</p>
    </div>
  </footer>
);

export default Footer;

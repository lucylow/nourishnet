import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import TechShowcase from "@/components/TechShowcase";
import ImpactSection from "@/components/ImpactSection";
import DemoChat from "@/components/DemoChat";
import BountySection from "@/components/BountySection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <FeaturesSection />
    <TechShowcase />
    <ImpactSection />
    <DemoChat />
    <BountySection />
    <Footer />
  </div>
);

export default Index;

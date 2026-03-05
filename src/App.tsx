import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Dao from "./pages/Dao";
import About from "./pages/About";
import Impact from "./pages/Impact";
import AI from "./pages/AI";
import AIVision from "./pages/AIVision";
import AgentOrchestration from "./pages/AgentOrchestration";
import BlockchainImpact from "./pages/BlockchainImpact";
import RecipeBundles from "./pages/RecipeBundles";
import MARLPricing from "./pages/MARLPricing";
import PricingDashboard from "./pages/PricingDashboard";
import EBTBundles from "./pages/EBTBundles";
import BusinessDashboard from "./pages/BusinessDashboard";
import ShelterQueue from "./pages/ShelterQueue";
import ImpactExplorer from "./pages/ImpactExplorer";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname, hash]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dao" element={<Dao />} />
          <Route path="/about" element={<About />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/ai/vision" element={<AIVision />} />
          <Route path="/ai/agents" element={<AgentOrchestration />} />
          <Route path="/ai/blockchain" element={<BlockchainImpact />} />
          <Route path="/ai/recipes" element={<RecipeBundles />} />
          <Route path="/pricing" element={<PricingDashboard />} />
          <Route path="/bundles" element={<EBTBundles />} />
          <Route path="/business" element={<BusinessDashboard />} />
          <Route path="/shelter" element={<ShelterQueue />} />
          <Route path="/explorer" element={<ImpactExplorer />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

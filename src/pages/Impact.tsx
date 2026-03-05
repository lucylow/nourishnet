import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import ImpactSection from "@/components/ImpactSection";
import Footer from "@/components/Footer";

const Impact = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <Breadcrumbs />
    <main className="container mx-auto py-16 space-y-12">
      <section className="max-w-3xl space-y-4">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Impact &amp; outcomes
        </h1>
        <p className="text-lg text-muted-foreground">
          This page highlights the kind of real-time impact NourishNet is designed to track — from meals
          rescued to CO₂ saved and people supported. The numbers below are wired into the demo counters
          used throughout the app.
        </p>
      </section>
    </main>
    <ImpactSection />
    <Footer />
  </div>
);

export default Impact;


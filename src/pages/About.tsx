import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import Footer from "@/components/Footer";

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <Breadcrumbs />
    <main className="container mx-auto py-16 space-y-12">
      <section className="max-w-3xl space-y-4">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
          About <span className="text-accent">NourishNet</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          NourishNet is an AI-native coordination layer that connects surplus food from restaurants and
          retailers with the people and communities who need it most. It was built for the UK AI Agent
          Hackathon (EP4 x OpenClaw) to show how autonomous agents can tackle real-world problems like
          food waste and hunger.
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-semibold mb-2">Our mission</h2>
          <p className="text-sm text-muted-foreground">
            Reduce food waste and support local communities by routing surplus meals to charities, food
            banks, and mutual aid groups in minutes instead of hours.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-semibold mb-2">Agent-first design</h2>
          <p className="text-sm text-muted-foreground">
            Scout, Coordinator, and Logistics agents work together to monitor supply, match it with
            demand, and orchestrate pickups — with humans kept in the loop where it matters.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-xl font-semibold mb-2">Open & extensible</h2>
          <p className="text-sm text-muted-foreground">
            NourishNet is built to plug into real-world CRMs, messaging channels, and on-chain impact
            tracking so organisations can adapt it to their own context.
          </p>
        </div>
      </section>

      <section className="max-w-3xl space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Who it&apos;s for</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Food businesses with regular surplus (cafés, restaurants, supermarkets).</li>
          <li>Charities, shelters, and food banks coordinating last-mile delivery.</li>
          <li>Cities and local authorities piloting agentic public infrastructure.</li>
        </ul>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;


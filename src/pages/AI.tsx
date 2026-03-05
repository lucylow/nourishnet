import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import AIChatbot from "@/components/AIChatbot";
import Footer from "@/components/Footer";

const AI = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <Breadcrumbs />
    <AIChatbot />
    <Footer />
  </div>
);

export default AI;

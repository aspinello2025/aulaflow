import Navigation from "@/components/Navigation";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const Planos = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Planos;

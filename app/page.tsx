import { Header } from "@/components/ui/header-2";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { ProtocolWorkflow } from "@/components/landing/ProtocolWorkflow";
import { INFTSection } from "@/components/landing/INFTSection";
import { SpeciesGrid } from "@/components/landing/SpeciesGrid";
import { IntegrationMap } from "@/components/landing/IntegrationMap";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <ProtocolWorkflow />
        <SpeciesGrid />
        <INFTSection />
        <IntegrationMap />
      </main>
      <Footer />
    </>
  );
}

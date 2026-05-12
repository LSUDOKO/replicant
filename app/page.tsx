import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SpeciesGrid } from "@/components/landing/SpeciesGrid";
import { IntegrationMap } from "@/components/landing/IntegrationMap";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <SpeciesGrid />
        <IntegrationMap />
      </main>
      <Footer />
    </>
  );
}

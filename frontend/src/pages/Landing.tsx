import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ProblemSection } from '../components/ProblemSection';
import { HowItWorks } from '../components/HowItWorks';
import { RoadmapPreview } from '../components/RoadmapPreview';
import { PersonalizationDemo } from '../components/PersonalizationDemo';
import { FeaturesSection } from '../components/FeaturesSection';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';
import { ThreeBackgroundWave } from '../components/3d/ThreeBackgroundWave';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 dark:bg-[#111113] dark:text-stone-100 transition-colors duration-300 relative">
      {/* Universal 3D Ambient Wave Background */}
      <ThreeBackgroundWave isFixed opacity={0.75} />

      <Navbar />
      <main className="flex-1 relative z-10">
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <RoadmapPreview />
        <PersonalizationDemo />
        <FeaturesSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

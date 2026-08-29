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
import { ThreeBackgroundWave } from '../components/ThreeBackgroundWave';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-stone-900 dark:text-stone-100 transition-colors duration-300 relative overflow-x-hidden">
      {/* 3D Wave Canvas - Must be behind everything */}
      <ThreeBackgroundWave />
      
      {/* Content wrapper relative and z-10 so it's above the canvas */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar />
        <main className="flex-1 w-full">
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
    </div>
  );
};

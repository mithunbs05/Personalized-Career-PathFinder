import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ProblemSection } from '../components/ProblemSection';
import { HowItWorks } from '../components/HowItWorks';
import { RoadmapPreview } from '../components/RoadmapPreview';
import { AIConversation } from '../components/AIConversation';
import { PersonalizationDemo } from '../components/PersonalizationDemo';
import { FeaturesSection } from '../components/FeaturesSection';
import { DashboardPreview } from '../components/DashboardPreview';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 dark:bg-[#111113] dark:text-stone-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <RoadmapPreview />
        <AIConversation />
        <PersonalizationDemo />
        <FeaturesSection />
        <DashboardPreview />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

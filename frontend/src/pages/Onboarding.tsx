import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NlpOnboardingBot } from '../components/NlpOnboardingBot';
import { onboardingService } from '../services/onboarding.service';
import { supabase } from '../lib/supabase';

export const Onboarding: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { saveOnboarding } = useAuth();
  const navigate = useNavigate();

  /**
   * Called when the bot signals completion or the user clicks "Generate Roadmap".
   * Saves the extracted profile to Supabase via FastAPI and navigates to dashboard.
   */
  const handleComplete = useCallback(
    async (extractedEntities: Record<string, unknown>, completedCategories: string[]) => {
      setIsProcessing(true);
      setProcessingPhase(1);
      setSaveError(null);

      setTimeout(() => setProcessingPhase(2), 900);
      setTimeout(() => setProcessingPhase(3), 1800);
      setTimeout(() => setProcessingPhase(4), 2700);

      setTimeout(async () => {
        try {
          const resolvedTargetGoal = (extractedEntities.target_goal as string) ||
            (extractedEntities.career_goal as string) ||
            (extractedEntities.careerGoal as string) ||
            (extractedEntities.job_specialization as string) ||
            (extractedEntities.target_role as string) ||
            'Data Scientist';

          const normalizedEntities = {
            ...extractedEntities,
            target_goal: resolvedTargetGoal,
            career_goal: resolvedTargetGoal,
            target_role: resolvedTargetGoal,
          };

          // 1. Save locally to auth context / localStorage (guarantees local JSON temp persistence)
          await saveOnboarding({
            targetGoal: resolvedTargetGoal,
            experienceLevel:
              (extractedEntities.experience_level as 'beginner' | 'intermediate' | 'advanced') ||
              'intermediate',
            knownSkills:
              Array.isArray(extractedEntities.known_skills)
                ? (extractedEntities.known_skills as string[])
                : [],
            weeklyHours: (extractedEntities.weekly_hours as number) || 10,
            educationDegree: (extractedEntities.education_degree as string) || undefined,
            educationMajor: (extractedEntities.education_major as string) || undefined,
            graduationYear: (extractedEntities.graduation_year as string) || undefined,
            githubUrl: (extractedEntities.github_url as string) || undefined,
            linkedinUrl: (extractedEntities.linkedin_url as string) || undefined,
            industryExperienceType:
              (extractedEntities.industry_experience_type as 'fresher' | 'internship' | 'professional') ||
              undefined,
            yearsExperience: (extractedEntities.years_experience as string) || undefined,
            currentProjects: (extractedEntities.current_projects as string) || undefined,
            completedLearning: (extractedEntities.completed_learning as string) || undefined,
            technicalInterests:
              Array.isArray(extractedEntities.technical_interests)
                ? (extractedEntities.technical_interests as string[])
                : undefined,
            jobSpecialization: (extractedEntities.job_specialization as string) || undefined,
            targetCompletionMonths: (extractedEntities.target_completion_months as string) || undefined,
            salaryPlacementGoal: (extractedEntities.salary_placement_goal as string) || undefined,
            learningPreferences:
              Array.isArray(extractedEntities.learning_preferences)
                ? (extractedEntities.learning_preferences as string[])
                : undefined,
            resourceBudget: (extractedEntities.resource_budget as string) || undefined,
            immediateMotivation: (extractedEntities.immediate_motivation as string) || undefined,
            languagePreference: (extractedEntities.language_preference as string) || undefined,
          });

          // 2. Sync to Supabase via FastAPI backend
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !sessionData.session?.access_token) {
            throw new Error('No active Supabase session. Please sign in again before saving your roadmap.');
          }

          await onboardingService.saveProfile(
            {
              profile_metadata: normalizedEntities,
              completed_categories: completedCategories,
            },
            sessionData.session.access_token
          );

          confetti({
            particleCount: 160,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#FF4D31', '#7A8B7C', '#1A1A1A', '#F9F8F3'],
          });

          setTimeout(() => {
            navigate('/dashboard');
          }, 1200);
        } catch (err) {
          console.error('Onboarding submission error:', err);
          setIsProcessing(false);
          setSaveError(
            err instanceof Error
              ? err.message
              : 'Could not save your profile to Supabase. Please try again.'
          );
        }
      }, 3600);
    },
    [saveOnboarding, navigate]
  );

  return (
    <div className="min-h-screen bg-[#F9F8F3] dark:bg-[#121211] text-[#1A1A1A] dark:text-[#F9F8F3] flex flex-col justify-between p-6 sm:p-12 transition-colors duration-300">
      {/* Top Header Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF4D31] flex items-center justify-center text-white shadow-md shadow-[#FF4D31]/20">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg">PathAI Career Onboarding</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF4D31]/10 text-[#FF4D31] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Conversational Assistant</span>
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto my-6">
        <div className={isProcessing ? 'block' : 'hidden'}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1A1A18] rounded-3xl p-8 sm:p-12 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xl text-center space-y-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#F1EFE7] dark:bg-[#252522] border-2 border-[#FF4D31] text-[#FF4D31] flex items-center justify-center mx-auto shadow-lg shadow-[#FF4D31]/20 animate-subtle-float">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#7A8B7C] block mb-2">
                PATHAI SYNTHESIS ENGINE
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold">
                {processingPhase === 4 ? 'Profile Complete & Roadmap Ready!' : 'Synthesizing All 15 Onboarding Categories...'}
              </h2>
            </div>

            <div className="max-w-md mx-auto space-y-3 text-left text-xs font-semibold">
              <div className={`p-3 rounded-xl flex items-center gap-3 transition-all ${processingPhase >= 1 ? 'bg-[#F1EFE7] dark:bg-[#252522] text-[#1A1A1A] dark:text-white' : 'text-[#7A8B7C]/50'}`}>
                {processingPhase >= 1 ? <CheckCircle2 className="w-4 h-4 text-[#7A8B7C]" /> : <div className="w-4 h-4 rounded-full border border-current" />}
                <span>Processing your conversational answers & preferences...</span>
              </div>

              <div className={`p-3 rounded-xl flex items-center gap-3 transition-all ${processingPhase >= 2 ? 'bg-[#F1EFE7] dark:bg-[#252522] text-[#1A1A1A] dark:text-white' : 'text-[#7A8B7C]/50'}`}>
                {processingPhase >= 2 ? <CheckCircle2 className="w-4 h-4 text-[#7A8B7C]" /> : <div className="w-4 h-4 rounded-full border border-current" />}
                <span>Mapping skill competency against 14,000+ industry job bars...</span>
              </div>

              <div className={`p-3 rounded-xl flex items-center gap-3 transition-all ${processingPhase >= 3 ? 'bg-[#F1EFE7] dark:bg-[#252522] text-[#1A1A1A] dark:text-white' : 'text-[#7A8B7C]/50'}`}>
                {processingPhase >= 3 ? <CheckCircle2 className="w-4 h-4 text-[#7A8B7C]" /> : <div className="w-4 h-4 rounded-full border border-current" />}
                <span>Eliminating knowledge gaps and redundant theory...</span>
              </div>

              <div className={`p-3 rounded-xl flex items-center gap-3 transition-all ${processingPhase >= 4 ? 'bg-[#F1EFE7] dark:bg-[#252522] text-[#FF4D31] font-bold ring-1 ring-[#FF4D31]' : 'text-[#7A8B7C]/50'}`}>
                {processingPhase >= 4 ? <CheckCircle2 className="w-4 h-4 text-[#FF4D31]" /> : <div className="w-4 h-4 rounded-full border border-current" />}
                <span>Redirecting to your learner dashboard!</span>
              </div>
            </div>
          </motion.div>
        </div>

        {saveError && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            <p className="font-bold">Error saving profile:</p>
            <p>{saveError}</p>
            <button 
              onClick={() => setSaveError(null)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className={!isProcessing ? 'block' : 'hidden'}>
          <NlpOnboardingBot
            onComplete={handleComplete}
            isSubmitting={isProcessing}
          />
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto text-center text-xs text-[#7A8B7C] pt-4 border-t border-[#E8E6DE] dark:border-[#2C2C29]">
        Chat naturally with your AI onboarding assistant to populate all profile categories.
      </div>
    </div>
  );
};

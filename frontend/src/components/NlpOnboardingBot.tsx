import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Send, User, CheckCircle2, ArrowRight, Brain,
  GraduationCap, Briefcase, Code, Target, Clock, BookOpen,
  Wallet, Flame, Globe, FolderGit2, Award, Layers, Heart,
  Languages,
} from 'lucide-react';
import { onboardingService, OnboardingApiError } from '../services/onboarding.service';
import type {
  OnboardingChatMessage,
  OnboardingChatResponse,
  ChatMessagePayload,
} from '../types/onboarding';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface NlpOnboardingBotProps {
  onComplete: (extractedEntities: Record<string, unknown>, completedCategories: string[]) => void;
  isSubmitting: boolean;
}

// ---------------------------------------------------------------------------
// 15 Profile Categories
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'professionalProfiles', label: 'Profiles', icon: Globe },
  { key: 'industryExperience', label: 'Experience', icon: Briefcase },
  { key: 'technicalStack', label: 'Tech Stack', icon: Code },
  { key: 'projects', label: 'Projects', icon: FolderGit2 },
  { key: 'completedLearning', label: 'Learning', icon: BookOpen },
  { key: 'technicalInterests', label: 'Interests', icon: Heart },
  { key: 'careerGoal', label: 'Career Goal', icon: Target },
  { key: 'targetTimeline', label: 'Timeline', icon: Clock },
  { key: 'salaryGoal', label: 'Salary Goal', icon: Award },
  { key: 'weeklyHours', label: 'Weekly Hrs', icon: Clock },
  { key: 'learningFormat', label: 'Format', icon: Layers },
  { key: 'resourceBudget', label: 'Budget', icon: Wallet },
  { key: 'immediateMotivation', label: 'Motivation', icon: Flame },
  { key: 'languagePreference', label: 'Language', icon: Languages },
] as const;

const TOTAL_CATEGORIES = CATEGORIES.length; // 15

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const NlpOnboardingBot: React.FC<NlpOnboardingBotProps> = ({
  onComplete,
  isSubmitting,
}) => {
  // Chat messages for rendering
  const [messages, setMessages] = useState<OnboardingChatMessage[]>([]);

  // The cumulative extracted entities from all turns
  const [extractedEntities, setExtractedEntities] = useState<Record<string, unknown>>({});

  // Backend-driven completed categories
  const [completedCategories, setCompletedCategories] = useState<string[]>([]);

  // Profile completion flag from backend
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  // Input and processing states
  const [inputVal, setInputVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Scroll to bottom
  // ---------------------------------------------------------------------------
  const scrollToBottom = useCallback(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing, scrollToBottom]);

  // ---------------------------------------------------------------------------
  // Build conversation history payload from messages
  // ---------------------------------------------------------------------------
  const buildHistoryPayload = useCallback(
    (msgs: OnboardingChatMessage[]): ChatMessagePayload[] =>
      msgs.map((m) => ({ role: m.role, content: m.content })),
    []
  );

  // ---------------------------------------------------------------------------
  // Process a backend response into state
  // ---------------------------------------------------------------------------
  const applyBackendResponse = useCallback(
    (response: OnboardingChatResponse) => {
      setExtractedEntities(response.extracted_entities);
      setCompletedCategories(response.completed_categories);
      setIsProfileComplete(response.is_profile_complete);
      setErrorMessage(null);

      // Build extracted chips for UI display
      const chips: { label: string; value: string; type: string }[] = [];
      const e = response.extracted_entities;
      if (e.education_degree) chips.push({ label: `Education: ${e.education_degree}`, value: String(e.education_degree), type: 'education' });
      if (e.target_goal) chips.push({ label: `Goal: ${e.target_goal}`, value: String(e.target_goal), type: 'goal' });
      if (Array.isArray(e.known_skills) && e.known_skills.length > 0) chips.push({ label: `Skills: ${(e.known_skills as string[]).join(', ')}`, value: (e.known_skills as string[]).join(', '), type: 'skills' });
      if (e.weekly_hours) chips.push({ label: `Commitment: ${e.weekly_hours} hrs/wk`, value: String(e.weekly_hours), type: 'hours' });
      if (e.industry_experience_type) chips.push({ label: `Experience: ${e.industry_experience_type}`, value: String(e.industry_experience_type), type: 'experience' });
      if (e.target_completion_months) chips.push({ label: `Timeline: ${e.target_completion_months} months`, value: String(e.target_completion_months), type: 'timeline' });

      const botMsg: OnboardingChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.assistant_message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplyChips: response.quick_reply_chips,
        extractedChips: chips.length > 0 ? chips : undefined,
        isCompletePrompt: response.is_profile_complete,
      };

      setMessages((prev) => [...prev, botMsg]);
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Initialize: fetch welcome message from backend
  // ---------------------------------------------------------------------------
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initChat = async () => {
      setIsProcessing(true);

      try {
        const response = await onboardingService.sendChat({
          conversation_history: [],
          extracted_entities: {},
        });
        applyBackendResponse(response);
      } catch (err) {
        console.error('Failed to initialize onboarding chat:', err);
        // Provide a local fallback welcome message
        const fallbackMsg: OnboardingChatMessage = {
          id: 'msg-onboard-init',
          role: 'assistant',
          content:
            "Welcome to PathAI! 🎯 I'm your career diagnostic assistant. Let's build your personalized learning roadmap together across 15 diagnostic categories.\n\nTo begin, what are your **education details**? (Please share your degree, major/branch, and graduation year).",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplyChips: [
            'B.Tech Computer Science (2025)',
            'B.Sc Information Technology (2024)',
            'MCA (2026)',
            'Non-CS Degree background',
          ],
        };
        setMessages([fallbackMsg]);
        if (err instanceof OnboardingApiError) {
          setErrorMessage(err.message);
        }
      } finally {
        setIsProcessing(false);
      }
    };

    initChat();
  }, [applyBackendResponse]);

  // ---------------------------------------------------------------------------
  // Send a user message
  // ---------------------------------------------------------------------------
  const handleSendMessage = useCallback(
    async (userText: string) => {
      const text = userText.trim();
      if (!text || isProcessing) return;

      setInputVal('');
      setErrorMessage(null);

      // Add user message to chat
      const userMsg: OnboardingChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setIsProcessing(true);

      try {
        const response = await onboardingService.sendChat({
          conversation_history: buildHistoryPayload(updatedMessages),
          extracted_entities: extractedEntities,
        });
        applyBackendResponse(response);
      } catch (err) {
        console.error('Onboarding chat error:', err);
        const errMsg = err instanceof OnboardingApiError
          ? err.message
          : 'Something went wrong. Please try again.';
        setErrorMessage(errMsg);

        // Add a friendly error recovery message
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-err-${Date.now()}`,
            role: 'assistant',
            content:
              "I had a brief hiccup! You can continue chatting to share more details, or click 'Generate Roadmap' below to finalize your profile with what we have so far.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            quickReplyChips: [
              'Tell me about my education and goals',
              'Generate My Roadmap Now 🚀',
            ],
          },
        ]);
      } finally {
        setIsProcessing(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [isProcessing, messages, extractedEntities, buildHistoryPayload, applyBackendResponse]
  );

  // ---------------------------------------------------------------------------
  // Handle quick reply chip click
  // ---------------------------------------------------------------------------
  const handleQuickReply = useCallback(
    (reply: string) => {
      const lower = reply.toLowerCase();
      if (lower.includes('generate') && (lower.includes('roadmap') || lower.includes('ready'))) {
        onComplete(extractedEntities, completedCategories);
        return;
      }
      handleSendMessage(reply);
    },
    [handleSendMessage, onComplete, extractedEntities, completedCategories]
  );

  // ---------------------------------------------------------------------------
  // Computed values
  // ---------------------------------------------------------------------------
  const completedCount = completedCategories.length;
  const progressPercent = Math.round((completedCount / TOTAL_CATEGORIES) * 100);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="bg-white dark:bg-[#1A1A18] rounded-3xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xl overflow-hidden flex flex-col h-[700px] max-w-4xl mx-auto">
      {/* 15-Category Progress Tracker Bar */}
      <div className="bg-[#F9F8F3] dark:bg-[#252522] px-4 sm:px-6 py-3 border-b border-[#E8E6DE] dark:border-[#2C2C29] space-y-3">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF4D31] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B7C]">
              Profile Diagnostic
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1A1A1A] dark:text-white">
              {completedCount}/{TOTAL_CATEGORIES}
            </span>
            <span className="text-[10px] font-bold text-[#7A8B7C] uppercase">Categories</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E8E6DE] dark:bg-[#1A1A18] h-1.5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#FF4D31]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Category Badges Grid */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(({ key, label, icon: Icon }) => {
            const isCompleted = completedCategories.includes(key);
            return (
              <motion.span
                key={key}
                initial={false}
                animate={isCompleted ? { scale: [1, 1.1, 1] } : {}}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-[#E8E6DE]/60 dark:bg-[#1A1A18] text-[#7A8B7C]/60 border border-transparent'
                }`}
              >
                <Icon className="w-2.5 h-2.5" />
                <span>{label}</span>
                {isCompleted && <CheckCircle2 className="w-2.5 h-2.5" />}
              </motion.span>
            );
          })}
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2"
          >
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              ⚠️ {errorMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A]'
                    : 'bg-[#FF4D31] text-white shadow-[#FF4D31]/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] space-y-3 ${isUser ? 'text-right' : ''}`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] rounded-tr-xs'
                      : 'bg-[#F9F8F3] dark:bg-[#252522] text-[#1A1A1A] dark:text-[#F9F8F3] border border-[#E8E6DE] dark:border-[#2C2C29] rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Extracted chips if any */}
                {msg.extractedChips && msg.extractedChips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.extractedChips.map((chip, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {chip.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Dynamic quick reply chips from backend */}
                {msg.quickReplyChips && msg.quickReplyChips.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {msg.quickReplyChips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickReply(chip)}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 rounded-full bg-[#F1EFE7] dark:bg-[#252522] hover:bg-[#FF4D31] hover:text-white text-[#1A1A1A] dark:text-[#F9F8F3] text-xs font-semibold border border-[#E8E6DE] dark:border-[#2C2C29] transition-all cursor-pointer shadow-xs text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                {/* Completion prompt */}
                {msg.isCompletePrompt && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800"
                  >
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      ✅ Your profile is ready! Click "Generate Roadmap" below to create your personalized learning path.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-3 text-[#7A8B7C] text-xs font-semibold p-4">
            <div className="w-5 h-5 rounded-full border-2 border-[#FF4D31] border-t-transparent animate-spin" />
            <span>PathAI is thinking...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Bottom Input Area & Generate Button */}
      <div className="p-4 bg-[#F9F8F3] dark:bg-[#252522] border-t border-[#E8E6DE] dark:border-[#2C2C29] flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isProcessing) {
              handleSendMessage(inputVal);
            }
          }}
          placeholder="Tell me about your education, goals, skills, timeline..."
          disabled={isProcessing || isSubmitting}
          className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-[#1A1A18] border border-[#E8E6DE] dark:border-[#2C2C29] text-sm focus:outline-hidden focus:border-[#FF4D31] disabled:opacity-50"
        />

        <button
          type="button"
          onClick={() => handleSendMessage(inputVal)}
          disabled={isProcessing || isSubmitting || !inputVal.trim()}
          className="px-6 py-3 rounded-2xl bg-[#FF4D31] hover:bg-[#E8402A] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-[#FF4D31]/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onComplete(extractedEntities, completedCategories)}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-2xl bg-[#1A1A1A] hover:bg-black dark:bg-white dark:hover:bg-stone-200 text-white dark:text-[#1A1A1A] font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <span>Generate Roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

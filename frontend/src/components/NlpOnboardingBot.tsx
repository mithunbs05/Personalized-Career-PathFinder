import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, User, CheckCircle2, ArrowRight, Brain, CornerDownLeft, GraduationCap, Briefcase, Code, Target, Clock, BookOpen, Wallet, Flame, Globe, FolderGit2, Award, Layers, Heart } from 'lucide-react';
import { nlpService, ChatMessage } from '../services/nlp.service';
import { UserProfile } from '../types/auth';

interface NlpOnboardingBotProps {
  profile: Partial<UserProfile>;
  setProfile: React.Dispatch<React.SetStateAction<Partial<UserProfile>>>;
  onComplete: () => void;
  isSubmitting: boolean;
}

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
];

function computeLocalCategories(profile: Partial<UserProfile>): string[] {
  const completed: string[] = [];
  if (profile?.educationDegree || profile?.education) completed.push('education');
  if (profile?.githubUrl || profile?.linkedinUrl) completed.push('professionalProfiles');
  if (profile?.industryExperienceType) completed.push('industryExperience');
  if (Array.isArray(profile?.knownSkills) && profile.knownSkills.length > 0) completed.push('technicalStack');
  if (profile?.currentProjects) completed.push('projects');
  if (profile?.completedLearning) completed.push('completedLearning');
  if (Array.isArray(profile?.technicalInterests) && profile.technicalInterests.length > 0) completed.push('technicalInterests');
  if (profile?.targetGoal) completed.push('careerGoal');
  if (profile?.targetCompletionMonths) completed.push('targetTimeline');
  if (profile?.salaryPlacementGoal) completed.push('salaryGoal');
  if (profile?.weeklyHours && profile.weeklyHours > 0) completed.push('weeklyHours');
  if (Array.isArray(profile?.learningPreferences) && profile.learningPreferences.length > 0) completed.push('learningFormat');
  if (profile?.resourceBudget) completed.push('resourceBudget');
  if (profile?.immediateMotivation) completed.push('immediateMotivation');
  return completed;
}

export const NlpOnboardingBot: React.FC<NlpOnboardingBotProps> = ({
  profile,
  setProfile,
  onComplete,
  isSubmitting,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-onboard-init',
      role: 'assistant',
      content: "Welcome to PathAI! 🎯 I'm your career diagnostic assistant. Let's build your personalized learning roadmap together.\n\nTell me about yourself — your educational background, career goal, and what technologies you already know. I'll guide you through all 14 profile categories conversationally.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedReplies: [
        'I have a B.Tech in CS and want to become an AI/ML Engineer. I know Python and SQL.',
        'Self-taught developer with React and Node.js experience, targeting Full Stack roles.',
        'Fresher with a CS degree, aiming for Tier-1 product company placements in ML.',
      ],
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedCategories, setCompletedCategories] = useState<string[]>(() => computeLocalCategories(profile));
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  useEffect(() => {
    setCompletedCategories(computeLocalCategories(profile));
  }, [profile]);

  const completedCount = completedCategories.length;
  const progressPercent = Math.round((completedCount / 14) * 100);

  const handleSendMessage = async (userText: string) => {
    const text = userText.trim();
    if (!text || isProcessing) return;

    setInputVal('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      }));

      const res = await nlpService.parseProfileMessage(text, profile, undefined, history);

      if (res.extractedProfile) {
        setProfile((prev) => ({
          ...prev,
          ...res.extractedProfile,
        }));
      }

      // Update categories from server response
      if ((res as any).completedCategories) {
        setCompletedCategories((res as any).completedCategories);
      }

      const extractedItems: string[] = [];
      const ep = res.extractedProfile;
      if (ep.educationDegree || ep.education) extractedItems.push(`Education: ${ep.educationDegree || ep.education}`);
      if (ep.targetGoal) extractedItems.push(`Goal: ${ep.targetGoal}`);
      if (ep.knownSkills && ep.knownSkills.length > 0) extractedItems.push(`Skills: ${ep.knownSkills.join(', ')}`);
      if (ep.weeklyHours) extractedItems.push(`Commitment: ${ep.weeklyHours} hrs/wk`);
      if (ep.githubUrl) extractedItems.push(`GitHub: Connected`);
      if (ep.linkedinUrl) extractedItems.push(`LinkedIn: Connected`);
      if (ep.industryExperienceType) extractedItems.push(`Experience: ${ep.industryExperienceType}`);
      if (ep.targetCompletionMonths) extractedItems.push(`Timeline: ${ep.targetCompletionMonths} months`);
      if (ep.immediateMotivation) extractedItems.push(`Motivation: ${ep.immediateMotivation}`);
      if (ep.resourceBudget) extractedItems.push(`Budget: ${ep.resourceBudget}`);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: res.botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedReplies: res.suggestedReplies || [],
        extractedChips: extractedItems.map((item) => ({
          label: item,
          value: item,
          type: item.split(':')[0].toLowerCase(),
        })),
        isCompletePrompt: res.isComplete,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Onboarding chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: "I've noted your preferences! You can continue chatting to fill more categories, or click 'Generate Roadmap' below to finalize your profile.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedReplies: ['Generate My Custom Roadmap Now 🚀', 'Add more details about my projects'],
        },
      ]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleQuickReply = (reply: string) => {
    if (reply.toLowerCase().includes('generate') || reply.toLowerCase().includes('roadmap') || reply.toLowerCase().includes('ready')) {
      onComplete();
      return;
    }
    handleSendMessage(reply);
  };

  return (
    <div className="bg-white dark:bg-[#1A1A18] rounded-3xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xl overflow-hidden flex flex-col h-[700px] max-w-4xl mx-auto">
      {/* 14-Category Progress Tracker Bar */}
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
              {completedCount}/14
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

                {/* Suggested replies */}
                {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {msg.suggestedReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickReply(reply)}
                        className="px-3.5 py-1.5 rounded-full bg-[#F1EFE7] dark:bg-[#252522] hover:bg-[#FF4D31] hover:text-white text-[#1A1A1A] dark:text-[#F9F8F3] text-xs font-semibold border border-[#E8E6DE] dark:border-[#2C2C29] transition-all cursor-pointer shadow-xs text-left"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-3 text-[#7A8B7C] text-xs font-semibold p-4">
            <div className="w-5 h-5 rounded-full border-2 border-[#FF4D31] border-t-transparent animate-spin" />
            <span>PathAI is analyzing your profile across 14 categories...</span>
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
          onClick={onComplete}
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

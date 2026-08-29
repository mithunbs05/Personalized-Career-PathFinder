import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Send,
  Sparkles,
  BookOpen,
  Dumbbell,
  ClipboardCheck,
  Target,
  Map,
  BarChart3,
  ChevronRight,
  Zap,
  Brain,
  MessageCircle,
  HelpCircle,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
} from 'lucide-react';
import { RoadmapStage, SkillCluster, SkillItem } from '../../types/roadmap';
import { User } from '../../types/auth';
import {
  TodaysFocus,
  MentorMessage,
  MentorMode,
  AssessmentState,
  QuickAction,
  AssessmentQuestion,
} from '../../types/mentor';
import { SKILL_CLUSTERS, TEST_USER_PROFILES, TestUserProfile } from '../../data/mentorData';
import {
  calculateTodaysFocus,
  getMentorGreeting,
  mentorService,
  CreateAssessmentPayload,
} from '../../services/mentor.service';
import { MarkdownMessageRenderer } from './MarkdownMessageRenderer';
import { cn } from '../../lib/utils';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AIMentorPageProps {
  stages: RoadmapStage[];
  user: User | null;
  onNavigate: (tab: 'roadmap' | 'skills' | 'mentor' | 'practice') => void;
}

// ---------------------------------------------------------------------------
// Quick Actions
// ---------------------------------------------------------------------------

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'What should I study today?', prompt: 'What should I study today?', icon: 'target' },
  { label: 'Explain my weakest skill', prompt: 'Explain my weakest skill in detail', icon: 'brain' },
  { label: 'Give me practice questions', prompt: 'Give me practice questions for my current focus', icon: 'dumbbell' },
  { label: 'Test my understanding', prompt: 'Test my understanding of my current focus topic', icon: 'clipboard' },
  { label: 'Why is this skill important?', prompt: 'Why is my current focus skill important for my career?', icon: 'help' },
  { label: 'Explain my next roadmap stage', prompt: 'Explain my next roadmap stage and what I need to prepare', icon: 'map' },
];

function getQuickActionIcon(icon: string) {
  switch (icon) {
    case 'target': return <Target className="w-3.5 h-3.5" />;
    case 'brain': return <Brain className="w-3.5 h-3.5" />;
    case 'dumbbell': return <Dumbbell className="w-3.5 h-3.5" />;
    case 'clipboard': return <ClipboardCheck className="w-3.5 h-3.5" />;
    case 'help': return <HelpCircle className="w-3.5 h-3.5" />;
    case 'map': return <Map className="w-3.5 h-3.5" />;
    default: return <Sparkles className="w-3.5 h-3.5" />;
  }
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const AIMentorPage: React.FC<AIMentorPageProps> = ({ stages, user, onNavigate }) => {
  // State
  const [mode, setMode] = useState<MentorMode>('learn');
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [assessmentState, setAssessmentState] = useState<AssessmentState | null>(null);
  const [serverAssessmentQuestions, setServerAssessmentQuestions] = useState<any[]>([]);
  const [skillOverrides, setSkillOverrides] = useState<Record<string, number>>({});
  const [testProfile, setTestProfile] = useState<TestUserProfile | null>(null);
  const [showTestUsers, setShowTestUsers] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derived user / role context
  const effectiveTargetRole = testProfile?.targetRole || 'AI/ML Engineer';
  const effectiveUserName = testProfile?.name || user?.name || 'Learner';

  const currentStage = useMemo(() => {
    if (testProfile) {
      const overridden = stages.find(
        s => testProfile.stageOverrides[s.id] === 'IN_PROGRESS'
      );
      return overridden || stages.find(s => s.status === 'IN_PROGRESS') || null;
    }
    return stages.find(s => s.status === 'IN_PROGRESS') || null;
  }, [stages, testProfile]);

  const nextStage = useMemo(() => {
    if (testProfile) {
      const overridden = stages.find(
        s => testProfile.stageOverrides[s.id] === 'NOT_STARTED'
      );
      return overridden || stages.find(s => s.status === 'NOT_STARTED') || null;
    }
    return stages.find(s => s.status === 'NOT_STARTED') || null;
  }, [stages, testProfile]);

  const todaysFocus = useMemo(() => {
    return calculateTodaysFocus(stages, SKILL_CLUSTERS, user, testProfile, skillOverrides);
  }, [stages, user, testProfile, skillOverrides]);

  const completedStages = useMemo(() => {
    if (testProfile) {
      return stages.filter(s => testProfile.stageOverrides[s.id] === 'COMPLETED').length;
    }
    return stages.filter(s => s.status === 'COMPLETED').length;
  }, [stages, testProfile]);

  const progressPercentage = Math.round((completedStages / stages.length) * 100);

  // Get relevant skills for snapshot (3-5 skills, prioritized)
  const snapshotSkills = useMemo(() => {
    const allSkills: (SkillItem & { domain: string })[] = [];
    for (const cluster of SKILL_CLUSTERS) {
      for (const skill of cluster.skills) {
        const effectiveProgress = skillOverrides[skill.id] !== undefined
          ? skillOverrides[skill.id]
          : testProfile?.skillOverrides[skill.id] !== undefined
            ? testProfile.skillOverrides[skill.id]
            : skill.progress;
        allSkills.push({ ...skill, progress: effectiveProgress, domain: cluster.categoryName });
      }
    }

    const currentSkillNames = currentStage?.skills.map(s => s.toLowerCase()) || [];
    const focusSkillId = todaysFocus?.skillId;

    return allSkills
      .filter(s => s.level !== 'Locked' || (testProfile?.skillOverrides[s.id] !== undefined))
      .sort((a, b) => {
        if (a.id === focusSkillId) return -1;
        if (b.id === focusSkillId) return 1;
        const aIsCurrent = currentSkillNames.includes(a.name.toLowerCase());
        const bIsCurrent = currentSkillNames.includes(b.name.toLowerCase());
        if (aIsCurrent && !bIsCurrent) return -1;
        if (!aIsCurrent && bIsCurrent) return 1;
        return a.progress - b.progress;
      })
      .slice(0, 5);
  }, [currentStage, todaysFocus, testProfile, skillOverrides]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting and live server synchronization on mount or profile change
  useEffect(() => {
    const initMentor = async () => {
      try {
        // Fetch live context from server
        const ctx = await mentorService.getContext();
        if (ctx?.focus && !testProfile) {
          // If server provides focus mastery, ensure it syncs
          setSkillOverrides(prev => ({
            ...prev,
            [ctx.focus.skillId]: ctx.focus.mastery,
          }));
        }
      } catch (err) {
        console.info('Using local client mentor state:', err);
      }

      const greeting = getMentorGreeting(todaysFocus, effectiveUserName, effectiveTargetRole, mode);
      setMessages([greeting]);
      setSessionActive(false);
      setSessionId(null);
      setAssessmentState(null);
      setActiveAssessmentId(null);
    };

    initMentor();
  }, [testProfile]);

  // Send message handler (Live Backend AI with Local Fallback)
  const handleSendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: MentorMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let activeSessId = sessionId;
      if (!activeSessId) {
        // Create session on-demand if none active
        const sessRes = await mentorService.createSession(mode, todaysFocus);
        activeSessId = sessRes.id;
        setSessionId(activeSessId);
        setSessionActive(true);
      }

      const aiResponse = await mentorService.sendMessage(activeSessId, messageText);

      const assistantMessage: MentorMessage = {
        id: aiResponse.id || `response-${Date.now()}`,
        sender: 'ai',
        text: aiResponse.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.warn('Backend message call failed, using client fallback:', err);
      // Fallback message
      const fallbackMsg: MentorMessage = {
        id: `response-${Date.now()}`,
        sender: 'ai',
        text: `That's a great question about **${todaysFocus?.skill || 'your curriculum'}**.\n\nIn modern AI systems, mastering **${todaysFocus?.skill}** builds essential foundations for high-performance neural computation and model optimization.\n\nWould you like to practice problems or take a quiz?`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, sessionId, mode, todaysFocus]);

  // Start Session handler (Live Backend Session Creation)
  const handleStartSession = useCallback(async () => {
    if (!todaysFocus) return;
    setIsLoading(true);

    try {
      const sessRes = await mentorService.createSession(mode, todaysFocus);
      const activeSessId = sessRes.id;
      setSessionId(activeSessId);
      setSessionActive(true);

      const sessionGreeting: MentorMessage = {
        id: `session-greet-${Date.now()}`,
        sender: 'ai',
        text: sessRes.opening_message || `🎯 **${mode.toUpperCase()} Session Started — ${todaysFocus.skill}**\n\nLet's get started!`,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, sessionGreeting]);

      if (mode === 'assess') {
        // Generate secure assessment questions from server
        const asmRes = await mentorService.createAssessment(activeSessId);
        setActiveAssessmentId(asmRes.assessment_id);

        const clientQuestions: AssessmentQuestion[] = asmRes.questions.map((q, idx) => ({
          id: q.id,
          text: q.text,
          options: q.options,
          correctAnswer: -1, // Hidden on client until server evaluation
          explanation: '',
        }));

        setServerAssessmentQuestions(clientQuestions);

        setAssessmentState({
          questions: clientQuestions,
          currentIndex: 0,
          answers: new Array(clientQuestions.length).fill(null),
          isComplete: false,
          score: null,
        });

        // Send first question
        const firstQ = clientQuestions[0];
        const questionMsg: MentorMessage = {
          id: `q-0-${Date.now()}`,
          sender: 'ai',
          text: `**Question 1 of ${clientQuestions.length}:**\n\n${firstQ.text}`,
          timestamp: new Date().toISOString(),
          isAssessmentQuestion: true,
          questionIndex: 0,
          options: firstQ.options,
        };

        setTimeout(() => {
          setMessages(prev => [...prev, questionMsg]);
        }, 400);
      } else if (mode === 'practice') {
        // Fetch practice challenge from server
        const practiceRes = await mentorService.getPractice(activeSessId);
        const practiceMsg: MentorMessage = {
          id: `practice-${Date.now()}`,
          sender: 'ai',
          text: `${practiceRes.exercise_prompt}\n\n${practiceRes.hints && practiceRes.hints.length > 0 ? `💡 **Hints:**\n${practiceRes.hints.map(h => `• ${h}`).join('\n')}` : ''}`,
          timestamp: new Date().toISOString(),
        };
        setTimeout(() => {
          setMessages(prev => [...prev, practiceMsg]);
        }, 400);
      }
    } catch (err) {
      console.warn('Session start error, using local fallback:', err);
      setSessionActive(true);
    } finally {
      setIsLoading(false);
    }
  }, [todaysFocus, mode]);

  // Assessment answer handler (Server-Side Authoritative Grading)
  const handleAssessmentAnswer = useCallback(async (optionIndex: number) => {
    if (!assessmentState || assessmentState.isComplete) return;

    const { questions, currentIndex, answers } = assessmentState;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;

    const isLastQuestion = currentIndex >= questions.length - 1;

    if (isLastQuestion) {
      setIsLoading(true);
      try {
        const asmId = activeAssessmentId || `asm-${Date.now()}`;
        const submissionResult = await mentorService.submitAssessment(
          asmId,
          newAnswers.map(a => (a !== null ? a : 0))
        );

        // Render per-question result messages
        submissionResult.results.forEach((r, idx) => {
          const resultMsg: MentorMessage = {
            id: `answer-res-${idx}-${Date.now()}`,
            sender: 'ai',
            text: `${r.correct ? '✅ **Correct!**' : `❌ **Incorrect.** The correct answer was option ${String.fromCharCode(65 + r.correct_option)}.`}\n\n💡 ${r.explanation}`,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, resultMsg]);
        });

        // Summary message
        const summaryMsg: MentorMessage = {
          id: `summary-${Date.now()}`,
          sender: 'ai',
          text: `📊 **Assessment Complete!**\n\n**Score: ${submissionResult.correct_count}/${submissionResult.total_questions} (${submissionResult.score}%)**\n\n${submissionResult.mentor_feedback}\n\n*Updated ${submissionResult.skill_name} mastery to ${submissionResult.new_mastery}%. Today's Focus recalculated!*`,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, summaryMsg]);

        // Update skill mastery dynamically
        if (todaysFocus) {
          setSkillOverrides(prev => ({
            ...prev,
            [todaysFocus.skillId]: submissionResult.new_mastery,
          }));
        }

        setAssessmentState({
          ...assessmentState,
          answers: newAnswers,
          isComplete: true,
          score: submissionResult.score,
        });
      } catch (err) {
        console.error('Assessment submission error:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Advance to next question
      const nextIndex = currentIndex + 1;
      const nextQ = questions[nextIndex];

      setAssessmentState({
        ...assessmentState,
        currentIndex: nextIndex,
        answers: newAnswers,
      });

      setTimeout(() => {
        const nextMsg: MentorMessage = {
          id: `q-${nextIndex}-${Date.now()}`,
          sender: 'ai',
          text: `**Question ${nextIndex + 1} of ${questions.length}:**\n\n${nextQ.text}`,
          timestamp: new Date().toISOString(),
          isAssessmentQuestion: true,
          questionIndex: nextIndex,
          options: nextQ.options,
        };
        setMessages(prev => [...prev, nextMsg]);
      }, 400);
    }
  }, [assessmentState, activeAssessmentId, todaysFocus]);

  // Mode change handler
  const handleModeChange = (newMode: MentorMode) => {
    setMode(newMode);
    setAssessmentState(null);
    setActiveAssessmentId(null);
    setSessionActive(false);

    const modeMsg: MentorMessage = {
      id: `mode-change-${Date.now()}`,
      sender: 'ai',
      text: `Switched to **${newMode.charAt(0).toUpperCase() + newMode.slice(1)}** mode. ${
        newMode === 'learn'
          ? 'I\'ll focus on conceptual explanations, intuitive breakdowns, and architecture insights.'
          : newMode === 'practice'
          ? 'I\'ll generate targeted code challenges and problem walkthroughs.'
          : 'I\'ll test your knowledge with structured assessment questions. Click **Start Session** to begin.'
      }`,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, modeMsg]);
  };

  // Key press handler
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      {/* ================================================================ */}
      {/* LEFT COLUMN — Chat (8 cols on desktop) */}
      {/* ================================================================ */}
      <div className="lg:col-span-8 flex flex-col gap-4">

        {/* Mentor Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#f97316] flex items-center justify-center text-white shadow-sm shadow-[#ea580c]/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Mentor</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your personalized learning companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-full text-[10px] font-bold text-[#ea580c] uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse" />
                Personalized to your roadmap
              </span>
              {/* Dev-only test user toggle */}
              <button
                onClick={() => setShowTestUsers(!showTestUsers)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Switch test user profiles (dev only)"
              >
                <Users className="w-3 h-3" />
                Test Users
              </button>
            </div>
          </div>

          {/* Test User Selector (dev-only) */}
          {showTestUsers && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Dev Testing — Switch User Profile</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setTestProfile(null); setSkillOverrides({}); }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                    !testProfile
                      ? "bg-[#ea580c] text-white border-[#ea580c] shadow-sm shadow-[#ea580c]/20"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#ea580c]/50"
                  )}
                >
                  Default ({user?.name || 'Alex Rivera'})
                </button>
                {TEST_USER_PROFILES.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => { setTestProfile(profile); setSkillOverrides({}); }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                      testProfile?.id === profile.id
                        ? "bg-[#ea580c] text-white border-[#ea580c] shadow-sm shadow-[#ea580c]/20"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#ea580c]/50"
                    )}
                  >
                    {profile.name} — {profile.targetRole}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-1.5">
          {([
            { id: 'learn' as MentorMode, label: 'Learn', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'practice' as MentorMode, label: 'Practice', icon: <Dumbbell className="w-3.5 h-3.5" /> },
            { id: 'assess' as MentorMode, label: 'Assess', icon: <ClipboardCheck className="w-3.5 h-3.5" /> },
          ]).map(m => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                mode === m.id
                  ? "bg-[#ea580c] text-white shadow-sm shadow-[#ea580c]/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(action.prompt)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-[#ea580c]/50 hover:text-[#ea580c] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {getQuickActionIcon(action.icon)}
              {action.label}
            </button>
          ))}
        </div>

        {/* Conversation Area */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col" style={{ minHeight: '420px', maxHeight: '520px' }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                  <MessageCircle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Start a Conversation</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ask your mentor anything about your learning path</p>
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={cn("flex gap-3", msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ea580c] to-[#f97316] flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.sender === 'user'
                      ? "bg-[#ea580c] text-white rounded-br-md"
                      : "bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-md"
                  )}>
                    <MarkdownMessageRenderer content={msg.text} isUser={msg.sender === 'user'} />

                    {/* Assessment question options */}
                    {msg.isAssessmentQuestion && msg.options && (
                      <div className="mt-3 space-y-2">
                        {msg.options.map((opt, oi) => (
                          <button
                            key={oi}
                            onClick={() => handleAssessmentAnswer(oi)}
                            disabled={assessmentState?.answers[msg.questionIndex!] !== null || isLoading}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer",
                              assessmentState?.answers[msg.questionIndex!] === oi
                                ? "bg-orange-50 dark:bg-orange-950/30 border-[#ea580c] text-[#ea580c] font-bold"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#ea580c]/50 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                            )}
                          >
                            <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0 mt-0.5 text-xs font-bold">
                      {(effectiveUserName[0] || 'U').toUpperCase()}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ea580c] to-[#f97316] flex items-center justify-center text-white flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-typing-1" />
                  <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-typing-2" />
                  <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-typing-3" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Composer */}
          <div className="border-t border-slate-100 dark:border-slate-800 p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask your mentor anything about your learning path..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/30 focus:border-[#ea580c]/50 transition-all disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="p-2.5 bg-[#ea580c] hover:bg-[#d84d08] disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 dark:disabled:text-slate-500 rounded-xl transition-all shadow-sm shadow-[#ea580c]/20 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* RIGHT COLUMN — Sidebar (4 cols on desktop) */}
      {/* ================================================================ */}
      <div className="lg:col-span-4 flex flex-col gap-4">

        {/* ------------------------------------------------------------ */}
        {/* 1. TODAY'S FOCUS CARD */}
        {/* ------------------------------------------------------------ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#ea580c]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Today's Focus</h3>
            </div>
          </div>

          <div className="p-4">
            {todaysFocus ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{todaysFocus.domain}</p>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{todaysFocus.skill}</h4>
                  {todaysFocus.topic && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{todaysFocus.topic}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    todaysFocus.priority === 'HIGH'
                      ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      : todaysFocus.priority === 'MEDIUM'
                      ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      : 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                  )}>
                    {todaysFocus.priority} PRIORITY
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {todaysFocus.estimatedMinutes} min
                  </span>
                </div>

                {/* Mastery bar */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mastery</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{todaysFocus.mastery}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700 ease-out", getProgressBarColor(todaysFocus.mastery))}
                      style={{ width: `${todaysFocus.mastery}%` }}
                    />
                  </div>
                </div>

                {/* Reason */}
                <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                  {todaysFocus.reason}
                </p>

                {/* Start Session button */}
                <button
                  onClick={handleStartSession}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ea580c] hover:bg-[#d84d08] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-[#ea580c]/20 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  {sessionActive ? 'Restart Session' : 'Start Session'}
                </button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-700">
                  <AlertTriangle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculating your learning focus...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* 2. CURRENT ROADMAP CARD */}
        {/* ------------------------------------------------------------ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-[#ea580c]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Current Roadmap</h3>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {currentStage ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Stage {currentStage.id} of {stages.length}</p>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{currentStage.title}</h4>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#ea580c] mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse" />
                      In Progress
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overall Progress</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ea580c] to-[#f97316] rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Next stage */}
                {nextStage && (
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Next Stage</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{nextStage.title}</p>
                    </div>
                  </div>
                )}

                {/* Blockers */}
                {todaysFocus?.blocksStage && (
                  <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      <strong>{todaysFocus.skill}</strong> is blocking progress to <strong>{todaysFocus.blocksStage}</strong>
                    </p>
                  </div>
                )}

                <button
                  onClick={() => onNavigate('roadmap')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <Map className="w-3.5 h-3.5" />
                  View Roadmap
                </button>
              </>
            ) : (
              <div className="text-center py-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">No active roadmap stage found.</p>
                <button
                  onClick={() => onNavigate('roadmap')}
                  className="mt-2 text-xs font-bold text-[#ea580c] hover:text-[#d84d08] transition-colors cursor-pointer"
                >
                  View Roadmap →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* 3. SKILL SNAPSHOT CARD */}
        {/* ------------------------------------------------------------ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#ea580c]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Skill Snapshot</h3>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {snapshotSkills.length > 0 ? (
              <>
                {snapshotSkills.map(skill => (
                  <div key={skill.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{skill.name}</span>
                        {skill.id === todaysFocus?.skillId && (
                          <span className="text-[8px] font-bold bg-orange-100 dark:bg-orange-950/30 text-[#ea580c] px-1.5 py-0.5 rounded-full">FOCUS</span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{skill.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", getProgressBarColor(skill.progress))}
                        style={{ width: `${skill.progress}%` }}
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => onNavigate('skills')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer mt-2"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  View Skill Matrix
                </button>
              </>
            ) : (
              <div className="text-center py-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">No skill data available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Assessment Result Badge (shown after assessment) */}
        {assessmentState?.isComplete && (
          <div className={cn(
            "border rounded-2xl shadow-sm p-4",
            assessmentState.score! >= 80
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
              : assessmentState.score! >= 50
              ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
              : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800"
          )}>
            <div className="flex items-center gap-3">
              {assessmentState.score! >= 80 ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              ) : assessmentState.score! >= 50 ? (
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-500" />
              )}
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Assessment Score: {assessmentState.score}%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {todaysFocus?.skill} — Mastery updated to {todaysFocus?.mastery}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMentorPage;

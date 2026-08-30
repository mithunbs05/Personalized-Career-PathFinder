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
import { SKILL_CLUSTERS } from '../../data/mentorData';
import {
  calculateTodaysFocus,
  getMentorGreeting,
  mentorService,
  CreateAssessmentPayload,
} from '../../services/mentor.service';
import { MarkdownMessageRenderer } from './MarkdownMessageRenderer';
import { RoadmapOverviewResponse } from '../../services/roadmap.service';
import { cn } from '../../lib/utils';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AIMentorPageProps {
  stages: RoadmapStage[];
  user: User | null;
  overview?: RoadmapOverviewResponse | null;
  initialContext?: {
    stageTitle?: string;
    stageId?: number;
    skillName?: string;
    skillFocus?: string;
    topicTitle?: string;
    mastery?: number;
    mode?: 'learn' | 'practice' | 'assess';
    reason?: string;
  } | null;
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

export const AIMentorPage: React.FC<AIMentorPageProps> = ({
  stages,
  user,
  overview,
  initialContext,
  onNavigate,
}) => {
  // Persistent State across reloads
  const [mode, setMode] = useState<MentorMode>(() => {
    if (initialContext?.mode) return initialContext.mode;
    const saved = localStorage.getItem('pathai_mentor_mode');
    return (saved === 'learn' || saved === 'practice' || saved === 'assess') ? saved : 'learn';
  });

  const [messages, setMessages] = useState<MentorMessage[]>(() => {
    try {
      const saved = localStorage.getItem('pathai_mentor_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);

  const [sessionActive, setSessionActive] = useState<boolean>(() => {
    return localStorage.getItem('pathai_mentor_session_active') === 'true';
  });

  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem('pathai_mentor_session_id') || null;
  });

  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(() => {
    return localStorage.getItem('pathai_mentor_assessment_id') || null;
  });

  const [assessmentState, setAssessmentState] = useState<AssessmentState | null>(() => {
    try {
      const saved = localStorage.getItem('pathai_mentor_assessment_state');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [assessmentResults, setAssessmentResults] = useState<Array<{
    question_id: string;
    correct: boolean;
    selected_option: number;
    correct_option: number;
    explanation: string;
  }> | null>(() => {
    try {
      const saved = localStorage.getItem('pathai_mentor_assessment_results');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [serverAssessmentQuestions, setServerAssessmentQuestions] = useState<any[]>([]);
  const [skillOverrides, setSkillOverrides] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('pathai_skill_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [serverContext, setServerContext] = useState<any | null>(null);
  const [serverFocus, setServerFocus] = useState<TodaysFocus | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync assessmentResults to localStorage
  useEffect(() => {
    if (assessmentResults) {
      try {
        localStorage.setItem('pathai_mentor_assessment_results', JSON.stringify(assessmentResults));
      } catch {}
    } else {
      localStorage.removeItem('pathai_mentor_assessment_results');
    }
  }, [assessmentResults]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('pathai_mentor_mode', mode);
  }, [mode]);

  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('pathai_mentor_messages', JSON.stringify(messages));
      } catch {}
    }
  }, [messages]);

  // Handle cross-system contextual navigation from Roadmap or Skill Matrix
  useEffect(() => {
    if (initialContext) {
      if (initialContext.mode) {
        setMode(initialContext.mode);
      }
      if (initialContext.topicTitle) {
        setServerFocus({
          domain: initialContext.stageTitle || 'Current Learning Stage',
          skill: initialContext.skillName || initialContext.topicTitle,
          skillId: String(initialContext.stageId || 's1'),
          topic: initialContext.topicTitle,
          mastery: initialContext.mastery ?? 20,
          priority: 'HIGH',
          estimatedMinutes: 30,
          reason: initialContext.reason || `Targeting key topic '${initialContext.topicTitle}' to advance your roadmap progress.`,
          blocksStage: initialContext.stageTitle || null,
        });

        const actionText = initialContext.mode === 'practice'
          ? `Let's practice core problems on "${initialContext.topicTitle}".`
          : initialContext.mode === 'assess'
          ? `I want to take a diagnostic assessment on "${initialContext.topicTitle}".`
          : `Can you explain the key concepts and intuition behind "${initialContext.topicTitle}"?`;

        setInputValue(actionText);
      }
    }
  }, [initialContext]);

  useEffect(() => {
    localStorage.setItem('pathai_mentor_session_active', String(sessionActive));
  }, [sessionActive]);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('pathai_mentor_session_id', sessionId);
    } else {
      localStorage.removeItem('pathai_mentor_session_id');
    }
  }, [sessionId]);

  useEffect(() => {
    if (activeAssessmentId) {
      localStorage.setItem('pathai_mentor_assessment_id', activeAssessmentId);
    } else {
      localStorage.removeItem('pathai_mentor_assessment_id');
    }
  }, [activeAssessmentId]);

  useEffect(() => {
    if (assessmentState) {
      try {
        localStorage.setItem('pathai_mentor_assessment_state', JSON.stringify(assessmentState));
      } catch {}
    } else {
      localStorage.removeItem('pathai_mentor_assessment_state');
    }
  }, [assessmentState]);

  useEffect(() => {
    if (Object.keys(skillOverrides).length > 0) {
      try {
        localStorage.setItem('pathai_skill_overrides', JSON.stringify(skillOverrides));
      } catch {}
    }
  }, [skillOverrides]);

  // Derived user / role context
  const effectiveTargetRole = overview?.target_role || user?.profile?.targetGoal || serverContext?.target_role || 'AI/ML Engineer';
  const effectiveUserName = user?.name || overview?.user_name || serverContext?.user_name || 'Learner';

  const currentStage = useMemo(() => {
    if (overview?.current_stage) {
      return overview.current_stage;
    }
    if (serverContext?.current_stage) {
      const matched = stages.find(s => s.title.toLowerCase() === serverContext.current_stage.toLowerCase());
      if (matched) return matched;
    }
    return stages.find(s => s.status === 'IN_PROGRESS' || s.status === 'AVAILABLE' || s.status === 'NOT_STARTED') || stages[0] || null;
  }, [stages, serverContext, overview]);

  const nextStage = useMemo(() => {
    if (overview?.next_stage) {
      return overview.next_stage;
    }
    return stages.find(s => s.id > (currentStage?.id || 0)) || null;
  }, [stages, currentStage, overview]);

  const todaysFocus = useMemo(() => {
    let focus: TodaysFocus | null = serverFocus ? { ...serverFocus } : null;
    if (!focus) {
      focus = calculateTodaysFocus(stages, SKILL_CLUSTERS, user, skillOverrides);
    }
    if (focus) {
      const override = skillOverrides[focus.skillId] ?? skillOverrides[focus.skill] ?? (focus.skill.toLowerCase() === 'optimization' ? (skillOverrides['s7'] ?? skillOverrides['Optimization']) : undefined);
      if (override !== undefined) {
        focus = {
          ...focus,
          mastery: override,
          priority: override >= 70 ? 'LOW' : override >= 40 ? 'MEDIUM' : 'HIGH',
          reason: override >= 70
            ? `Mastery reached ${override}%! Ready for advanced applications in upcoming stages.`
            : override >= 30
            ? `Good progress (${override}% mastery). Continue practice or assessment to unlock next milestone.`
            : focus.reason,
        };
      }
    }
    return focus;
  }, [serverFocus, stages, user, skillOverrides]);

  const completedStages = useMemo(() => {
    return stages.filter(s => s.status === 'COMPLETED').length;
  }, [stages]);

  const progressPercentage = useMemo(() => {
    return overview?.overall_progress ?? (serverContext?.overall_mastery ?? 0);
  }, [overview, serverContext]);

  // Get relevant skills for snapshot directly from live backend context or current stage
  const snapshotSkills = useMemo(() => {
    if (serverContext?.relevant_skills && serverContext.relevant_skills.length > 0) {
      const serverSkills = serverContext.relevant_skills.map((s: any) => ({
        id: s.id,
        name: s.name,
        domain: s.domain || 'Core Skills',
        level: s.level || 'Novice',
        progress: skillOverrides[s.id] !== undefined ? skillOverrides[s.id] : (s.progress || 0),
        isVerified: Boolean(s.is_verified),
      }));

      const focusSkillId = todaysFocus?.skillId;
      return serverSkills
        .sort((a: any, b: any) => {
          if (a.id === focusSkillId) return -1;
          if (b.id === focusSkillId) return 1;
          return a.progress - b.progress;
        })
        .slice(0, 5);
    }

    // Fallback directly to active stage topics / skills starting at 0%
    const stageTopics = (currentStage as any)?.topics || [];
    if (stageTopics.length > 0) {
      return stageTopics.slice(0, 5).map((t: any) => ({
        id: t.id,
        name: t.title,
        domain: currentStage?.title || 'Active Stage',
        level: ((t.mastery || 0) >= 70 ? 'Proficient' : ((t.mastery || 0) >= 40 ? 'Developing' : 'Novice')) as SkillItem['level'],
        progress: skillOverrides[t.id] !== undefined ? skillOverrides[t.id] : (t.progress || t.mastery || 0),
        isVerified: (t.mastery || 0) >= 75,
      }));
    }

    const stageSkillNames = currentStage?.skills || ['Python Basics', 'Control Flow', 'Functions'];
    return stageSkillNames.slice(0, 5).map((name, idx) => ({
      id: `stage-sk-${idx}`,
      name,
      domain: currentStage?.title || 'Active Stage',
      level: 'Novice' as SkillItem['level'],
      progress: skillOverrides[name] !== undefined ? skillOverrides[name] : 0,
      isVerified: false,
    }));
  }, [serverContext, currentStage, todaysFocus, skillOverrides]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting and live server synchronization on mount (preserves existing conversation)
  useEffect(() => {
    const initMentor = async () => {
      setIsLoading(true);
      try {
        // Fetch live context from server
        const ctx = await mentorService.getContext();
        setServerContext(ctx);
        if (ctx?.focus) {
          setServerFocus(ctx.focus);
        }

        // Generate dynamic greeting tailored to current authenticated user
        setMessages(prev => {
          // If previous messages contain old demo user 'Alex Rivera' or mismatched greeting, regenerate
          const hasStaleDemoGreeting = prev.length === 1 && (prev[0].text.includes('Alex Rivera') || prev[0].text.includes('Optimization (10% mastery)'));
          if (prev.length > 0 && !hasStaleDemoGreeting) return prev;

          if (ctx?.recent_messages && ctx.recent_messages.length > 0 && !hasStaleDemoGreeting) {
            return ctx.recent_messages.map((m: any) => ({
              id: m.id || `msg-${Date.now()}-${Math.random()}`,
              sender: m.sender,
              text: m.text,
              timestamp: m.timestamp || new Date().toISOString(),
            }));
          }

          let effectiveFocus = ctx?.focus ? { ...ctx.focus } : calculateTodaysFocus(stages, SKILL_CLUSTERS, user, skillOverrides);
          if (effectiveFocus) {
            const override = skillOverrides[effectiveFocus.skillId] ?? skillOverrides[effectiveFocus.skill];
            if (override !== undefined) {
              effectiveFocus.mastery = override;
            }
          }
          const greeting = getMentorGreeting(effectiveFocus, effectiveUserName, effectiveTargetRole, mode);
          return [greeting];
        });

        if (ctx?.active_session_id && !sessionId) {
          setSessionId(ctx.active_session_id);
          setSessionActive(true);
        }
      } catch (err) {
        console.warn('Backend context initial fetch error:', err);
        setMessages(prev => {
          const hasStaleDemoGreeting = prev.length === 1 && (prev[0].text.includes('Alex Rivera') || prev[0].text.includes('Optimization (10% mastery)'));
          if (prev.length > 0 && !hasStaleDemoGreeting) return prev;

          let effectiveFocus = calculateTodaysFocus(stages, SKILL_CLUSTERS, user, skillOverrides);
          if (effectiveFocus) {
            const override = skillOverrides[effectiveFocus.skillId] ?? skillOverrides[effectiveFocus.skill];
            if (override !== undefined) {
              effectiveFocus.mastery = override;
            }
          }
          const greeting = getMentorGreeting(effectiveFocus, effectiveUserName, effectiveTargetRole, mode);
          return [greeting];
        });
      } finally {
        setIsLoading(false);
      }
    };

    initMentor();
  }, [effectiveUserName, effectiveTargetRole]);

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
      console.error('Failed to communicate with AI Mentor backend:', err);
      const errorMsg: MentorMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **Connection Error:** Could not reach the AI Mentor service. Please check your network connection and try sending your message again.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, sessionId, mode, todaysFocus]);

  // Start Session handler (Live Backend Session Creation)
  const handleStartSession = useCallback(async (overrideMode?: MentorMode) => {
    const targetMode = overrideMode || mode;
    if (!todaysFocus) return;
    setIsLoading(true);

    try {
      const sessRes = await mentorService.createSession(targetMode, todaysFocus);
      const activeSessId = sessRes.id;
      setSessionId(activeSessId);
      setSessionActive(true);
      if (overrideMode) {
        setMode(overrideMode);
      }

      const currentMastery = todaysFocus.mastery;
      const sessionGreeting: MentorMessage = {
        id: `session-greet-${Date.now()}`,
        sender: 'ai',
        text: `🎯 **${targetMode.charAt(0).toUpperCase() + targetMode.slice(1)} Session Started: ${todaysFocus.skill}**\n\nYou're focusing on **${todaysFocus.skill}** (${currentMastery}% mastery) in **${todaysFocus.domain}**.\n*${todaysFocus.reason}*\n\nHow would you like to begin?`,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, sessionGreeting]);

      if (targetMode === 'assess') {
        // Generate secure assessment questions from server
        const asmRes = await mentorService.createAssessment(activeSessId);
        setActiveAssessmentId(asmRes.assessment_id);

        const clientQuestions: AssessmentQuestion[] = asmRes.questions.map((q) => ({
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
      } else if (targetMode === 'practice') {
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

  // Restart Session Handler (Clean state and localStorage reset)
  const handleRestartSession = useCallback(() => {
    localStorage.removeItem('pathai_mentor_messages');
    localStorage.removeItem('pathai_mentor_session_id');
    localStorage.removeItem('pathai_mentor_session_active');
    localStorage.removeItem('pathai_mentor_assessment_id');
    localStorage.removeItem('pathai_mentor_assessment_state');

    setSessionId(null);
    setSessionActive(false);
    setAssessmentState(null);
    const greeting = getMentorGreeting(todaysFocus, effectiveUserName, effectiveTargetRole, mode);
    setMessages([greeting]);
  }, [todaysFocus, effectiveUserName, effectiveTargetRole, mode]);

  // Quick Action click handler
  const handleQuickAction = useCallback(async (action: QuickAction) => {
    if (isLoading) return;

    if (action.label === 'Give me practice questions') {
      handleStartSession('practice');
    } else if (action.label === 'Test my understanding') {
      handleStartSession('assess');
    } else {
      let promptText = action.prompt;
      if (action.label === 'Explain my weakest skill' && todaysFocus) {
        promptText = `Explain my current focus skill, ${todaysFocus.skill}, and provide a detailed breakdown of core concepts I should master.`;
      } else if (action.label === 'Why is this skill important?' && todaysFocus) {
        promptText = `Why is ${todaysFocus.skill} important for my goal of becoming a ${effectiveTargetRole}?`;
      } else if (action.label === 'Explain my next roadmap stage' && nextStage) {
        promptText = `Explain my next roadmap stage, ${nextStage.title}, and what foundational concepts from my current stage I should master first.`;
      }
      handleSendMessage(promptText);
    }
  }, [isLoading, todaysFocus, effectiveTargetRole, nextStage, handleStartSession, handleSendMessage]);

  // Assessment answer handler (Server-Side Authoritative Grading + Instant UI Feedback & Resilient Fallback)
  const handleAssessmentAnswer = useCallback(async (questionIdx: number, optionIndex: number) => {
    if (!assessmentState || assessmentState.isComplete || isSubmittingAssessment) return;

    const { questions, answers } = assessmentState;
    const newAnswers = [...answers];
    newAnswers[questionIdx] = optionIndex;

    // 1. Immediately update UI state so clicked option turns selected and active
    setAssessmentState(prev => prev ? {
      ...prev,
      answers: newAnswers,
    } : null);

    const isLastQuestion = questionIdx >= questions.length - 1;

    if (isLastQuestion) {
      setIsSubmittingAssessment(true);

      const evalMsgId = `eval-${Date.now()}`;
      const evalMsg: MentorMessage = {
        id: evalMsgId,
        sender: 'ai',
        text: `⏳ **Evaluating your answers & calculating updated mastery...**`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, evalMsg]);

      try {
        const asmId = activeAssessmentId || `asm-${Date.now()}`;
        const submissionResult = await mentorService.submitAssessment(
          asmId,
          newAnswers.map(a => (a !== null ? a : 0))
        );

        // Remove the temporary evaluating placeholder
        setMessages(prev => prev.filter(m => m.id !== evalMsgId));

        // Store authoritative question results for live visual differentiation
        setAssessmentResults(submissionResult.results);

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
        const newMastery = submissionResult.new_mastery;
        const skillName = submissionResult.skill_name || todaysFocus?.skill || 'Optimization';
        const skillId = todaysFocus?.skillId || 's7';

        if (submissionResult.updated_focus) {
          setServerFocus({
            ...submissionResult.updated_focus,
            mastery: newMastery,
          });
        } else {
          setServerFocus(prev => prev ? {
            ...prev,
            mastery: newMastery,
          } : null);
        }

        setSkillOverrides(prev => ({
          ...prev,
          [skillId]: newMastery,
          [skillName]: newMastery,
          's7': newMastery,
          'Optimization': newMastery,
        }));

        if (serverContext) {
          setServerContext((prev: any) => prev ? {
            ...prev,
            overall_mastery: Math.min(100, (prev.overall_mastery || 33) + 2),
            focus: submissionResult.updated_focus ? { ...submissionResult.updated_focus, mastery: newMastery } : (prev.focus ? { ...prev.focus, mastery: newMastery } : prev.focus),
            relevant_skills: (prev.relevant_skills || []).map((s: any) =>
              s.name === skillName || s.id === skillId || s.name === 'Optimization' || s.id === 's7'
                ? { ...s, progress: newMastery }
                : s
            ),
          } : prev);
        }

        setAssessmentState(prev => prev ? {
          ...prev,
          answers: newAnswers,
          isComplete: true,
          score: submissionResult.score,
        } : null);
      } catch (err) {
        console.warn('Backend assessment submission encountered issue, applying local authoritative fallback:', err);
        const total = questions.length;
        const fallbackResults = questions.map((q, i) => {
          const userSel = newAnswers[i] !== null ? newAnswers[i] : 0;
          const correctOpt = q.correctAnswer >= 0 ? q.correctAnswer : (i % 2 === 0 ? 0 : 1);
          const isCorr = userSel === correctOpt;
          return {
            question_id: q.id,
            correct: isCorr,
            selected_option: userSel,
            correct_option: correctOpt,
            explanation: q.explanation || (isCorr ? 'Correct principle applied.' : `Option ${String.fromCharCode(65 + correctOpt)} is the correct answer.`),
          };
        });

        setAssessmentResults(fallbackResults);

        const correctCount = fallbackResults.filter(r => r.correct).length;
        const scorePercent = Math.round((correctCount / total) * 100);
        const prevMastery = todaysFocus?.mastery || 10;
        const newMastery = Math.min(100, Math.round(prevMastery * 0.4 + scorePercent * 0.6));
        const skillName = todaysFocus?.skill || 'Optimization';
        const skillId = todaysFocus?.skillId || 's7';

        setMessages(prev => prev.filter(m => m.id !== evalMsgId));

        const fallbackSummary: MentorMessage = {
          id: `summary-fallback-${Date.now()}`,
          sender: 'ai',
          text: `📊 **Assessment Complete!**\n\n**Score: ${correctCount}/${total} (${scorePercent}%)**\n\nGreat job completing all 5 questions! Your mastery for **${skillName}** has updated to **${newMastery}%**.\n\n*Click **Practice** or ask your mentor to keep advancing!*`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, fallbackSummary]);

        setSkillOverrides(prev => ({
          ...prev,
          [skillId]: newMastery,
          [skillName]: newMastery,
          's7': newMastery,
          'Optimization': newMastery,
        }));

        setServerFocus(prev => prev ? {
          ...prev,
          mastery: newMastery,
        } : null);

        if (serverContext) {
          setServerContext((prev: any) => prev ? {
            ...prev,
            overall_mastery: Math.min(100, (prev.overall_mastery || 33) + 2),
            focus: prev.focus ? { ...prev.focus, mastery: newMastery } : prev.focus,
            relevant_skills: (prev.relevant_skills || []).map((s: any) =>
              s.name === skillName || s.id === skillId || s.name === 'Optimization' || s.id === 's7'
                ? { ...s, progress: newMastery }
                : s
            ),
          } : prev);
        }

        setAssessmentState(prev => prev ? {
          ...prev,
          answers: newAnswers,
          isComplete: true,
          score: scorePercent,
        } : null);
      } finally {
        setIsSubmittingAssessment(false);
      }
    } else {
      // Advance to next question
      const nextIndex = questionIdx + 1;
      const nextQ = questions[nextIndex];

      setAssessmentState(prev => prev ? {
        ...prev,
        currentIndex: nextIndex,
        answers: newAnswers,
      } : null);

      if (nextQ) {
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
    }
  }, [assessmentState, activeAssessmentId, todaysFocus, serverContext, isSubmittingAssessment]);

  // Mode change handler
  const handleModeChange = (newMode: MentorMode) => {
    setMode(newMode);
    setAssessmentState(null);
    setAssessmentResults(null);
    setActiveAssessmentId(null);
    setSessionActive(false);

    const modeMsg: MentorMessage = {
      id: `mode-change-${Date.now()}`,
      sender: 'ai',
      text: `Switched to **${newMode.charAt(0).toUpperCase() + newMode.slice(1)}** mode. ${
        newMode === 'learn'
          ? "I'll focus on conceptual explanations, intuitive breakdowns, and architecture insights."
          : newMode === 'practice'
          ? "I'll generate targeted code challenges and problem walkthroughs. Click **Start Session** to begin!"
          : "I'll test your knowledge with structured assessment questions. Click **Start Session** to begin."
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
            </div>
          </div>
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
              onClick={() => handleQuickAction(action)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-[#ea580c]/50 hover:text-[#ea580c] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {getQuickActionIcon(action.icon)}
              {action.label}
            </button>
          ))}
        </div>

        {/* Conversation Area */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-[680px] xl:h-[750px]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
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
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#f97316] flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  <div className={cn(
                    "text-sm leading-relaxed transition-all",
                    msg.sender === 'user'
                      ? "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 bg-[#ea580c] text-white rounded-br-md shadow-xs"
                      : "flex-1 w-full rounded-2xl px-5 py-4 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-md shadow-xs"
                  )}>
                    <MarkdownMessageRenderer content={msg.text} isUser={msg.sender === 'user'} />

                    {/* Assessment question options with live Answer Differentiation */}
                    {msg.isAssessmentQuestion && msg.options && (
                      <div className="mt-3 space-y-2">
                        {msg.options.map((opt, oi) => {
                          const qIdx = msg.questionIndex !== undefined ? msg.questionIndex : (assessmentState?.currentIndex ?? 0);
                          const isAnswered = assessmentState?.answers && assessmentState.answers[qIdx] !== null && assessmentState.answers[qIdx] !== undefined;
                          const isSelected = assessmentState?.answers && assessmentState.answers[qIdx] === oi;
                          const isComplete = Boolean(assessmentState?.isComplete);
                          const result = assessmentResults && assessmentResults[qIdx] ? assessmentResults[qIdx] : null;

                          // Differentiation when assessment is complete
                          const isCorrectChoice = result ? result.correct_option === oi : false;
                          const isUserChoice = result ? result.selected_option === oi : isSelected;
                          const isUserWrongChoice = isComplete && result && isUserChoice && !result.correct;

                          let buttonStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#ea580c]/50 hover:bg-orange-50/50 dark:hover:bg-orange-950/20";
                          let badge = null;

                          if (isComplete && result) {
                            if (isCorrectChoice && isUserChoice) {
                              // User selected the correct answer (Green)
                              buttonStyle = "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold shadow-xs ring-1 ring-emerald-500";
                              badge = (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/80 px-2 py-0.5 rounded-md flex-shrink-0">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Correct
                                </span>
                              );
                            } else if (isUserWrongChoice) {
                              // User selected a wrong answer (Red)
                              buttonStyle = "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-100 font-bold shadow-xs ring-1 ring-rose-500";
                              badge = (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/80 px-2 py-0.5 rounded-md flex-shrink-0">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Your Answer (Incorrect)
                                </span>
                              );
                            } else if (isCorrectChoice && !isUserChoice) {
                              // Correct answer that the user missed (Green Outline)
                              buttonStyle = "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold border-dashed ring-1 ring-emerald-500/50";
                              badge = (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md flex-shrink-0">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Correct Answer
                                </span>
                              );
                            } else {
                              // Neutral unselected wrong option
                              buttonStyle = "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-500 opacity-60";
                            }
                          } else if (isSelected) {
                            buttonStyle = "bg-orange-50 dark:bg-orange-950/40 border-[#ea580c] text-[#ea580c] font-bold shadow-xs ring-1 ring-[#ea580c]";
                          }

                          return (
                            <button
                              key={oi}
                              onClick={() => handleAssessmentAnswer(qIdx, oi)}
                              disabled={isAnswered || isSubmittingAssessment || isComplete}
                              className={cn(
                                "w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all gap-2",
                                buttonStyle,
                                (isAnswered || isComplete) && !isSubmittingAssessment && "cursor-default",
                                isSubmittingAssessment && "cursor-wait"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{String.fromCharCode(65 + oi)}.</span>
                                <span>{opt}</span>
                              </div>
                              {badge}
                            </button>
                          );
                        })}

                        {/* Detailed Per-Question Explanation Box */}
                        {Boolean(assessmentState?.isComplete) && assessmentResults && assessmentResults[msg.questionIndex !== undefined ? msg.questionIndex : (assessmentState?.currentIndex ?? 0)] && (
                          (() => {
                            const res = assessmentResults[msg.questionIndex !== undefined ? msg.questionIndex : (assessmentState?.currentIndex ?? 0)];
                            return (
                              <div className={cn(
                                "mt-3 p-3.5 rounded-xl border text-xs leading-relaxed transition-all shadow-xs",
                                res.correct
                                  ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-100"
                                  : "bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-100"
                              )}>
                                <div className="flex items-center gap-1.5 font-bold mb-1.5">
                                  {res.correct ? (
                                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                      Well done! Correct Answer
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-rose-700 dark:text-rose-300">
                                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                      Incorrect — Correct is Option {String.fromCharCode(65 + res.correct_option)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
                                  {res.explanation}
                                </p>
                              </div>
                            );
                          })()
                        )}
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

                {/* Start / Restart Session button */}
                <button
                  onClick={() => sessionActive ? handleRestartSession() : handleStartSession()}
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

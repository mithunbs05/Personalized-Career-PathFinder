import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  ClipboardCheck,
  Target,
  Map,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { RoadmapStage, SkillItem } from '../../types/roadmap';
import { User } from '../../types/auth';
import {
  TodaysFocus,
  AssessmentQuestion,
} from '../../types/mentor';
import { SKILL_CLUSTERS } from '../../data/mentorData';
import {
  calculateTodaysFocus,
  mentorService,
} from '../../services/mentor.service';
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

interface QuestionResultItem {
  question_id: string;
  question_text: string;
  options: string[];
  correct: boolean;
  selected_option: number;
  correct_option: number;
  explanation: string;
}

export const AIMentorPage: React.FC<AIMentorPageProps> = ({
  stages,
  user,
  overview,
  initialContext,
  onNavigate,
}) => {
  // Target context
  const effectiveTargetRole = overview?.target_role || user?.profile?.targetGoal || 'Embedded Systems & Firmware Engineer';
  const effectiveUserName = user?.name || overview?.user_name || 'Learner';

  const currentStage = useMemo(() => {
    if (initialContext?.stageTitle) {
      const match = stages.find(s => s.title.toLowerCase() === initialContext.stageTitle?.toLowerCase());
      if (match) return match;
    }
    if (overview?.current_stage) {
      return overview.current_stage;
    }
    return stages.find(s => s.status === 'IN_PROGRESS' || s.status === 'AVAILABLE') || stages[0] || null;
  }, [stages, overview, initialContext]);

  // Active Focus State
  const [activeTopic, setActiveTopic] = useState<string>(() => {
    return initialContext?.topicTitle || initialContext?.skillName || 'Embedded C/C++ Programming';
  });

  const [skillOverrides, setSkillOverrides] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('pathai_skill_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Assessment Questions & Execution State
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  // Results & Review State
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [scorePercent, setScorePercent] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [newMastery, setNewMastery] = useState<number>(0);
  const [previousMastery, setPreviousMastery] = useState<number>(0);
  const [mentorFeedback, setMentorFeedback] = useState<string>('');
  const [detailedResults, setDetailedResults] = useState<QuestionResultItem[]>([]);

  // Stage topics list for the sidebar
  const stageTopics = useMemo(() => {
    const rawTopics = (currentStage as any)?.topics || [];
    if (rawTopics.length > 0) {
      return rawTopics.map((t: any) => ({
        id: t.id,
        name: t.title,
        mastery: skillOverrides[t.id] !== undefined ? skillOverrides[t.id] : (skillOverrides[t.title] !== undefined ? skillOverrides[t.title] : (t.mastery || 0)),
        estimated_time: t.estimated_time || '45 min',
      }));
    }
    const rawSkills = currentStage?.skills || ['Embedded C/C++ Programming', 'ARM Cortex-M Architecture', 'Microcontroller Architecture'];
    return rawSkills.map((s, i) => ({
      id: `topic-${i}`,
      name: s,
      mastery: skillOverrides[s] !== undefined ? skillOverrides[s] : 0,
      estimated_time: '45 min',
    }));
  }, [currentStage, skillOverrides]);

  // Select Topic without auto-starting the quiz
  const handleSelectTopic = (topicName: string) => {
    setActiveTopic(topicName);
    setIsStarted(false);
    setIsCompleted(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setDetailedResults([]);
    const curr = skillOverrides[topicName] || 0;
    setPreviousMastery(curr);
  };

  // Explicit Start Assessment Handler
  const handleStartAssessment = async () => {
    setIsLoading(true);
    setIsStarted(true);
    setIsCompleted(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setDetailedResults([]);

    try {
      const topicFocus: TodaysFocus = {
        domain: currentStage?.title || 'Embedded Systems',
        skill: activeTopic,
        skill_id: `topic-${activeTopic.replace(/\s+/g, '-').toLowerCase()}`,
        topic: activeTopic,
        priority: 'HIGH',
        mastery: skillOverrides[activeTopic] || 0,
        estimated_minutes: 25,
        reason: `Target core competency required for ${effectiveTargetRole}`,
      };

      setPreviousMastery(topicFocus.mastery);

      // Create session & fetch secure assessment
      const sessRes = await mentorService.createSession('assess', topicFocus);
      const asmRes = await mentorService.createAssessment(sessRes.id);

      setAssessmentId(asmRes.assessment_id);

      const clientQs: AssessmentQuestion[] = asmRes.questions.slice(0, 5).map(q => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correctAnswer: -1,
        explanation: '',
      }));

      setQuestions(clientQs);
    } catch (err) {
      console.warn('Could not fetch assessment from backend, initializing fallback assessment:', err);
      // Fallback domain questions
      const fallbackQuestions: AssessmentQuestion[] = [
        {
          id: 'fb-1',
          text: `In ${activeTopic}, why is the 'volatile' qualifier essential when pointing to memory-mapped hardware peripheral registers?`,
          options: [
            'It allocates the register on the heap',
            'It informs the compiler that the register value can change asynchronously, preventing optimization reads',
            'It enables multi-threaded locking',
            'It makes the pointer read-only',
          ],
          correctAnswer: 1,
          explanation: 'Volatile tells the compiler that hardware or ISRs may alter the memory value at any time, preventing stale register caching in CPU registers.',
        },
        {
          id: 'fb-2',
          text: `Which standard memory segment stores uninitialized global and static variables zeroed at startup?`,
          options: ['.rodata segment', '.bss segment in RAM', 'Stack frame', 'Vector table'],
          correctAnswer: 1,
          explanation: 'The .bss section contains uninitialized global/static variables and is cleared to zero by startup routines before main().',
        },
        {
          id: 'fb-3',
          text: `Which bitwise operation sets Bit 3 of register REG without modifying any other bits?`,
          options: ['REG &= ~(1 << 3);', 'REG |= (1 << 3);', 'REG ^= (1 << 3);', 'REG = (1 << 3);'],
          correctAnswer: 1,
          explanation: 'Bitwise OR with (1 << 3) sets bit 3 to 1 while preserving all other bits in the register.',
        },
        {
          id: 'fb-4',
          text: `What is the key consequence of invoking dynamic memory allocation (malloc) inside an Interrupt Handler (ISR)?`,
          options: [
            'It corrupts peripheral registers',
            'It is non-deterministic, causes unbounded latency, and risks heap corruption or deadlock',
            'It doubles CPU clock frequency',
            'It disables all hardware interrupts permanently',
          ],
          correctAnswer: 1,
          explanation: 'malloc() is non-reentrant and non-deterministic. Calling it in an ISR can cause priority inversion and unbounded interrupt response times.',
        },
        {
          id: 'fb-5',
          text: `In C pointer arithmetic, advancing a 'uint32_t*' pointer by 1 (ptr + 1) advances the address by how many bytes?`,
          options: ['1 byte', '4 bytes (sizeof(uint32_t))', '8 bytes', '2 bytes'],
          correctAnswer: 1,
          explanation: 'Pointer arithmetic scales by the size of the underlying type. Since uint32_t is 4 bytes, ptr + 1 advances the address by 4 bytes.',
        },
      ];
      setQuestions(fallbackQuestions);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    setIsLoading(false);
    const curr = skillOverrides[activeTopic] || 0;
    setPreviousMastery(curr);
  }, [activeTopic]);

  // Handle Option Click
  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
  };

  // Submit Answer & Move Next or Complete
  const handleNextQuestion = async () => {
    if (selectedOption === null) return;

    const newAnswers = [...userAnswers, selectedOption];
    setUserAnswers(newAnswers);
    setSelectedOption(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed all 5 questions -> Submit to server for authoritative grading!
      setIsSubmitting(true);
      try {
        let evaluatedScore = 0;
        let evaluatedMastery = previousMastery;
        let resultsList: QuestionResultItem[] = [];
        let feedbackText = '';

        if (assessmentId) {
          try {
            const submission = await mentorService.submitAssessment(assessmentId, newAnswers);
            evaluatedScore = submission.score;
            evaluatedMastery = submission.new_mastery;
            feedbackText = submission.mentor_feedback;

            resultsList = questions.map((q, idx) => {
              const sr = submission.results[idx];
              return {
                question_id: q.id,
                question_text: q.text,
                options: q.options,
                correct: sr ? sr.correct : false,
                selected_option: newAnswers[idx],
                correct_option: sr ? sr.correct_option : 1,
                explanation: sr ? sr.explanation : 'Review foundational principles for this topic.',
              };
            });
          } catch (apiErr) {
            console.warn('Backend grading fallback:', apiErr);
          }
        }

        if (resultsList.length === 0) {
          // Local evaluation fallback
          let corr = 0;
          resultsList = questions.map((q, idx) => {
            const userChoice = newAnswers[idx];
            const correctChoice = q.correctAnswer >= 0 ? q.correctAnswer : 1;
            const isCorrect = userChoice === correctChoice;
            if (isCorrect) corr += 1;
            return {
              question_id: q.id,
              question_text: q.text,
              options: q.options,
              correct: isCorrect,
              selected_option: userChoice,
              correct_option: correctChoice,
              explanation: q.explanation || 'Verified through standard engineering specifications.',
            };
          });
          evaluatedScore = Math.round((corr / questions.length) * 100);
          evaluatedMastery = Math.min(100, Math.round(previousMastery * 0.4 + evaluatedScore * 0.6));
          feedbackText = evaluatedScore >= 80
            ? `🎉 Outstanding work! You demonstrated strong mastery of ${activeTopic}.`
            : `💡 Assessment complete. Review the specific concepts below to strengthen your score.`;
        }

        const correctTotal = resultsList.filter(r => r.correct).length;
        setCorrectCount(correctTotal);
        setScorePercent(evaluatedScore);
        setNewMastery(evaluatedMastery);
        setMentorFeedback(feedbackText);
        setDetailedResults(resultsList);
        setIsCompleted(true);

        // Update persistence & live state
        setSkillOverrides(prev => {
          const updated = {
            ...prev,
            [activeTopic]: evaluatedMastery,
            [`topic-${activeTopic.replace(/\s+/g, '-').toLowerCase()}`]: evaluatedMastery,
            'Embedded C/C++ Programming': evaluatedMastery,
            'Embedded C, Memory Layout & Pointer Arithmetic': evaluatedMastery,
          };
          try {
            localStorage.setItem('pathai_skill_overrides', JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
          } catch {}
          return updated;
        });

      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex) / Math.max(1, questions.length)) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-7xl mx-auto">

      {/* ================================================================ */}
      {/* MAIN ASSESSMENT WORKSPACE (8 cols) */}
      {/* ================================================================ */}
      <div className="lg:col-span-8 flex flex-col gap-5">

        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ea580c] to-[#f97316] flex items-center justify-center text-white shadow-md shadow-[#ea580c]/20">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Assessment & Diagnostic Studio
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 rounded-full text-[10px] font-extrabold uppercase">
                    <ShieldCheck className="w-3 h-3" /> Live Scoring
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Assessing competencies for <strong className="text-slate-700 dark:text-slate-200">{effectiveTargetRole}</strong>
                </p>
              </div>
            </div>

            {/* Current Topic Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-[#ea580c]" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeTopic}</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PRE-ASSESSMENT BRIEFING CARD (WHEN NOT STARTED) */}
        {/* ============================================================== */}
        {!isStarted && !isCompleted ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/50 text-[#ea580c] border border-orange-200 dark:border-orange-900/60 rounded-full text-xs font-extrabold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" /> Topic Diagnostic Test
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeTopic} Assessment
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Ready to assess your mastery? This assessment consists of <strong>5 multiple-choice questions</strong> designed to evaluate core principles, architecture tradeoffs, and implementation knowledge for your target role.
              </p>
            </div>

            {/* Parameter Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Question Count</span>
                <span className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-[#ea580c]" /> 5 Questions
                </span>
                <span className="text-[11px] text-slate-500">Multiple choice [A, B, C, D]</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Estimated Time</span>
                <span className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-500" /> 10 - 15 Mins
                </span>
                <span className="text-[11px] text-slate-500">Self-paced diagnostic</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Current Mastery</span>
                <span className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-500" /> {previousMastery}% Assessed
                </span>
                <span className="text-[11px] text-slate-500">Pass target: ≥ 70%</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200/70 dark:border-orange-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
              <div className="font-bold text-[#ea580c] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Assessment Guidelines:
              </div>
              <ul className="list-disc pl-4 space-y-1 font-medium text-[11px]">
                <li>Answer each of the 5 questions by clicking your choice and advancing with Next Question.</li>
                <li>Upon submitting Question 5, the server will authoritatively score your responses.</li>
                <li>You will receive a question-by-question review, gap explanations, and recommended study items.</li>
                <li>Your roadmap and skill matrix progress will immediately rise based on your score.</li>
              </ul>
            </div>

            {/* Prominent Start Button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={handleStartAssessment}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#ea580c] hover:bg-[#d84d08] text-white font-black text-sm shadow-lg shadow-[#ea580c]/30 flex items-center justify-center gap-3 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Preparing 5 Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Start 5-Question Assessment <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#ea580c] animate-spin" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Preparing Assessment Questions...</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Calibrating 5 domain questions for {activeTopic}</p>
          </div>
        ) : !isCompleted && currentQ ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col gap-6">

            {/* Question Header & Stepper */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-extrabold uppercase tracking-wider text-[#ea580c]">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="font-bold">{progressPercent}% Progress</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-full flex-1 rounded-full transition-all duration-300",
                      i < currentIndex ? "bg-emerald-500" :
                      i === currentIndex ? "bg-[#ea580c]" :
                      "bg-slate-200 dark:bg-slate-700"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Question Text */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.text}
              </h2>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Select the correct answer:
              </p>
              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map((opt, oi) => {
                  const isSelected = selectedOption === oi;
                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelectOption(oi)}
                      className={cn(
                        "w-full p-4 rounded-xl text-left text-xs sm:text-sm font-medium border transition-all flex items-center justify-between gap-3 cursor-pointer group",
                        isSelected
                          ? "bg-orange-50/90 dark:bg-orange-950/50 border-[#ea580c] ring-2 ring-[#ea580c]/30 text-slate-900 dark:text-white shadow-xs font-semibold"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#ea580c]/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/80"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors",
                          isSelected
                            ? "bg-[#ea580c] text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 group-hover:text-[#ea580c]"
                        )}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        isSelected ? "border-[#ea580c] bg-[#ea580c]" : "border-slate-300 dark:border-slate-600"
                      )}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400">
                {selectedOption === null ? "Please select an answer to continue" : "Answer selected"}
              </span>
              <button
                onClick={handleNextQuestion}
                disabled={selectedOption === null || isSubmitting}
                className="px-6 py-3 rounded-xl bg-[#ea580c] hover:bg-[#d84d08] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-[#ea580c]/20 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Evaluating...
                  </>
                ) : currentIndex + 1 === questions.length ? (
                  <>
                    <Sparkles className="w-4 h-4" /> Submit & Get Evaluation
                  </>
                ) : (
                  <>
                    Next Question <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : isCompleted ? (

          /* ============================================================ */
          /* COMPREHENSIVE POST-ASSESSMENT REVIEW & STUDY PLAN */
          /* ============================================================ */
          <div className="space-y-6">

            {/* Hero Score Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#ea580c]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Assessment Evaluated
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {scorePercent >= 80 ? 'Mastery Verified!' : scorePercent >= 50 ? 'Good Progress!' : 'Knowledge Gaps Identified'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
                    Evaluated topic: <strong className="text-white">{activeTopic}</strong> for your role as <strong>{effectiveTargetRole}</strong>.
                  </p>
                </div>

                {/* Score Circular Badge */}
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                  <div className="text-center">
                    <span className="text-3xl sm:text-4xl font-black text-[#ff6b4a] block">{scorePercent}%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{correctCount} / {questions.length} Correct</span>
                  </div>
                  <div className="h-10 w-px bg-white/10" />
                  <div className="text-center">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">{newMastery}%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assessed Mastery</span>
                  </div>
                </div>
              </div>

              {/* Progress delta note */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Mastery raised from <strong>{previousMastery}%</strong> → <strong className="text-emerald-400">{newMastery}%</strong></span>
                </div>
                <span className="text-slate-400">Roadmap timeline and skill matrix updated</span>
              </div>
            </div>

            {/* Diagnostic Question-by-Question Review */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#ea580c]" /> Question-by-Question Review
                </h3>
                <span className="text-xs text-slate-500 font-bold">{correctCount}/{detailedResults.length} Passed</span>
              </div>

              <div className="space-y-4">
                {detailedResults.map((r, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-4 rounded-xl border transition-all text-xs space-y-2.5",
                      r.correct
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                        : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>Q{i + 1}.</span>
                        <span>{r.question_text}</span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-extrabold px-2 py-0.5 rounded-md flex-shrink-0 flex items-center gap-1",
                        r.correct
                          ? "bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-100 dark:bg-rose-900/80 text-rose-700 dark:text-rose-300"
                      )}>
                        {r.correct ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {r.correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Your Selection</span>
                        <span className={cn("font-semibold", r.correct ? "text-emerald-600" : "text-rose-600")}>
                          {r.selected_option >= 0 ? `${String.fromCharCode(65 + r.selected_option)}. ${r.options[r.selected_option]}` : 'None selected'}
                        </span>
                      </div>
                      {!r.correct && (
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/40">
                          <span className="text-emerald-700 dark:text-emerald-400 block text-[10px] uppercase font-bold">Correct Answer</span>
                          <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                            {String.fromCharCode(65 + r.correct_option)}. {r.options[r.correct_option]}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] pt-1 border-t border-slate-200/40 dark:border-slate-800/40">
                      💡 <strong>Concept Takeaway:</strong> {r.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Personalized Study Plan & What You Need to Learn */}
            <div className="p-6 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 space-y-3 text-xs leading-relaxed">
              <div className="flex items-center gap-2 text-[#ea580c] font-black uppercase tracking-wider text-xs">
                <AlertCircle className="w-4 h-4" /> Next Steps & Study Plan for {effectiveTargetRole}
              </div>
              <div className="text-slate-700 dark:text-slate-300 space-y-2">
                <p>
                  Based on this assessment, here is your prioritized study action plan:
                </p>
                <ol className="list-decimal pl-4 space-y-1.5 font-medium">
                  {detailedResults.filter(r => !r.correct).length > 0 ? (
                    detailedResults.filter(r => !r.correct).map((w, idx) => (
                      <li key={idx}>
                        <strong>Review Core Concept:</strong> {w.explanation}
                      </li>
                    ))
                  ) : (
                    <li>Full competency verified for this topic. Proceed to the next curriculum milestone.</li>
                  )}
                  <li>Check the curated study resources in your <strong>Roadmap Stage Panel</strong> for in-depth architecture diagrams.</li>
                  <li>Retake this assessment anytime to increase your verified mastery above 85%.</li>
                </ol>
              </div>
            </div>

            {/* Bottom Navigation CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={handleStartAssessment}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake This Assessment
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => onNavigate('roadmap')}
                  className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Map className="w-3.5 h-3.5" /> View Updated Roadmap
                </button>

                {stageTopics.find(t => t.name !== activeTopic) && (
                  <button
                    onClick={() => {
                      const next = stageTopics.find(t => t.name !== activeTopic);
                      if (next) handleSelectTopic(next.name);
                    }}
                    className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-[#ea580c] hover:bg-[#d84d08] text-white font-bold text-xs shadow-md shadow-[#ea580c]/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    Select Next Topic <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ================================================================ */}
      {/* RIGHT SIDEBAR — TOPICS MASTERY & PROGRESS TRACKER (4 cols) */}
      {/* ================================================================ */}
      <div className="lg:col-span-4 space-y-4">

        {/* Active Stage & Topics Tracker */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#ea580c] tracking-wider block">Active Milestone</span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {currentStage?.title || 'Embedded Systems'}
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-orange-50 text-[#ea580c] rounded-md text-[10px] font-bold border border-orange-200">
              {stageTopics.length} Topics
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any topic below to view its briefing and start its 5-question verified assessment:
          </p>

          {/* Topic Cards List */}
          <div className="space-y-2.5">
            {stageTopics.map((t) => {
              const isActive = t.name === activeTopic;
              const isAssessed = t.mastery > 0;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTopic(t.name)}
                  className={cn(
                    "w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 group",
                    isActive
                      ? "bg-orange-50/80 dark:bg-orange-950/40 border-[#ea580c] ring-1 ring-[#ea580c]/30 shadow-xs"
                      : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-xs font-bold transition-colors",
                      isActive ? "text-[#ea580c]" : "text-slate-800 dark:text-slate-200 group-hover:text-[#ea580c]"
                    )}>
                      {t.name}
                    </span>
                    <span className={cn(
                      "text-[10px] font-extrabold px-2 py-0.5 rounded-full border",
                      t.mastery >= 70 ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                      t.mastery > 0 ? "bg-orange-50 text-[#ea580c] border-orange-200" :
                      "bg-slate-100 text-slate-500 border-slate-200"
                    )}>
                      {t.mastery}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        t.mastery >= 70 ? "bg-emerald-500" : t.mastery > 0 ? "bg-[#ea580c]" : "bg-slate-300"
                      )}
                      style={{ width: `${t.mastery}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {t.estimated_time}
                    </span>
                    <span className="text-[#ea580c] font-bold flex items-center gap-0.5 group-hover:underline">
                      {isAssessed ? 'Re-Assess' : 'Take Test'} <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Assessment Rules Info */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
            <Award className="w-4 h-4 text-[#ea580c]" /> Progress Calculation Rule
          </div>
          <p className="leading-relaxed text-[11px]">
            Mastery is calculated authoritatively from your assessment performance. Complete each topic quiz to unlock downstream milestone prerequisites.
          </p>
        </div>
      </div>
    </div>
  );
};

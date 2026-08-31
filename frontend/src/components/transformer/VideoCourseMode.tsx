import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  Send,
  ArrowRight
} from 'lucide-react';
import { TransformerModule, LearnerProgress } from './transformerData';
import { useAIInstructor } from '../../hooks/useAIInstructor';
import { useLessonChat } from '../../hooks/useLessonChat';
import { useYoutubeVideo } from '../../hooks/useYoutubeVideo';
import { YoutubeVideoPlayer } from './YoutubeVideoPlayer';

interface VideoCourseModeProps {
  module: TransformerModule;
  progress: LearnerProgress;
  onProgressUpdate: (update: Partial<LearnerProgress>) => void;
  onSwitchToCoding: () => void;
}

export const VideoCourseMode: React.FC<VideoCourseModeProps> = ({
  module,
  progress,
  onProgressUpdate,
  onSwitchToCoding,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'narration' | 'code' | 'flow' | 'takeaways'>('narration');
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState(0);
  const [chatInput, setChatInput] = useState('');

  // Real backend hook for AI-selected educational YouTube video
  const {
    video: ytVideo,
    isLoading: isYtLoading,
    isRefreshing: isYtRefreshing,
    refreshNotice: ytRefreshNotice,
    error: ytError,
    refetch: refetchYt,
    refreshVideo: handleRefreshYt,
    syncWatchProgress
  } = useYoutubeVideo(module.id);

  // Real backend hook for AI Instructor (Transcripts, Narration, CodeDemo, VisualFlow, Takeaways, Insight)
  const { content, transcripts, insight } = useAIInstructor(module.id);

  // Real backend hook for Lesson Chat (Context-aware Q&A)
  const { messages, isThinking, sendMessage } = useLessonChat(module.id);

  // Derive dynamic timeline from backend transcripts or module chapters
  const timelineItems = transcripts.length > 0
    ? transcripts.map(t => ({
        time: t.timestamp,
        seconds: t.seconds || 15,
        concept: t.concept,
        text: t.content
      }))
    : module.chapters && module.chapters.length > 0
      ? module.chapters.map((ch, idx) => ({
          time: `0${Math.floor(ch.startTime / 60)}:${(ch.startTime % 60).toString().padStart(2, '0')}`,
          seconds: ch.startTime || 15,
          concept: ch.title,
          text: ch.transcript
        }))
      : (module.objectives || []).map((obj, idx) => ({
          time: `0${idx * 3}:00`,
          seconds: idx * 180,
          concept: `Concept ${idx + 1}`,
          text: obj
        }));

  const handleTimelineClick = (idx: number, seconds: number) => {
    setSelectedTimelineIndex(idx);
    syncWatchProgress(seconds, ytVideo?.durationSeconds || 720);
    onProgressUpdate({
      videoTimePosition: seconds
    });
  };

  const handleCopyCode = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isThinking) return;
    const query = chatInput.trim();
    setChatInput('');
    sendMessage(query);
  };

  const codeDemoSnippet = content?.codeDemo?.[0]?.code || module.chapters?.[0]?.codeDemo || module.challenge?.starterCode || `// Interactive Demo for ${module.title}\n// Follow along with the video lesson and challenge.`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      {/* Left Column (~58%): Real Embedded Educational YouTube Player */}
      <div className="lg:col-span-7 space-y-3.5">
        <YoutubeVideoPlayer
          video={ytVideo}
          isLoading={isYtLoading}
          isRefreshing={isYtRefreshing}
          refreshNotice={ytRefreshNotice}
          error={ytError}
          onRefresh={handleRefreshYt}
          onRetry={refetchYt}
          moduleTitle={module.title}
        />
      </div>

      {/* Right Column (~42%): AI Instructor Panel */}
      <div className="lg:col-span-5 space-y-3">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col min-h-[520px]">
          
          {/* AI Instructor Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#8B7CFF]" />
              <span>AI Instructor</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              Generated from this lesson
            </span>
          </div>

          {/* Subtle Clean Tabs */}
          <div className="flex items-center gap-4 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-medium">
            {[
              { id: 'narration', label: 'Narration' },
              { id: 'code', label: 'Code Demo' },
              { id: 'flow', label: 'Visual Flow' },
              { id: 'takeaways', label: 'Takeaways' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-1.5 transition-colors cursor-pointer border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#FF5A3D] text-slate-900 dark:text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: AI Vertical Timeline (Connected by thin line) */}
          {activeTab === 'narration' && (
            <div className="flex-1 py-3 overflow-y-auto max-h-[300px] space-y-0 relative">
              <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200 dark:before:bg-slate-800">
                {timelineItems.map((item, idx) => {
                  const isActive = idx === selectedTimelineIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleTimelineClick(idx, item.seconds)}
                      className={`relative cursor-pointer transition-all p-2.5 rounded-xl ${
                        isActive
                          ? 'bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {/* Timeline Dot */}
                      <span
                        className={`absolute -left-[17px] top-4 w-2 h-2 rounded-full ring-3 ring-white dark:ring-slate-900 ${
                          isActive ? 'bg-[#FF5A3D]' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      />

                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className={isActive ? 'font-bold text-[#FF5A3D]' : 'text-slate-400'}>
                          ● {item.time} {item.concept ? `— ${item.concept}` : ''}
                        </span>
                      </div>

                      <p className={`text-xs leading-relaxed ${isActive ? 'font-medium text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Live Code Demonstration */}
          {activeTab === 'code' && (
            <div className="flex-1 py-3 flex flex-col space-y-2">
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>Python Demonstration</span>
                <button
                  onClick={() => handleCopyCode(codeDemoSnippet)}
                  className="flex items-center gap-1 hover:text-[#FF5A3D] cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-[#16B981]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="bg-[#0B0D0F] border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre flex-1">
                <code>{codeDemoSnippet}</code>
              </pre>
            </div>
          )}

          {/* Tab 3: Visual Concept Flow */}
          {activeTab === 'flow' && (
            <div className="flex-1 py-3 space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2 font-mono text-[11px]">
                {(content?.visualFlow || [
                  { step: 1, title: "Initialize Accumulator", detail: "Set total = 0 before entering loop" },
                  { step: 2, title: "Traverse Sequence", detail: "Fetch next integer from numbers iterable" },
                  { step: 3, title: "Modulo Evaluation", detail: "Evaluate num % 2 == 0 predicate" },
                  { step: 4, title: "Accumulate or Skip", detail: "If True: total += num; Else: continue" },
                  { step: 5, title: "Return Result", detail: "Yield final integer sum after traversal" }
                ]).map((step, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <div className="text-slate-400 pl-2">↓</div>}
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold">
                        {step.step || idx + 1}
                      </span>
                      <span>{step.title}: <code>{step.detail}</code></span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Key Takeaways */}
          {activeTab === 'takeaways' && (
            <div className="flex-1 py-3 space-y-2 text-xs">
              {(content?.takeaways || module.keyTakeaways.map(k => ({ point: k, highlight: 'Rule' }))).map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                  <span className="text-[#FF5A3D] font-bold">•</span>
                  <span>{item.point}</span>
                </div>
              ))}
            </div>
          )}

          {/* Inline AI Insight (Grounded in Real Backend Performance) */}
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-[#8B7CFF]">
                <Sparkles className="w-3 h-3" />
                <span>✦ AI Insight</span>
              </span>
              <button
                onClick={onSwitchToCoding}
                className="text-[11px] font-medium text-[#FF5A3D] hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>{insight?.recommendedAction || 'Try one guided challenge'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              {insight?.insightText || `Your concept understanding is strong (${progress.conceptScore}%), with ${progress.testsPassed}/${progress.totalTests} tests passing.`}
            </p>
          </div>

          {/* Real AI Chat Input connected to POST /api/ai/lesson-chat */}
          <div className="pt-2 space-y-1">
            {messages.length > 0 && (
              <div className="max-h-28 overflow-y-auto space-y-1.5 pb-1 text-[11px]">
                {messages.slice(-3).map((msg) => (
                  <div key={msg.id} className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'bg-purple-50/60 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200'}`}>
                    <span className="font-semibold">{msg.sender === 'user' ? 'You: ' : 'AI: '}</span>
                    {msg.text}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendChat} className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isThinking ? "AI Instructor is thinking..." : "Ask AI about this lesson..."}
                disabled={isThinking}
                className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#8B7CFF]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isThinking}
                className="p-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 rounded-lg transition-opacity disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <p className="text-[10px] text-slate-400 text-center font-normal">
              AI Teaching Assistant grounded in this lesson's concepts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

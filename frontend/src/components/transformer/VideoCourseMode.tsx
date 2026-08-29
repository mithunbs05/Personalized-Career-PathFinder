import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Code2,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  Send,
  GitFork,
  ArrowRight
} from 'lucide-react';
import { TransformerModule, LearnerProgress } from './transformerData';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(progress.videoTimePosition || 540); // 09:00 default
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'narration' | 'code' | 'flow' | 'takeaways'>('narration');
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState(3);
  const [chatInput, setChatInput] = useState('');
  const [chatReplies, setChatReplies] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([]);
  const [isAiReplying, setIsAiReplying] = useState(false);

  const totalDuration = 720; // 12 mins in seconds

  const timelineItems = [
    {
      time: '00:15',
      seconds: 15,
      text: 'Welcome to this module on Python loops. Unlike traditional C-style loops with counter increments, Python treats loops as first-class sequence traversals.'
    },
    {
      time: '02:30',
      seconds: 150,
      text: "When filtering data during iteration, we test each item against a predicate. For instance, testing for even numbers using 'num % 2 == 0'."
    },
    {
      time: '05:50',
      seconds: 350,
      text: 'Notice the accumulator pattern: initialize your result sum before entering the loop, then accumulate only matching values.'
    },
    {
      time: '09:00',
      seconds: 540,
      text: "Now, let's transition straight into the interactive coding challenge to write this logic and verify all edge cases!"
    }
  ];

  // Video playback tick
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          const next = Math.min(prev + playbackSpeed, totalDuration);
          if (next >= totalDuration) setIsPlaying(false);

          for (let i = timelineItems.length - 1; i >= 0; i--) {
            if (next >= timelineItems[i].seconds) {
              setSelectedTimelineIndex(i);
              break;
            }
          }

          const watchPct = Math.min(100, Math.round((next / totalDuration) * 100));
          onProgressUpdate({
            videoTimePosition: next,
            videoWatchedPercent: watchPct,
            conceptScore: watchPct
          });

          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, onProgressUpdate]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    for (let i = timelineItems.length - 1; i >= 0; i--) {
      if (val >= timelineItems[i].seconds) {
        setSelectedTimelineIndex(i);
        break;
      }
    }
  };

  const handleTimelineClick = (idx: number, seconds: number) => {
    setCurrentTime(seconds);
    setSelectedTimelineIndex(idx);
    setIsPlaying(true);
  };

  const handleCopyCode = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiReplying) return;

    const query = chatInput.trim();
    setChatInput('');
    setChatReplies((prev) => [...prev, { sender: 'user', text: query }]);
    setIsAiReplying(true);

    fetch('/api/transformer/ai-help', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        moduleTitle: module.title,
        challengeTitle: module.challenge.title
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setChatReplies((prev) => [...prev, { sender: 'ai', text: data.reply || data.text }]);
      })
      .catch(() => {
        setChatReplies((prev) => [
          ...prev,
          { sender: 'ai', text: 'In Python, loops iterate directly over elements. You can filter with `if item % 2 == 0:` before accumulating.' }
        ]);
      })
      .finally(() => setIsAiReplying(false));
  };

  const codeSnippet = `# Python Loop & Even Accumulator Pattern
def sum_even_numbers(numbers):
    """Iterates through numbers, checks for parity, and accumulates evens."""
    total = 0
    for num in numbers:
        if num % 2 == 0:
            total += num
    return total

# Example: [1, 2, 3, 4, 5, 6] -> 12`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      {/* Left Column (~58%): Minimal Dark Video Player */}
      <div className="lg:col-span-7 space-y-3.5">
        
        {/* Dark Video Player Card (#0B0D0F background) */}
        <div className="bg-[#0B0D0F] rounded-2xl overflow-hidden border border-slate-800 shadow-sm relative flex flex-col">
          
          {/* Top Bar inside Video */}
          <div className="px-4 py-3 flex items-center justify-between text-[11px] text-slate-400 bg-black/40 border-b border-slate-800/60 z-20">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16B981]"></span>
              <span className="font-medium text-slate-300">Interactive Lesson</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px]">Chapter 4 of 4</span>
          </div>

          {/* Video Viewport Canvas */}
          <div className="relative aspect-video bg-[#0B0D0F] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
            
            {/* Minimal Center Card */}
            <div className="relative z-10 space-y-2.5 max-w-sm">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#FF5A3D]">
                Summary & Transition
              </span>
              
              <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                Python Loops & Iteration Mechanics
              </h3>

              {/* Minimal Center Play Button with subtle gradient accent */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF5A3D] to-[#8B7CFF] hover:opacity-90 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-white" />}
                </button>
              </div>
            </div>
          </div>

          {/* Minimal Controls Bar */}
          <div className="px-4 py-3 bg-[#0B0D0F] border-t border-slate-800/80 space-y-2">
            
            {/* Scrubber */}
            <input
              type="range"
              min={0}
              max={totalDuration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-[#FF5A3D]"
              style={{
                background: `linear-gradient(to right, #FF5A3D ${(currentTime / totalDuration) * 100}%, #1E293B ${(currentTime / totalDuration) * 100}%)`
              }}
            />

            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>

                <button
                  onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                  className="hover:text-white transition-colors cursor-pointer"
                  title="Rewind 10s"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>

                <span className="font-mono text-[10px] text-slate-400">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Speed selector */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md text-[10px] font-mono text-slate-400">
                  {[1, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded-xs transition-colors ${playbackSpeed === spd ? 'text-[#FF5A3D] font-bold' : 'hover:text-white'}`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Meta Details Below Video (No oversized card) */}
        <div className="px-1 py-1 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              Deep Dive: Python Loops & Iteration Mechanics
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span>12 min lesson</span>
              <span>•</span>
              <span>✓ Completed</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
            In Python, for-loops iterate through sequence items directly. Master accumulator variables, boolean parity checks, and list comprehension mechanics.
          </p>
        </div>
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
                          ● {item.time}
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
                  onClick={() => handleCopyCode(codeSnippet)}
                  className="flex items-center gap-1 hover:text-[#FF5A3D] cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-[#16B981]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="bg-[#0B0D0F] border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre flex-1">
                <code>{codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Tab 3: Visual Concept Flow */}
          {activeTab === 'flow' && (
            <div className="flex-1 py-3 space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold">1</span>
                  <span>Initialize <code>total = 0</code></span>
                </div>
                <div className="text-slate-400 pl-2">↓</div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold">2</span>
                  <span>Iterate <code>for num in numbers:</code></span>
                </div>
                <div className="text-slate-400 pl-2">↓</div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold">3</span>
                  <span>Check <code>if num % 2 == 0:</code></span>
                </div>
                <div className="text-slate-400 pl-2">↓ (True)</div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[9px]">4</span>
                  <span>Add <code>total += num</code></span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Key Takeaways */}
          {activeTab === 'takeaways' && (
            <div className="flex-1 py-3 space-y-2 text-xs">
              {module.keyTakeaways.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                  <span className="text-[#FF5A3D] font-bold">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Inline AI Insight (Small & Clean) */}
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
                <span>Try one guided challenge</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Your concept understanding is strong (77%), but your coding accuracy needs more practice.
            </p>
          </div>

          {/* AI Chat Input at bottom */}
          <div className="pt-2 space-y-1">
            {chatReplies.length > 0 && (
              <div className="max-h-24 overflow-y-auto space-y-1.5 pb-1 text-[11px]">
                {chatReplies.slice(-2).map((msg, i) => (
                  <div key={i} className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'bg-purple-50/60 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200'}`}>
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
                placeholder="Ask AI about this lesson..."
                className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#8B7CFF]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAiReplying}
                className="p-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 rounded-lg transition-opacity disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <p className="text-[10px] text-slate-400 text-center font-normal">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

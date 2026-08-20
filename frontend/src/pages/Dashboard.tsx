import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  GitCommit,
  Lock,
  ArrowRight,
  Send,
  Bot,
  User,
  LogOut,
  Award,
  Play,
  RotateCcw,
  Code,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roadmapService } from '../services/roadmap.service';
import { LearningRoadmap, RoadmapNode } from '../types/roadmap';
import confetti from 'canvas-confetti';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'skills' | 'mentor' | 'practice'>('roadmap');

  // AI Mentor Chat in Dashboard
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello ${user?.name?.split(' ')[0] || 'Learner'}! I am monitoring your progress on the "${user?.profile?.targetGoal || 'AI/ML Engineer'}" track. You are currently mastering Deep Learning Foundations. How can I assist you today?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);

  // Active coding lab / quiz state
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const data = await roadmapService.getRoadmap();
      setRoadmap(data);
      // Flatten nodes from all stages
      const allNodes = data.stages.flatMap((s) => s.nodes);
      const current = allNodes.find((n) => n.status === 'current') || allNodes[0];
      setSelectedNode(current);
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsAiReplying(true);

    try {
      const response = await roadmapService.askAIMentor(userText, {
        targetGoal: user?.profile?.targetGoal || 'AI Engineer',
        currentMilestone: selectedNode?.title || 'Deep Learning Foundations',
      });
      setChatMessages((prev) => [...prev, { sender: 'ai', text: response.reply }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Here is the architectural breakdown for ${userText}: When implementing production pipelines, prioritize deterministic token evaluation, robust exception handlers, and vector distance thresholding.`,
        },
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const handleCompleteCurrentNode = async () => {
    if (!selectedNode || !roadmap) return;

    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FF4D31', '#7A8B7C', '#1A1A1A'],
    });

    try {
      if (selectedNode.lessons && selectedNode.lessons.length > 0) {
        for (const lesson of selectedNode.lessons) {
          await roadmapService.updateLesson(selectedNode.id, lesson.id, true);
        }
      }
      await loadRoadmap();
    } catch (err) {
      console.error('Update node error:', err);
    }
  };

  const allNodes = roadmap ? roadmap.stages.flatMap((s) => s.nodes) : [];

  return (
    <div className="min-h-screen bg-[#F9F8F3] dark:bg-[#121211] text-[#1A1A1A] dark:text-[#F9F8F3] flex flex-col transition-colors duration-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#1A1A18]/90 backdrop-blur-md border-b border-[#E8E6DE] dark:border-[#2C2C29] px-6 lg:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#FF4D31] flex items-center justify-center text-white shadow-md shadow-[#FF4D31]/20">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg">
            Path<span className="text-[#FF4D31]">AI</span>
          </span>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase">
            <span>●</span>
            <span>{user?.profile?.targetGoal || 'AI/ML Engineer'}</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="hidden md:flex items-center gap-1 bg-[#F1EFE7] dark:bg-[#252522] p-1 rounded-full text-xs font-semibold">
          {[
            { id: 'roadmap', label: 'Roadmap Timeline' },
            { id: 'skills', label: 'Skill Matrix' },
            { id: 'mentor', label: 'AI Mentor' },
            { id: 'practice', label: 'Active Labs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#1A1A18] text-[#1A1A1A] dark:text-white shadow-xs font-bold'
                  : 'text-[#4A4A4A] dark:text-[#A0A09B] hover:text-[#1A1A1A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#4A4A4A] dark:text-[#A0A09B] hover:text-[#FF4D31] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Section */}
        <div className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F1EFE7] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase mb-2">
              ✦ LEARNER COCKPIT
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">
              Welcome back, {user?.name || 'Alex Rivera'}!
            </h1>
            <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#A0A09B] mt-1">
              Goal: <strong className="text-[#1A1A1A] dark:text-white">{user?.profile?.targetGoal || 'AI/ML Engineer'}</strong> • Target Pace: {user?.profile?.weeklyHours || 15} hrs/week
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 bg-[#F9F8F3] dark:bg-[#121211] px-4 py-2.5 rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29]">
              <Flame className="w-5 h-5 text-[#FF4D31]" />
              <div className="text-xs">
                <span className="font-bold block text-sm">14 Days</span>
                <span className="text-[#7A8B7C] text-[10px] uppercase font-bold">Streak</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#F9F8F3] dark:bg-[#121211] px-4 py-2.5 rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29]">
              <Clock className="w-5 h-5 text-[#7A8B7C]" />
              <div className="text-xs">
                <span className="font-bold block text-sm">28.5 hrs</span>
                <span className="text-[#7A8B7C] text-[10px] uppercase font-bold">Logged</span>
              </div>
            </div>

            {/* Mastery Ring */}
            <div className="flex items-center gap-3 bg-[#F9F8F3] dark:bg-[#121211] px-4 py-2.5 rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29]">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" className="text-[#E8E6DE] dark:text-[#2C2C29]" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="14" fill="none" stroke="#FF4D31" strokeWidth="3"
                    strokeDasharray="88" strokeDashoffset={88 - (88 * (roadmap?.overallProgress || 68)) / 100}
                    strokeLinecap="round"
                    className="animate-mastery-ring"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#1A1A1A] dark:text-white">
                  {roadmap?.overallProgress || 68}%
                </span>
              </div>
              <div className="text-xs">
                <span className="font-bold block text-sm">Mastery</span>
                <span className="text-[#7A8B7C] text-[10px] uppercase font-bold">Overall</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 1: Roadmap Timeline View */}
        {activeTab === 'roadmap' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Timeline Column (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
                <div>
                  <h3 className="font-display font-bold text-lg">Adaptive Curriculum Timeline</h3>
                  <span className="text-xs text-[#7A8B7C]">Dynamic sequencing guided by PathAI</span>
                </div>
                <button
                  onClick={loadRoadmap}
                  className="p-2 rounded-xl bg-[#F1EFE7] dark:bg-[#252522] text-[#4A4A4A] dark:text-[#A0A09B] hover:text-[#FF4D31] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Refresh Nodes</span>
                </button>
              </div>

              <div className="space-y-4">
                {allNodes.map((node, index) => {
                  const isSelected = selectedNode?.id === node.id;
                  const isCompleted = node.status === 'completed';
                  const isCurrent = node.status === 'current';
                  const isLocked = node.status === 'locked';

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#F9F8F3] dark:bg-[#252522] border-[#FF4D31] shadow-sm ring-1 ring-[#FF4D31]'
                          : 'bg-white dark:bg-[#1A1A18] border-[#E8E6DE] dark:border-[#2C2C29] hover:border-[#7A8B7C]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCompleted
                              ? 'bg-[#7A8B7C] text-white'
                              : isCurrent
                              ? 'bg-[#FF4D31] text-white shadow-md shadow-[#FF4D31]/30 animate-pulse'
                              : isLocked
                              ? 'bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]'
                              : 'bg-[#F1EFE7] dark:bg-[#252522] text-[#4A4A4A] dark:text-white'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isCurrent ? (
                            <GitCommit className="w-4 h-4" />
                          ) : isLocked ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold">{node.title}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]">
                              {node.durationWeeks}w
                            </span>
                          </div>
                          <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] mt-0.5">
                            {node.skillsGained.slice(0, 3).join(' • ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            isCompleted
                              ? 'bg-[#7A8B7C]/15 text-[#7A8B7C]'
                              : isCurrent
                              ? 'bg-[#FF4D31]/15 text-[#FF4D31]'
                              : 'bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]'
                          }`}
                        >
                          {node.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#7A8B7C]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Node Inspector Drawer (5 cols) */}
            <div className="lg:col-span-5 sticky top-24">
              {selectedNode && (
                <div className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-lg space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D31]">
                      CURRENT NODE INSPECTOR
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]">
                      {selectedNode.durationWeeks} Weeks Est.
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-display font-bold mb-2">
                      {selectedNode.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">
                      {selectedNode.description}
                    </p>
                  </div>

                  {/* Skills tags */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B7C] block mb-2">
                      Target Skills Acquired
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.skillsGained.map((s) => (
                        <span
                          key={s}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F1EFE7] dark:bg-[#252522] text-[#1A1A1A] dark:text-white"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hands-on Deliverable */}
                  {selectedNode.milestoneTitle && (
                    <div className="p-4 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29]">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#FF4D31] mb-1">
                        <Award className="w-4 h-4" />
                        <span>Capstone Deliverable:</span>
                      </div>
                      <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
                        {selectedNode.milestoneTitle}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => setIsLabOpen(true)}
                      className="w-full py-3 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-sm shadow-md shadow-[#FF4D31]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Launch Interactive Practice Lab</span>
                    </button>

                    {selectedNode.status !== 'completed' && (
                      <button
                        onClick={handleCompleteCurrentNode}
                        className="w-full py-2.5 rounded-full border border-[#7A8B7C] text-[#7A8B7C] hover:bg-[#7A8B7C] hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Milestone Completed</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Skill Competency Matrix */}
        {activeTab === 'skills' && (
          <div className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-10 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D31] block mb-1">
                  SKILL COMPETENCY MATRIX
                </span>
                <h3 className="text-2xl font-display font-bold">Verified Proficiency Telemetry</h3>
              </div>
              <div className="text-xs font-semibold text-[#7A8B7C] bg-[#F1EFE7] dark:bg-[#252522] px-4 py-2 rounded-full">
                Target Benchmark: 85% for Placement
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(roadmap?.competencies || [
                { name: 'Python', score: 90, color: '#FF4D31' },
                { name: 'Machine Learning', score: 78, color: '#7A8B7C' },
                { name: 'Generative AI', score: 62, color: '#FF4D31' },
                { name: 'System Design', score: 41, color: '#7A8B7C' },
              ]).map((s) => (
                <div
                  key={s.name}
                  className="p-5 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{s.name}</span>
                    <span className="text-xs font-black text-[#1A1A1A] dark:text-white">{s.score}%</span>
                  </div>

                  <div className="w-full bg-[#E8E6DE] dark:bg-[#1A1A18] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${s.score}%`, backgroundColor: s.color || '#FF4D31' }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7A8B7C]">
                    <span>Status: {s.score >= 80 ? 'Mastered' : s.score >= 60 ? 'Developing' : 'Upcoming'}</span>
                    <span className="font-semibold">{s.score >= 80 ? '✓ Verified' : '● In Training'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: AI Learning Mentor */}
        {activeTab === 'mentor' && (
          <div className="bg-white dark:bg-[#1A1A18] rounded-3xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-md overflow-hidden max-w-4xl mx-auto">
            <div className="px-6 py-4 bg-[#F1EFE7] dark:bg-[#252522] border-b border-[#E8E6DE] dark:border-[#2C2C29] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF4D31] text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">PathAI Context-Aware Mentor</h4>
                  <span className="text-[11px] text-[#7A8B7C]">Connected to active curriculum state</span>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#7A8B7C]/15 text-[#7A8B7C]">
                Ready
              </span>
            </div>

            <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-[#FF4D31] text-white flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-lg rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A]'
                        : 'bg-[#F9F8F3] dark:bg-[#252522] text-[#1A1A1A] dark:text-[#F9F8F3] border border-[#E8E6DE] dark:border-[#2C2C29]'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-[#7A8B7C] text-white flex items-center justify-center shrink-0 mt-1">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isAiReplying && (
                <div className="flex items-center gap-2 text-xs text-[#7A8B7C] pl-10">
                  <span className="w-2 h-2 rounded-full bg-[#FF4D31] animate-ping" />
                  <span>Synthesizing explanation...</span>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-[#E8E6DE] dark:border-[#2C2C29] bg-[#F9F8F3] dark:bg-[#252522] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask technical question about current milestone..."
                className="flex-1 px-4 py-2.5 rounded-full bg-white dark:bg-[#1A1A18] border border-[#E8E6DE] dark:border-[#2C2C29] text-xs focus:outline-hidden focus:border-[#FF4D31]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-5 py-2.5 rounded-full bg-[#FF4D31] text-white text-xs font-bold hover:bg-[#E8402A] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Active Practice Labs */}
        {activeTab === 'practice' && (
          <div className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-10 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D31] block mb-1">
                  INTERACTIVE PRACTICE LABS
                </span>
                <h3 className="text-2xl font-display font-bold">Applied Skill Verification</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Lab 1: PyTorch Autograd Graph Engine',
                  duration: '45 mins',
                  difficulty: 'Intermediate',
                  desc: 'Build backpropagation computation graph with matrix derivatives.',
                },
                {
                  title: 'Lab 2: Fast Vector Cosine Indexer',
                  duration: '60 mins',
                  difficulty: 'Advanced',
                  desc: 'Implement HNSW vector distance clustering in Python 3.12.',
                },
                {
                  title: 'Lab 3: ReAct Loop Agent Orchestrator',
                  duration: '90 mins',
                  difficulty: 'Advanced',
                  desc: 'Build an autonomous tool executor with JSON schema validation.',
                },
              ].map((lab, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-[#7A8B7C] mb-3">
                      <span>{lab.difficulty}</span>
                      <span>{lab.duration}</span>
                    </div>
                    <h4 className="text-base font-bold mb-2">{lab.title}</h4>
                    <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed mb-6">
                      {lab.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsLabOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Lab</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Interactive Practice Lab Modal */}
      <AnimatePresence>
        {isLabOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#E8E6DE] dark:border-[#2C2C29] shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4D31]">
                  <Code className="w-4 h-4" />
                  <span>Micro-Assessment Lab</span>
                </div>
                <button
                  onClick={() => setIsLabOpen(false)}
                  className="text-xs text-[#7A8B7C] hover:text-[#1A1A1A] dark:hover:text-white cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div>
                <h3 className="text-lg font-display font-bold mb-2">
                  Knowledge Check: Attention Mechanism
                </h3>
                <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
                  In transformer multi-head self-attention, why do we scale the dot product of Query (Q) and Key (K) matrices by √d_k before applying softmax?
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 1,
                    text: 'To avoid vanishing gradients caused by excessively large dot-product magnitudes pushing softmax into regions with tiny derivatives.',
                    correct: true,
                  },
                  {
                    id: 2,
                    text: 'To convert negative values into positive probabilities.',
                    correct: false,
                  },
                  {
                    id: 3,
                    text: 'To guarantee that the resulting attention matrix has determinant equal to 1.',
                    correct: false,
                  },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => {
                      if (!quizSubmitted) setQuizAnswer(opt.id);
                    }}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      quizAnswer === opt.id
                        ? 'bg-[#F9F8F3] dark:bg-[#252522] border-[#FF4D31] font-semibold'
                        : 'border-[#E8E6DE] dark:border-[#2C2C29] hover:border-[#7A8B7C]'
                    } ${
                      quizSubmitted && opt.correct
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold'
                        : ''
                    }`}
                  >
                    {opt.text}
                  </div>
                ))}
              </div>

              {quizSubmitted ? (
                <div className="p-4 rounded-xl bg-[#7A8B7C]/10 border border-[#7A8B7C]/30 text-xs text-[#7A8B7C] font-semibold">
                  ✓ Correct! Scaling by √d_k maintains unit variance and keeps softmax in sensitive gradient regions. +50 XP added to Deep Learning!
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (quizAnswer === 1) {
                      setQuizSubmitted(true);
                      confetti({ particleCount: 50, spread: 45, origin: { y: 0.7 } });
                    }
                  }}
                  disabled={!quizAnswer}
                  className="w-full py-3 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Verify Answer
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

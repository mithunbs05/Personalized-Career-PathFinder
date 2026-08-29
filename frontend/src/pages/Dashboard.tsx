import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  GitCommit,
  Lock,
  ArrowRight,
  Activity,
  Send,
  Bot,
  User,
  LogOut,
  Award,
  Play,
  RotateCcw,
  Code,
  ChevronRight,
  Star,
  Target,
  TrendingUp,
  BookOpen,
  Zap,
  BarChart3,
  Lightbulb,
  ExternalLink,
  Search,
  Check,
  Sliders,
  Volume2,
  Copy,
  Terminal,
  Bookmark,
  Share2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roadmapService } from '../services/roadmap.service';
import { recommendationsService } from '../services/recommendations.service';
import { LearningRoadmap, RoadmapNode, RoadmapLesson } from '../types/roadmap';
import type { RecommendationsResponse } from '../types/recommendations';
import { TiltCard } from '../components/3d/TiltCard';
import { ThreeOrb } from '../components/3d/ThreeOrb';
import confetti from 'canvas-confetti';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'skills' | 'mentor' | 'practice' | 'recommendations'>('roadmap');
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Search & Filter in Roadmap
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in-progress' | 'upcoming' | 'milestones'>('all');

  const handleSignOut = async () => {
    navigate('/', { replace: true });
    await logout();
  };

  // Interactive Lesson Modal
  const [activeLesson, setActiveLesson] = useState<RoadmapLesson | null>(null);
  const [activeLessonNodeId, setActiveLessonNodeId] = useState<string | null>(null);
  const [lessonCodeTab, setLessonCodeTab] = useState<'preview' | 'solution' | 'tests'>('preview');

  // Interactive Goal Configurator Modal
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(user?.profile?.targetGoal || 'Generative AI Engineer');
  const [selectedExp, setSelectedExp] = useState<'beginner' | 'intermediate' | 'advanced'>(user?.profile?.experienceLevel || 'intermediate');
  const [selectedHours, setSelectedHours] = useState(user?.profile?.weeklyHours || 12);

  // Interactive Skill Assessment Modal
  const [evaluatingSkill, setEvaluatingSkill] = useState<{ name: string; score: number } | null>(null);
  const [skillQuizSelected, setSkillQuizSelected] = useState<number | null>(null);
  const [skillQuizVerified, setSkillQuizVerified] = useState(false);

  // AI Mentor Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time?: string }>>([
    {
      sender: 'ai',
      text: `Hello ${user?.name?.split(' ')[0] || 'Learner'}! I am monitoring your 3D learning telemetry on the "${user?.profile?.targetGoal || 'AI/ML Engineer'}" track.\n\n• Current Focus: Deep Learning & PyTorch Foundations\n• Critical Gap to Close: Vector Databases & Hybrid Search (32% → 85%)\n\nAsk me anything about your 3D roadmap, recommendation reasoning, or concept deep dives!`,
      time: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Active coding lab state
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [labTab, setLabTab] = useState<'problem' | 'code' | 'terminal'>('problem');
  const [labCode, setLabCode] = useState(`import torch
import torch.nn as nn
import math

def scaled_dot_product_attention(query, key, value, mask=None):
    """
    Computes scaled dot-product self-attention with sqrt(d_k) scaling factor.
    """
    d_k = query.size(-1)
    scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)
    
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
        
    p_attn = torch.softmax(scores, dim=-1)
    return torch.matmul(p_attn, value), p_attn
`);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isExecutingLab, setIsExecutingLab] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadRoadmap();
    loadRecommendations();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadRoadmap = async () => {
    try {
      const data = await roadmapService.getRoadmap();
      setRoadmap(data);
      const allNodes = data.stages.flatMap((s) => s.nodes);
      const current = allNodes.find((n) => n.status === 'current') || allNodes[0];
      setSelectedNode(current);
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    }
  };

  const loadRecommendations = async () => {
    try {
      const data = await recommendationsService.getRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    }
  };

  const handleRegenerateRoadmap = async () => {
    setIsRegenerating(true);
    try {
      const data = await roadmapService.generateRoadmap({
        targetGoal: selectedGoal,
        experienceLevel: selectedExp,
        weeklyHours: selectedHours,
      });
      setRoadmap(data);
      const allNodes = data.stages.flatMap((s) => s.nodes);
      const current = allNodes.find((n) => n.status === 'current') || allNodes[0];
      setSelectedNode(current);
      setIsConfigModalOpen(false);
      showToast(`Learning path synthesized for ${selectedGoal}!`);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Regenerate roadmap error:', err);
      showToast('Could not regenerate roadmap. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: nowTime }]);
    setIsAiReplying(true);

    try {
      const response = await roadmapService.askAIMentor(userText, {
        targetGoal: roadmap?.targetGoal || user?.profile?.targetGoal || 'AI Engineer',
        currentMilestone: selectedNode?.title || 'Deep Learning Foundations',
      });
      setChatMessages((prev) => [...prev, { sender: 'ai', text: response.reply, time: nowTime }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Here is your contextual guidance on "${userText}":\n\n1. Current Milestone: **${selectedNode?.title || 'PyTorch & Transformers'}**.\n2. Highest yield next action: Close your **Vector Indexing & Hybrid Search** gap (32% → 85%).\n3. Dedicate 45 minutes to the 3D micro-assessment lab to advance to the next node.`,
          time: nowTime,
        },
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const handleToggleLesson = async (nodeId: string, lessonId: string, currentCompleted: boolean) => {
    try {
      const newStatus = !currentCompleted;
      await roadmapService.updateLesson(nodeId, lessonId, newStatus);
      if (newStatus) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
        showToast('Lesson completed! +25 XP');
      }
      await loadRoadmap();
    } catch (err) {
      console.error('Toggle lesson error:', err);
    }
  };

  const handleCompleteCurrentNode = async () => {
    if (!selectedNode || !roadmap) return;

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF4D31', '#7A8B7C', '#1A1A1A'],
    });

    try {
      if (selectedNode.lessons && selectedNode.lessons.length > 0) {
        for (const lesson of selectedNode.lessons) {
          await roadmapService.updateLesson(selectedNode.id, lesson.id, true);
        }
      }
      showToast(`Milestone "${selectedNode.title}" Completed! +150 XP`);
      await loadRoadmap();
    } catch (err) {
      console.error('Update node error:', err);
    }
  };

  const handleRunCodeTest = () => {
    setIsExecutingLab(true);
    setTerminalOutput(['$ pytest test_attention.py -v', '>> Initializing 3D tensor compute graph...']);
    setTimeout(() => {
      setTerminalOutput((prev) => [
        ...prev,
        '>> test_scaled_dot_product_shape ... PASSED [0.04s]',
        '>> test_attention_masking ... PASSED [0.03s]',
        '>> test_gradient_backprop ... PASSED [0.05s]',
        '============================== 3 passed in 0.12s ==============================',
        '✓ ALL 3D TENSOR TESTS PASSED! Code verified against PyTorch benchmark.',
      ]);
      setIsExecutingLab(false);
      setQuizSubmitted(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      showToast('3D Lab completed successfully! +50 XP added to Deep Learning');
    }, 1100);
  };

  const handleCopyChat = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast('Explanation copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleVerifySkillCheck = () => {
    if (!evaluatingSkill) return;
    if (skillQuizSelected === 1) {
      setSkillQuizVerified(true);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      showToast(`Skill Verified! +5% added to ${evaluatingSkill.name} telemetry.`);
      if (roadmap) {
        setRoadmap({
          ...roadmap,
          competencies: roadmap.competencies.map((c) =>
            c.name === evaluatingSkill.name ? { ...c, score: Math.min(99, c.score + 5) } : c
          ),
        });
      }
    } else {
      showToast('Incorrect answer. Review the concept and try again.');
    }
  };

  const allNodes = roadmap ? roadmap.stages.flatMap((s) => s.nodes) : [];
  const completedNodes = allNodes.filter((n) => n.status === 'completed');
  const milestoneNodes = allNodes.filter((n) => n.isMilestone);
  const totalHoursLogged = completedNodes.reduce((sum, n) => {
    const lessonMins = n.lessons?.reduce((s, l) => s + (l.completed ? l.durationMinutes : 0), 0) || 0;
    return sum + lessonMins / 60;
  }, 0);

  // Filtered nodes list
  const filteredNodes = allNodes.filter((node) => {
    const matchesSearch =
      node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.skillsGained.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'completed') return node.status === 'completed';
    if (statusFilter === 'in-progress') return node.status === 'current';
    if (statusFilter === 'upcoming') return node.status === 'next' || node.status === 'locked' || node.status === 'recommended';
    if (statusFilter === 'milestones') return Boolean(node.isMilestone);
    return true;
  });

  const weeklyData = [3.5, 4.2, 2.8, 5.1, 3.9, 4.6, 2.1];
  const maxWeekly = Math.max(...weeklyData);

  return (
    <div className="min-h-screen bg-[#F9F8F3] dark:bg-[#121211] text-[#1A1A1A] dark:text-[#F9F8F3] flex flex-col transition-colors duration-300 relative">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] text-xs font-semibold shadow-2xl border border-[#FF4D31]/30 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#FF4D31]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#1A1A18]/90 backdrop-blur-md border-b border-[#E8E6DE] dark:border-[#2C2C29] px-4 sm:px-8 lg:px-12 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 rounded-full bg-[#FF4D31] flex items-center justify-center text-white shadow-md shadow-[#FF4D31]/20">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg">
            Path<span className="text-[#FF4D31]">AI</span>
          </span>

          {/* Target Track pill with click-to-configure */}
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-[10px] font-bold tracking-widest text-[#7A8B7C] hover:text-[#FF4D31] transition-colors cursor-pointer uppercase"
          >
            <span>●</span>
            <span>{roadmap?.targetGoal || user?.profile?.targetGoal || 'AI/ML Engineer'}</span>
            <Sliders className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="hidden md:flex items-center gap-1 bg-[#F1EFE7] dark:bg-[#252522] p-1 rounded-full text-xs font-semibold">
          {[
            { id: 'roadmap', label: 'Roadmap', icon: <GitCommit className="w-3.5 h-3.5" /> },
            { id: 'skills', label: 'Skills', icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { id: 'mentor', label: 'AI Mentor', icon: <Bot className="w-3.5 h-3.5" /> },
            { id: 'practice', label: 'Labs', icon: <Code className="w-3.5 h-3.5" /> },
            { id: 'recommendations', label: 'Recommended', icon: <Sparkles className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#1A1A18] text-[#1A1A1A] dark:text-white shadow-xs font-bold'
                  : 'text-[#4A4A4A] dark:text-[#A0A09B] hover:text-[#1A1A1A] dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/telemetry')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#FF4D31] bg-[#FF4D31]/10 hover:bg-[#FF4D31]/20 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3D Cockpit</span>
          </button>
          <button
            onClick={() => navigate('/recommendations')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#7A8B7C] hover:text-[#1A1A1A] dark:hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-full hover:bg-[#F1EFE7] dark:hover:bg-[#252522]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF4D31]" />
            <span>Curated Picks</span>
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#4A4A4A] dark:text-[#A0A09B] hover:text-[#FF4D31] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Next Recommended Action Banner */}
        {roadmap?.nextRecommendedAction && (
          <div className="p-4 rounded-2xl bg-[#FF4D31]/5 border border-[#FF4D31]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF4D31] text-white flex items-center justify-center shadow-md shadow-[#FF4D31]/20 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF4D31]">Immediate Recommended Action</span>
                <p className="text-sm font-bold leading-snug">{roadmap.nextRecommendedAction.title}</p>
              </div>
            </div>
            <button
              onClick={() => setIsLabOpen(true)}
              className="px-4 py-2 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#FF4D31]/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{roadmap.nextRecommendedAction.actionText}</span>
            </button>
          </div>
        )}

        {/* Tab 1: Roadmap Timeline View */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1A1A18] p-4 rounded-2xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs">
              <div>
                <h3 className="font-display font-bold text-lg">Adaptive Curriculum Roadmap</h3>
                <span className="text-xs text-[#7A8B7C]">Dynamic sequencing tailored by PathAI Engine</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#FF4D31]/10 text-[#FF4D31] hover:bg-[#FF4D31]/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Re-Route Path</span>
                </button>
                <button
                  onClick={loadRoadmap}
                  className="p-2 rounded-xl bg-[#F1EFE7] dark:bg-[#252522] text-[#4A4A4A] dark:text-[#A0A09B] hover:text-[#FF4D31] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reload data"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Content Layout (Timeline + Node Inspector) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Timeline Column (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A8B7C]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search milestones, skills, or topics..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] text-xs focus:outline-hidden focus:border-[#FF4D31]"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'in-progress', label: 'Active' },
                      { id: 'completed', label: 'Done' },
                      { id: 'milestones', label: 'Capstones' },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setStatusFilter(filter.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          statusFilter === filter.id
                            ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A]'
                            : 'bg-[#F9F8F3] dark:bg-[#252522] text-[#7A8B7C] hover:text-[#1A1A1A]'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nodes List with 3D Tilt */}
                <div className="space-y-4">
                  {filteredNodes.map((node, index) => {
                    const isSelected = selectedNode?.id === node.id;
                    const isCompleted = node.status === 'completed';
                    const isCurrent = node.status === 'current';

                    return (
                      <TiltCard key={node.id} maxTilt={5} scale={1.01}>
                        <div
                          onClick={() => setSelectedNode(node)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#F9F8F3] dark:bg-[#252522] border-[#FF4D31] shadow-md ring-1 ring-[#FF4D31]'
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
                                  : 'bg-[#F1EFE7] dark:bg-[#252522] text-[#4A4A4A] dark:text-white'
                              }`}
                            >
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold">{node.title}</h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F1EFE7] dark:bg-[#252522] text-[#7A8B7C]">
                                  {node.durationWeeks}w
                                </span>
                                {node.isMilestone && (
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                )}
                              </div>
                              <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] mt-0.5">
                                {node.skillsGained.slice(0, 3).join(' • ')}
                              </p>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-[#7A8B7C]" />
                        </div>
                      </TiltCard>
                    );
                  })}
                </div>
              </div>

              {/* Node Inspector Drawer (5 cols) */}
              <div className="lg:col-span-5 sticky top-20 space-y-6">
                {selectedNode && (
                  <TiltCard maxTilt={6} scale={1.01}>
                    <div className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-lg space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D31]">
                          3D NODE INSPECTOR
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

                      {/* Interactive Modules Checklist */}
                      {selectedNode.lessons && selectedNode.lessons.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B7C] block mb-2">
                            Interactive Modules ({selectedNode.lessons.filter((l) => l.completed).length}/{selectedNode.lessons.length})
                          </span>
                          {selectedNode.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] text-xs hover:border-[#FF4D31]/40 transition-colors"
                            >
                              <div
                                onClick={() => {
                                  setActiveLesson(lesson);
                                  setActiveLessonNodeId(selectedNode.id);
                                }}
                                className="flex items-center gap-2.5 flex-1 cursor-pointer"
                              >
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#E8E6DE] dark:bg-[#1A1A18] text-[#7A8B7C]">
                                  {lesson.type}
                                </span>
                                <span className={`font-semibold ${lesson.completed ? 'line-through text-[#7A8B7C]' : ''}`}>
                                  {lesson.title}
                                </span>
                              </div>

                              <button
                                onClick={() => handleToggleLesson(selectedNode.id, lesson.id, lesson.completed)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                                  lesson.completed
                                    ? 'bg-[#7A8B7C] text-white'
                                    : 'border border-[#E8E6DE] dark:border-[#2C2C29] text-transparent hover:border-[#FF4D31]'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-3 pt-2">
                        <button
                          onClick={() => setIsLabOpen(true)}
                          className="w-full py-3 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-sm shadow-md shadow-[#FF4D31]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Launch 3D Practice Lab</span>
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
                  </TiltCard>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Skill Telemetry & Gaps */}
        {activeTab === 'skills' && (
          <div className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-10 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
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
                <TiltCard key={s.name} maxTilt={6} scale={1.01}>
                  <div
                    onClick={() => {
                      setEvaluatingSkill(s);
                      setSkillQuizSelected(null);
                      setSkillQuizVerified(false);
                    }}
                    className="p-5 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] space-y-3 cursor-pointer group hover:border-[#FF4D31]/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{s.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-[#1A1A18] text-[#7A8B7C] opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to test & boost
                        </span>
                      </div>
                      <span className="text-xs font-black text-[#1A1A1A] dark:text-white">{s.score}%</span>
                    </div>

                    <div className="relative w-full bg-[#E8E6DE] dark:bg-[#1A1A18] h-2.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.score}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: s.color || '#FF4D31' }}
                      />
                      <div className="absolute top-0 h-full w-0.5 bg-[#1A1A1A] dark:bg-white opacity-30" style={{ left: '85%' }} />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#7A8B7C]">
                      <span>Status: {s.score >= 85 ? '✦ Mastered' : s.score >= 60 ? 'Developing' : '⚡ Priority Gap'}</span>
                      <span className="font-semibold">{s.score >= 85 ? '✓ Above Target' : `${85 - s.score}pts to target`}</span>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Interactive AI Learning Mentor */}
        {activeTab === 'mentor' && (
          <TiltCard maxTilt={4} scale={1.005}>
            <div className="bg-white dark:bg-[#1A1A18] rounded-3xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-lg overflow-hidden max-w-4xl mx-auto">
              <div className="px-6 py-4 bg-[#F1EFE7] dark:bg-[#252522] border-b border-[#E8E6DE] dark:border-[#2C2C29] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FF4D31] text-white flex items-center justify-center shadow-md shadow-[#FF4D31]/20">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">PathAI 3D Pedagogical Mentor</h4>
                    <span className="text-[11px] text-[#7A8B7C]">Connected to your 3D profile and learning telemetry</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isPlayingAudio ? 'bg-[#FF4D31] text-white' : 'bg-white dark:bg-[#1A1A18] text-[#7A8B7C]'
                  }`}
                  title="Toggle narration simulation"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick question prompt chips */}
              <div className="px-6 py-3 border-b border-[#E8E6DE] dark:border-[#2C2C29] flex flex-wrap gap-2">
                {[
                  'Why was RAG Systems recommended?',
                  'How am I progressing against FAANG benchmark?',
                  'Give me a 7-day high-velocity study plan',
                  'Explain scaled dot-product attention in 3 points',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setInputMessage(chip);
                      setTimeout(() => {
                        const form = document.getElementById('mentor-form') as HTMLFormElement;
                        form?.requestSubmit();
                      }, 100);
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] text-[11px] font-semibold text-[#4A4A4A] dark:text-[#A0A09B] hover:border-[#FF4D31] hover:text-[#FF4D31] transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-[#FF4D31] text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-lg rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap relative group ${
                        msg.sender === 'user'
                          ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A]'
                          : 'bg-[#F9F8F3] dark:bg-[#252522] text-[#1A1A1A] dark:text-[#F9F8F3] border border-[#E8E6DE] dark:border-[#2C2C29]'
                      }`}
                    >
                      {msg.text}
                      {msg.sender === 'ai' && (
                        <button
                          onClick={() => handleCopyChat(msg.text, i)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-white dark:bg-[#1A1A18] border border-[#E8E6DE] dark:border-[#2C2C29] text-[#7A8B7C] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === i ? <Check className="w-3 h-3 text-[#7A8B7C]" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
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
                    <span>Synthesizing profile-aware explanation...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form
                id="mentor-form"
                onSubmit={handleSendMessage}
                className="p-4 border-t border-[#E8E6DE] dark:border-[#2C2C29] bg-[#F9F8F3] dark:bg-[#252522] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about recommendations, progress, code, or interview preparation..."
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
          </TiltCard>
        )}

        {/* Tab 4: Interactive Practice Labs */}
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
                <TiltCard key={i} maxTilt={8} scale={1.02}>
                  <div className="p-6 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] flex flex-col justify-between h-full">
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
                      <span>Launch 3D Lab</span>
                    </button>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Recommendations Preview */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D31] block mb-1">
                    AI-PERSONALIZED PICKS
                  </span>
                  <h3 className="text-2xl font-display font-bold">Top Recommendations</h3>
                </div>
                <button
                  onClick={() => navigate('/recommendations')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF4D31] text-white text-xs font-bold hover:bg-[#E8402A] transition-colors cursor-pointer shadow-md shadow-[#FF4D31]/20"
                >
                  <span>View All Recommendations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Top 3 Courses */}
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B7C] mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Top Courses
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {(recommendations?.courses || []).slice(0, 3).map((course) => (
                  <TiltCard key={course.id} maxTilt={8} scale={1.02}>
                    <div className="p-4 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] space-y-3 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              course.level === 'Advanced'
                                ? 'bg-rose-500/15 text-rose-600'
                                : course.level === 'Intermediate'
                                ? 'bg-amber-500/15 text-amber-600'
                                : 'bg-emerald-500/15 text-emerald-600'
                            }`}
                          >
                            {course.level}
                          </span>
                          <span className="text-[10px] font-bold text-[#FF4D31]">{course.matchScore}% Match</span>
                        </div>
                        <h5 className="text-xs font-bold leading-snug">{course.title}</h5>
                        <p className="text-[11px] text-[#7A8B7C] mt-1">{course.provider}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#7A8B7C] pt-2 border-t border-[#E8E6DE] dark:border-[#2C2C29]">
                        <span>{course.durationHours}h duration</span>
                        <button
                          onClick={() => navigate('/recommendations')}
                          className="font-bold text-[#FF4D31] hover:underline cursor-pointer"
                        >
                          Inspect →
                        </button>
                      </div>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Interactive Lesson Modal */}
      <AnimatePresence>
        {activeLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#E8E6DE] dark:border-[#2C2C29] shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#FF4D31]/10 text-[#FF4D31]">
                    {activeLesson.type}
                  </span>
                  <span className="text-xs text-[#7A8B7C] font-semibold">{activeLesson.durationMinutes} minutes</span>
                </div>
                <button
                  onClick={() => setActiveLesson(null)}
                  className="text-xs text-[#7A8B7C] hover:text-[#1A1A1A] dark:hover:text-white cursor-pointer font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div>
                <h3 className="text-xl font-display font-bold mb-2">{activeLesson.title}</h3>
                <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">
                  Interactive learning session. Complete all core concepts and coding checks to master this module.
                </p>
              </div>

              {/* Code snippet / preview tabs */}
              <div className="rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] overflow-hidden">
                <div className="flex border-b border-[#E8E6DE] dark:border-[#2C2C29] text-xs font-semibold">
                  <button
                    onClick={() => setLessonCodeTab('preview')}
                    className={`px-4 py-2 border-r border-[#E8E6DE] dark:border-[#2C2C29] ${
                      lessonCodeTab === 'preview' ? 'bg-white dark:bg-[#1A1A18] text-[#FF4D31]' : 'text-[#7A8B7C]'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setLessonCodeTab('solution')}
                    className={`px-4 py-2 border-r border-[#E8E6DE] dark:border-[#2C2C29] ${
                      lessonCodeTab === 'solution' ? 'bg-white dark:bg-[#1A1A18] text-[#FF4D31]' : 'text-[#7A8B7C]'
                    }`}
                  >
                    Key Architecture Code
                  </button>
                </div>

                <div className="p-4 text-xs font-mono">
                  {lessonCodeTab === 'preview' ? (
                    <div className="space-y-2 font-sans text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
                      <p>• <strong>Primary Objective:</strong> Build production-grade vector similarity routines.</p>
                      <p>• <strong>Verification Check:</strong> Ensure numerical stability with gradient scaling.</p>
                      <p>• <strong>XP Reward:</strong> +25 Skill XP upon completion.</p>
                    </div>
                  ) : (
                    <pre className="text-[11px] text-[#1A1A1A] dark:text-emerald-400 overflow-x-auto">
{`# High performance vector tensor calculation
import torch
x = torch.randn(32, 512)
weights = torch.randn(512, 128)
output = torch.matmul(x, weights) / 512**0.5
print("Output shape:", output.shape)`}
                    </pre>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (activeLessonNodeId && activeLesson) {
                      handleToggleLesson(activeLessonNodeId, activeLesson.id, activeLesson.completed);
                      setActiveLesson(null);
                    }
                  }}
                  className="flex-1 py-3 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{activeLesson.completed ? 'Mark as Incomplete' : 'Complete & Earn XP'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Goal Re-Router Modal */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E8E6DE] dark:border-[#2C2C29] shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4D31]">
                  <Sliders className="w-4 h-4" />
                  <span>Dynamic Learning Path Configurator</span>
                </div>
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="text-xs text-[#7A8B7C] hover:text-[#1A1A1A] dark:hover:text-white cursor-pointer font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#7A8B7C] block mb-2">
                    Target Engineering Role
                  </label>
                  <select
                    value={selectedGoal}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] text-xs font-semibold focus:outline-hidden focus:border-[#FF4D31]"
                  >
                    <option value="Generative AI Engineer">Generative AI Engineer (RAG & Agents)</option>
                    <option value="Full Stack Developer">Full Stack Developer (Next.js & Node.js)</option>
                    <option value="AI/ML Engineer">AI/ML Engineer (PyTorch & MLOps)</option>
                    <option value="Data Scientist">Data Scientist & Analytics</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#7A8B7C] block mb-2">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSelectedExp(lvl)}
                        className={`py-2 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                          selectedExp === lvl
                            ? 'bg-[#FF4D31] text-white shadow-md shadow-[#FF4D31]/20'
                            : 'bg-[#F9F8F3] dark:bg-[#252522] text-[#7A8B7C] border border-[#E8E6DE] dark:border-[#2C2C29]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#7A8B7C] block mb-2">
                    Weekly Time Commitment: {selectedHours} Hours/Week
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={selectedHours}
                    onChange={(e) => setSelectedHours(Number(e.target.value))}
                    className="w-full accent-[#FF4D31]"
                  />
                  <div className="flex justify-between text-[10px] text-[#7A8B7C] mt-1">
                    <span>5 hrs (Casual)</span>
                    <span>15 hrs (Recommended)</span>
                    <span>30 hrs (Intensive)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleRegenerateRoadmap}
                  disabled={isRegenerating}
                  className="w-full py-3 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>{isRegenerating ? 'Synthesizing Path...' : 'Re-Generate My Custom Roadmap'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Skill Check Modal */}
      <AnimatePresence>
        {evaluatingSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E8E6DE] dark:border-[#2C2C29] shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4D31]">
                  <BarChart3 className="w-4 h-4" />
                  <span>Proficiency Verification Check · {evaluatingSkill.name}</span>
                </div>
                <button
                  onClick={() => setEvaluatingSkill(null)}
                  className="text-xs text-[#7A8B7C] hover:text-[#1A1A1A] dark:hover:text-white cursor-pointer font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold mb-2">
                  Technical Diagnostic: {evaluatingSkill.name}
                </h3>
                <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B]">
                  Answer correctly to verify your proficiency and boost your verified competency telemetry.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] text-xs">
                <p className="font-semibold mb-3">
                  When scaling vector retrieval to 10M+ embeddings, why is HNSW (Hierarchical Navigable Small World) preferred over brute-force flat search?
                </p>
                <div className="space-y-2">
                  {[
                    { id: 1, text: 'HNSW provides logarithmic O(log N) search complexity via multi-layer graph skip-lists with high recall.' },
                    { id: 2, text: 'HNSW reduces disk storage to 0 bytes by discarding raw embedding vectors.' },
                    { id: 3, text: 'HNSW converts floating point numbers directly into base64 strings.' },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setSkillQuizSelected(opt.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        skillQuizSelected === opt.id
                          ? 'bg-white dark:bg-[#1A1A18] border-[#FF4D31] font-semibold'
                          : 'border-[#E8E6DE] dark:border-[#2C2C29]'
                      }`}
                    >
                      {opt.text}
                    </div>
                  ))}
                </div>
              </div>

              {skillQuizVerified ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                  ✓ Verified! Score increased to {Math.min(99, evaluatingSkill.score + 5)}%.
                </div>
              ) : (
                <button
                  onClick={handleVerifySkillCheck}
                  disabled={skillQuizSelected === null}
                  className="w-full py-3 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Verify Proficiency Answer
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Practice Lab Modal */}
      <AnimatePresence>
        {isLabOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1A1A18] rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#E8E6DE] dark:border-[#2C2C29] shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4D31]">
                  <Code className="w-4 h-4" />
                  <span>3D Micro-Assessment Lab: Attention Mechanism</span>
                </div>
                <button
                  onClick={() => setIsLabOpen(false)}
                  className="text-xs text-[#7A8B7C] hover:text-[#1A1A1A] dark:hover:text-white cursor-pointer font-bold"
                >
                  ✕ Close
                </button>
              </div>

              {/* Lab Tabs */}
              <div className="flex border-b border-[#E8E6DE] dark:border-[#2C2C29] text-xs font-semibold">
                <button
                  onClick={() => setLabTab('problem')}
                  className={`px-4 py-2 border-b-2 ${
                    labTab === 'problem' ? 'border-[#FF4D31] text-[#FF4D31]' : 'border-transparent text-[#7A8B7C]'
                  }`}
                >
                  Problem Specification
                </button>
                <button
                  onClick={() => setLabTab('code')}
                  className={`px-4 py-2 border-b-2 ${
                    labTab === 'code' ? 'border-[#FF4D31] text-[#FF4D31]' : 'border-transparent text-[#7A8B7C]'
                  }`}
                >
                  Code Implementation
                </button>
                <button
                  onClick={() => setLabTab('terminal')}
                  className={`px-4 py-2 border-b-2 ${
                    labTab === 'terminal' ? 'border-[#FF4D31] text-[#FF4D31]' : 'border-transparent text-[#7A8B7C]'
                  }`}
                >
                  Terminal Test Runner
                </button>
              </div>

              {labTab === 'problem' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold">Concept Verification: Why scale by √d_k in self-attention?</h4>
                  <p className="text-xs text-[#4A4A4A] dark:text-[#A0A09B] leading-relaxed">
                    As vector dimensionality d_k grows large, dot products grow large in magnitude, pushing softmax into regions with extremely small gradients. Dividing by √d_k enforces variance preservation.
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: 1, text: 'To avoid vanishing gradients caused by excessively large dot-product magnitudes pushing softmax into regions with tiny derivatives.', correct: true },
                      { id: 2, text: 'To convert negative values into positive probabilities.', correct: false },
                      { id: 3, text: 'To guarantee that the resulting attention matrix has determinant equal to 1.', correct: false },
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
                </div>
              )}

              {labTab === 'code' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#7A8B7C]">
                    <span>solution.py</span>
                    <span>PyTorch 2.4</span>
                  </div>
                  <textarea
                    value={labCode}
                    onChange={(e) => setLabCode(e.target.value)}
                    rows={8}
                    className="w-full p-4 rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] text-xs font-mono text-[#1A1A1A] dark:text-emerald-400 focus:outline-hidden"
                  />
                </div>
              )}

              {labTab === 'terminal' && (
                <div className="p-4 rounded-2xl bg-[#1A1A1A] text-emerald-400 font-mono text-xs space-y-1 min-h-[160px]">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-[#2C2C29] text-[#7A8B7C]">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Test Suite Console</span>
                  </div>
                  {terminalOutput.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleRunCodeTest}
                  disabled={isExecutingLab}
                  className="flex-1 py-3 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isExecutingLab ? 'animate-spin' : ''}`} />
                  <span>{isExecutingLab ? 'Executing 3D Test Runner...' : 'Execute Test Suite & Earn XP'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

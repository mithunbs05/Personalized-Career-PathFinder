import React, { useState } from 'react';
import { RoadmapStage } from '../../types/roadmap';
import { BookOpen, Video, FileText, Code2, GraduationCap, Lock, HelpCircle, Bot, Send, ExternalLink, BrainCircuit, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CourseMaterialsDrawerProps {
  stage: RoadmapStage | null;
}

export const CourseMaterialsDrawer: React.FC<CourseMaterialsDrawerProps> = ({ stage }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hi ! Ask me anything about your learning roadmap, prerequisites, or why specific skills are required for your target role.',
    },
  ]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { sender: 'user', text: chatInput }, { sender: 'ai', text: 'I am analyzing your question. In this demo, this is a simulated response indicating that the concept is vital for AI Engineering because it builds the foundation for advanced model architecture.' }]);
    setChatInput('');
  };

  const quickPrompts = [
    "Why Math before ML?",
    "Why learn RAG?",
    "What is the capstone?"
  ];

  if (!stage) {
    return (
      <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-700">
          <BookOpen className="w-6 h-6 text-slate-300 dark:text-slate-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Stage Selected</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a node on the canvas to view curated course materials and syllabus.</p>
        </div>
      </div>
    );
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'COURSE': return <GraduationCap className="w-4 h-4" />;
      case 'DOCUMENTATION': return <FileText className="w-4 h-4" />;
      case 'VIDEO': return <Video className="w-4 h-4" />;
      case 'PRACTICE': return <Code2 className="w-4 h-4" />;
      case 'ASSESSMENT': return <HelpCircle className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'COURSE': return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'DOCUMENTATION': return 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'VIDEO': return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'PRACTICE': return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'ASSESSMENT': return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden h-[800px] lg:sticky lg:top-24">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex flex-wrap items-center gap-2 mb-2">
           <span className="text-[10px] font-extrabold text-[#ea580c] tracking-wider uppercase bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-full">
            {stage.isFinalCapstone ? 'FINAL CAPSTONE' : `STAGE ${stage.id}`}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
            {stage.difficulty}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
            {stage.estimatedDuration}
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
          {stage.title}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Prerequisite Alert */}
        {stage.status === 'LOCKED' && stage.prerequisites.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Prerequisite Required:</strong> Complete{' '}
              <span className="underline decoration-amber-300">
                {stage.prerequisites.join(', ')}
              </span>{' '}
              before unlocking this stage.
            </div>
          </div>
        )}

        {/* Why learn this? */}
        <div className="p-4 rounded-xl bg-[#fff7ed] dark:bg-orange-950/20 border border-[#ffedd5] dark:border-orange-900/30 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#ea580c]">
            <HelpCircle className="w-4 h-4" /> Why do I need to learn this?
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {stage.whyLearn}
          </p>
        </div>

        {/* Competencies */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Key Competencies & Syllabus</h3>
          <ul className="space-y-2">
            {stage.learnings.map((learning, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="text-[#ea580c] mt-0.5">•</span> {learning}
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Curated Learning Materials</h3>
          <div className="space-y-2">
            {stage.resources.map((res) => (
              <div key={res.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col gap-2 group cursor-pointer bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1", getResourceColor(res.type))}>
                    {getResourceIcon(res.type)} {res.type}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{res.duration}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 group-hover:text-[#ea580c] dark:group-hover:text-[#ea580c] transition-colors">{res.title}</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{res.provider}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-[#ea580c] flex items-center gap-1 transition-colors">
                    Open <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Capstone specific view */}
        {stage.isFinalCapstone && (
           <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-lg shadow-slate-900/20">
             <div className="flex items-center gap-2 text-[#ea580c] font-bold text-sm">
               <BrainCircuit className="w-5 h-5" />
               Capstone Requirements
             </div>
             <p className="text-xs text-slate-300 leading-relaxed">{stage.project}</p>
             <div className="pt-3 mt-3 border-t border-slate-700/50">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Outcome Summary</div>
               <ul className="space-y-1.5 text-xs text-slate-200">
                 <li className="flex items-center gap-2"><Check className="w-3 h-3 text-emerald-400" /> End-to-end System Design</li>
                 <li className="flex items-center gap-2"><Check className="w-3 h-3 text-emerald-400" /> Production Deployment</li>
                 <li className="flex items-center gap-2"><Check className="w-3 h-3 text-[#ea580c]" /> 🎯 PathAI Certified: AI/ML Engineer Ready</li>
               </ul>
             </div>
           </div>
        )}
      </div>
      
      {/* Sticky Bottom Actions & AI Chat */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Primary CTA */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <button 
            disabled={stage.status === 'LOCKED'}
            className="w-full py-3 rounded-xl bg-[#ea580c] hover:bg-[#d84d08] text-white font-bold text-sm shadow-md shadow-[#ea580c]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stage.isFinalCapstone ? 'Start Capstone Project' : 'Launch Stage Courseware'}
          </button>
        </div>

        {/* Embedded AI Mentor */}
        <div className="bg-slate-50 dark:bg-slate-900/50 flex flex-col h-48">
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
            <Bot className="w-4 h-4 text-[#ea580c]" />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">AI Learning Mentor</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-md bg-[#fff7ed] dark:bg-orange-950/20 border border-[#ffedd5] dark:border-orange-900/30 text-[#ea580c] flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={cn(
                    "p-2.5 rounded-xl text-xs leading-relaxed max-w-[85%]",
                    msg.sender === 'user'
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-tr-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-tl-sm shadow-sm'
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button 
                key={idx}
                onClick={() => setChatInput(prompt)}
                className="whitespace-nowrap px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:border-[#ea580c] dark:hover:border-[#ea580c] hover:text-[#ea580c] dark:hover:text-[#ea580c] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about prerequisites..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 text-white dark:text-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Send, Bot, User, ArrowRight, Clock } from 'lucide-react';

const RECOMMENDATIONS = [
  { step: '01', title: 'Deep Learning Foundations', duration: '2 weeks', focus: 'PyTorch, Autograd, GPU Tensors' },
  { step: '02', title: 'LLM Fundamentals', duration: '2 weeks', focus: 'Attention Mechanisms, Tokenizers' },
  { step: '03', title: 'RAG & Vector Databases', duration: '3 weeks', focus: 'Hybrid Search, ChromaDB, HNSW' },
  { step: '04', title: 'AI Agents & Tool Calling', duration: '3 weeks', focus: 'ReAct loops, Structured Outputs' },
  { step: '05', title: 'Production AI Systems', duration: '2 weeks', focus: 'FastAPI Streaming, Evaluation Benchmarks' },
];

export const AIConversation: React.FC = () => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [interactiveMessages, setInteractiveMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; recs?: typeof RECOMMENDATIONS }>>([
    {
      sender: 'user',
      text: 'I know Python and basic machine learning. I want to become a Generative AI Engineer.',
    },
    {
      sender: 'ai',
      text: "You're already past the fundamentals. Because you already understand Python and core ML metrics, you don't need introductory coding bootcamps.\n\nBased on your profile, I've mapped out this exact high-velocity sequence:",
      recs: RECOMMENDATIONS,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    'I am a Frontend Dev wanting to learn Full Stack AI.',
    'I have 5 hours/week and want to prepare for placement interviews.',
    'How do I master RAG without getting lost in hype?',
  ];

  const handleSendPrompt = (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setCustomPrompt('');
    setInteractiveMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = `Great question! Analyzing dependencies for: "${userMsg}". `;
      let customRecs = RECOMMENDATIONS;

      if (userMsg.toLowerCase().includes('frontend')) {
        aiResponseText = `Starting from Frontend (React/TypeScript) is an incredible advantage! AI applications need elite UX: streaming responses, optimistic state, and interactive visual graph interfaces.\n\nHere is your customized Full Stack AI path:`;
        customRecs = [
          { step: '01', title: 'Node.js & FastAPI AI Gateways', duration: '2 weeks', focus: 'Streaming SSE & JWT Auth' },
          { step: '02', title: 'LLM Function Calling & JSON Schemas', duration: '2 weeks', focus: 'Structured Generative UI' },
          { step: '03', title: 'Vector Embeddings in the Browser & Server', duration: '2 weeks', focus: 'Semantic Search Engines' },
          { step: '04', title: 'End-to-End Generative SaaS Project', duration: '3 weeks', focus: 'Production Deployment' },
        ];
      } else if (userMsg.toLowerCase().includes('5 hours') || userMsg.toLowerCase().includes('placement')) {
        aiResponseText = `With 5 hours per week, we prioritize maximum hiring signal with zero filler. Focus directly on high-yield algorithms and one flagship production agent:`;
        customRecs = [
          { step: '01', title: 'AI Engineering Core Diagnostics', duration: '2 weeks', focus: 'Data structures & Async API design' },
          { step: '02', title: 'Enterprise RAG System Lab', duration: '3 weeks', focus: 'Vector DB evaluation benchmarks' },
          { step: '03', title: 'Production Capstone & System Design', duration: '3 weeks', focus: 'Interview-ready portfolio' },
        ];
      } else {
        aiResponseText = `To master RAG effectively without wasted effort, skip generic toy wrappers. Focus on embedding mathematical alignment, chunking boundary strategies, and hybrid BM25 + dense vector re-ranking:`;
      }

      setInteractiveMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiResponseText,
          recs: customRecs,
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <section id="ai-mentor" className="py-24 md:py-32 bg-[#F9F8F3] dark:bg-[#121211] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F1EFE7] dark:bg-[#252522] rounded-full text-[10px] font-bold tracking-widest text-[#7A8B7C] uppercase mb-4">
            INTELLIGENT CONTEXT AWARENESS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#1A1A1A] dark:text-white tracking-tight">
            Don't know what to learn next?{' '}
            <span className="font-editorial italic font-normal text-stone-400 dark:text-stone-400">
              Ask.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#4A4A4A] dark:text-[#A0A09B] mt-4">
            PathAI remembers your full background, past projects, and available hours to synthesize precise, sequence-aware advice.
          </p>
        </div>

        {/* AI Chat Sandbox UI */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-[#1A1A18] rounded-3xl border border-[#E8E6DE] dark:border-[#2C2C29] shadow-xl overflow-hidden">
          {/* Chat Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6DE] dark:border-[#2C2C29] bg-[#F1EFE7]/80 dark:bg-[#252522]/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF4D31] text-white flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-white flex items-center gap-1.5">
                  PathAI Mentor
                  <span className="w-2 h-2 rounded-full bg-[#7A8B7C]"></span>
                </span>
                <p className="text-[11px] text-[#7A8B7C]">
                  Real-time pedagogical reasoning engine
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold tracking-wider px-3 py-1 rounded-full bg-[#FF4D31]/10 text-[#FF4D31]">
              Interactive Sandbox
            </span>
          </div>

          {/* Chat Stream Body */}
          <div className="p-6 space-y-6 max-h-[520px] overflow-y-auto">
            {interactiveMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-[#FF4D31] text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-3xl p-5 ${
                    msg.sender === 'user'
                      ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A]'
                      : 'bg-[#F9F8F3] dark:bg-[#252522] text-[#1A1A1A] dark:text-[#F9F8F3] border border-[#E8E6DE] dark:border-[#2C2C29]'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </p>

                  {/* Recommendation Cards if attached */}
                  {msg.recs && (
                    <div className="mt-5 space-y-2.5">
                      {msg.recs.map((rec) => (
                        <div
                          key={rec.step}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#1A1A18] border border-[#E8E6DE] dark:border-[#2C2C29] shadow-2xs hover:border-[#FF4D31] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-[#F1EFE7] dark:bg-[#252522] text-[#FF4D31] text-xs font-bold flex items-center justify-center shrink-0">
                              {rec.step}
                            </span>
                            <div>
                              <h5 className="text-xs font-bold text-[#1A1A1A] dark:text-white">
                                {rec.title}
                              </h5>
                              <span className="text-[11px] text-[#7A8B7C]">
                                {rec.focus}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-[#7A8B7C] shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#FF4D31]" />
                            {rec.duration}
                          </span>
                        </div>
                      ))}

                      <div className="pt-3">
                        <Link
                          to="/register"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#FF4D31] hover:bg-[#E8402A] text-white transition-all shadow-md shadow-[#FF4D31]/20"
                        >
                          <span>Generate My Path</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#7A8B7C] text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs font-medium text-[#7A8B7C] pl-11">
                <span className="w-2 h-2 rounded-full bg-[#FF4D31] animate-ping"></span>
                <span>PathAI is analyzing skill ontologies...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts & Interactive Input */}
          <div className="p-4 border-t border-[#E8E6DE] dark:border-[#2C2C29] bg-[#F1EFE7]/60 dark:bg-[#252522]/60">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-[11px] font-semibold text-[#7A8B7C] py-1">
                Try asking:
              </span>
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendPrompt(p)}
                  className="text-xs px-3.5 py-1 rounded-full bg-white dark:bg-[#1A1A18] border border-[#E8E6DE] dark:border-[#2C2C29] text-[#1A1A1A] dark:text-white hover:border-[#FF4D31] hover:text-[#FF4D31] transition-colors cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt(customPrompt);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ask PathAI about your background or target goal..."
                className="flex-1 px-4 py-2.5 rounded-full border border-[#E8E6DE] dark:border-[#2C2C29] bg-white dark:bg-[#1A1A18] text-sm text-[#1A1A1A] dark:text-white focus:outline-hidden focus:border-[#FF4D31]"
              />
              <button
                type="submit"
                disabled={!customPrompt.trim()}
                className="px-6 py-2.5 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer flex items-center gap-1.5"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

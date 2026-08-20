import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, User, Mail, Lock, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, CornerDownLeft } from 'lucide-react';
import { nlpService, ChatMessage } from '../services/nlp.service';

interface NlpRegistrationBotProps {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  onSwitchToForm?: () => void;
}

export const NlpRegistrationBot: React.FC<NlpRegistrationBotProps> = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
  isSubmitting,
  onSwitchToForm,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: "Hi! Let's get your account set up. What's your name and email address?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedReplies: [
        'My name is Rahul, email rahul@example.com',
        'I am Jordan Lee (jordan@pathai.dev)',
        'Alex Rivera, alex.rivera@example.com',
      ],
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastExtracted, setLastExtracted] = useState<string[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const isComplete = Boolean(name.trim() && email.trim() && password && password.length >= 6);

  const handleSendMessage = async (userText: string) => {
    const text = userText.trim();
    if (!text || isProcessing) return;

    setInputVal('');

    // Append user message
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

      const res = await nlpService.parseRegistrationMessage(
        text,
        { name, email, password, confirmPassword },
        history
      );

      const extractedItems: string[] = [];

      // Update state with extracted entities
      if (res.extracted.name) {
        setName(res.extracted.name);
        extractedItems.push(`Name: ${res.extracted.name}`);
      }
      if (res.extracted.email) {
        setEmail(res.extracted.email);
        extractedItems.push(`Email: ${res.extracted.email}`);
      }
      if (res.extracted.password) {
        setPassword(res.extracted.password);
        setConfirmPassword(res.extracted.confirmPassword || res.extracted.password);
        extractedItems.push('Password: ••••••••');
      }

      setLastExtracted(extractedItems);

      // Create bot message
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
      console.error('Registration chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: "I ran into an issue connecting to the AI service, but you can still tell me your info or use the standard form!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedReplies: ['Try again', 'Fill in standard form'],
        },
      ]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleQuickReply = (reply: string) => {
    if (reply === 'Fill in standard form' && onSwitchToForm) {
      onSwitchToForm();
      return;
    }
    if (reply === 'Create My Account' && isComplete) {
      onSubmit({ preventDefault: () => {} } as any);
      return;
    }
    handleSendMessage(reply);
  };

  return (
    <div className="flex flex-col h-[420px] rounded-2xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] overflow-hidden">
      {/* Real-time Extracted Credentials Badge Bar */}
      <div className="px-4 py-2.5 bg-[#F1EFE7] dark:bg-[#1E1E1C] border-b border-[#E8E6DE] dark:border-[#2C2C29] flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-medium">
        <div className="flex items-center gap-1.5 shrink-0 text-[#7A8B7C]">
          <Sparkles className="w-3.5 h-3.5 text-[#FF4D31]" />
          <span className="font-bold uppercase tracking-wider text-[10px]">Synced Fields:</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Name Status */}
          <span
            id="nlp-extracted-name-chip"
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all ${
              name
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                : 'bg-[#E8E6DE]/60 dark:bg-[#2C2C29] border-transparent text-[#7A8B7C]'
            }`}
          >
            <User className="w-2.5 h-2.5" />
            <span>{name ? name : 'Name'}</span>
            {name && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />}
          </span>

          {/* Email Status */}
          <span
            id="nlp-extracted-email-chip"
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all ${
              email
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                : 'bg-[#E8E6DE]/60 dark:bg-[#2C2C29] border-transparent text-[#7A8B7C]'
            }`}
          >
            <Mail className="w-2.5 h-2.5" />
            <span className="max-w-[110px] truncate">{email ? email : 'Email'}</span>
            {email && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />}
          </span>

          {/* Password Status */}
          <span
            id="nlp-extracted-password-chip"
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all ${
              password && password.length >= 6
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                : 'bg-[#E8E6DE]/60 dark:bg-[#2C2C29] border-transparent text-[#7A8B7C]'
            }`}
          >
            <Lock className="w-2.5 h-2.5" />
            <span>{password ? '••••••' : 'Password'}</span>
            {password && password.length >= 6 && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />}
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-end gap-2 max-w-[88%]">
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-[#FF4D31] text-white flex items-center justify-center shrink-0 mb-1 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                </div>
              )}

              <div
                className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#FF4D31] text-white rounded-br-xs font-medium'
                    : 'bg-white dark:bg-[#1E1E1C] border border-[#E8E6DE] dark:border-[#2C2C29] text-[#1A1A1A] dark:text-[#F9F8F3] rounded-bl-xs shadow-xs'
                }`}
              >
                {msg.content}

                {/* Extracted Chips Badge */}
                {msg.extractedChips && msg.extractedChips.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#E8E6DE]/60 dark:border-[#2C2C29] flex flex-wrap gap-1.5">
                    {msg.extractedChips.map((chip, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {chip.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Suggested quick reply chips */}
            {msg.role === 'assistant' && msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
              <div className="mt-2 ml-8 flex flex-wrap gap-1.5">
                {msg.suggestedReplies.map((reply, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickReply(reply)}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1E1E1C] hover:bg-[#FF4D31]/10 dark:hover:bg-[#FF4D31]/20 hover:border-[#FF4D31]/50 border border-[#E8E6DE] dark:border-[#2C2C29] text-[#4A4A4A] dark:text-[#A0A09B] hover:text-[#FF4D31] text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{reply}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FF4D31] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-3 h-3 animate-spin" />
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#1E1E1C] border border-[#E8E6DE] dark:border-[#2C2C29] text-[#7A8B7C] flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D31] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D31] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D31] animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[11px] ml-1 font-semibold">Extracting fields...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Direct Completion Action Banner when all fields are ready */}
      {isComplete && (
        <div className="px-4 py-2.5 bg-emerald-500/10 dark:bg-emerald-950/30 border-t border-emerald-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>All registration fields extracted!</span>
          </div>
          <button
            id="nlp-register-direct-btn"
            type="button"
            onClick={(e) => onSubmit(e as any)}
            disabled={isSubmitting}
            className="px-4 py-1.5 rounded-full bg-[#FF4D31] hover:bg-[#E8402A] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Registering...' : 'Create Account →'}</span>
          </button>
        </div>
      )}

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputVal);
        }}
        className="p-2.5 bg-white dark:bg-[#1E1E1C] border-t border-[#E8E6DE] dark:border-[#2C2C29] flex items-center gap-2"
      >
        <input
          id="nlp-registration-chat-input"
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="e.g. My name is Rahul and my email is rahul@example.com..."
          disabled={isProcessing}
          className="flex-1 px-3.5 py-2 rounded-xl bg-[#F9F8F3] dark:bg-[#252522] border border-[#E8E6DE] dark:border-[#2C2C29] text-xs text-[#1A1A1A] dark:text-white placeholder-[#7A8B7C]/70 focus:outline-hidden focus:border-[#FF4D31]"
        />
        <button
          id="nlp-registration-send-btn"
          type="submit"
          disabled={!inputVal.trim() || isProcessing}
          className="p-2 rounded-xl bg-[#FF4D31] hover:bg-[#E8402A] text-white transition-all cursor-pointer disabled:opacity-40"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

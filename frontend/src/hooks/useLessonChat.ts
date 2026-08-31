import { useState } from "react";
import { askLessonAI } from "../api/ai.api";

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  concept?: string;
  timestamp: string;
}

export function useLessonChat(moduleId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const res = await askLessonAI(moduleId, text);
      const aiMsg: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        sender: 'ai',
        text: res.answer,
        concept: res.relatedConcept,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        sender: 'ai',
        text: "I'm having trouble connecting to the lesson AI right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return { messages, isThinking, sendMessage };
}

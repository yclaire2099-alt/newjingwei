import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatDialogueAI } from "@/services/aiService";
import { MessageCircle, Send, Loader2, X, Sparkles, User, Bot, History } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { db, auth, handleFirestoreError, OperationType } from "@/lib/firebase";
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

import { getMaxDialogueTurns } from "@/lib/entitlements";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface DeepDialogueProps {
  divinationId: string;
  question: string;
  interpretation: string;
  onClose: () => void;
  direction?: string;
  onSave?: () => void;
}

export const DeepDialogue: React.FC<DeepDialogueProps> = ({ 
  divinationId, 
  question, 
  interpretation, 
  onClose, 
  direction,
  onSave 
}) => {
  const { profile } = useAuth();
  const maxRounds = getMaxDialogueTurns(profile);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [round, setRound] = useState(1);
  const [sessionId] = useState(() => `dialogue_${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial system message or greeting
    const greetContent = direction 
      ? `针对你的指引：“${direction}”，让我们深入看看这件事。`
      : `你好。通过刚才的卦象，我们已经触碰到了你内心的一角。针对你的困惑：“${question}”，让我们开启一段深度的对话。`;

    const initialMessage: Message = {
      role: "assistant",
      content: `${greetContent}\n\n**第一轮：**\n在刚才的解读中，哪一个“镜子”（现状、内心、阴影、视角）最让你感到意外或触动？为什么？`,
      timestamp: Date.now()
    };
    setMessages([initialMessage]);
    saveSession([initialMessage], 1);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const saveSession = async (newMessages: Message[], currentRound: number) => {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}/readings/${divinationId}/sessions/${sessionId}`;
    try {
      await setDoc(doc(db, path), {
        id: sessionId,
        uid: auth.currentUser.uid,
        divinationId,
        messages: newMessages,
        round: currentRound,
        isComplete: currentRound >= 8,
        timestamp: Date.now(),
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || round > maxRounds) return;

    const userMsg: Message = { role: "user", content: input, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const data = await chatDialogueAI({
        question,
        interpretation,
        messages: messages,
        input,
        round,
        direction
      });

      const assistantMsg: Message = { 
        role: "assistant", 
        content: data.text || "我正在深思，请稍后再试。", 
        timestamp: Date.now() 
      };
      
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      setRound(prev => prev + 1);
      saveSession(finalMessages, round + 1);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "抱歉，由于意念波动（网络错误），我暂时无法回应。请稍后再试。", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-4xl h-[85vh] bg-bg rounded-[48px] border border-ink/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-ink/5 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-ink">深度对话 · 观心叙事</h3>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-2 h-1 rounded-full transition-all",
                        i < round ? "bg-accent w-4" : "bg-ink/10"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-[10px] text-ink/30 font-serif uppercase tracking-widest">Round {Math.min(round, maxRounds)}/{maxRounds}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-ink/5 text-ink/30 hover:text-ink transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 scroll-smooth"
        >
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === "user" ? "self-end flex-row-reverse" : "self-start"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                msg.role === "user" ? "bg-accent text-bg" : "bg-ink text-bg"
              )}>
                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={cn(
                "p-6 rounded-[32px] font-serif text-lg leading-relaxed shadow-sm",
                msg.role === "user" 
                  ? "bg-accent/5 text-ink border border-accent/10 rounded-tr-none" 
                  : "bg-white border border-ink/5 rounded-tl-none"
              )}>
                <div className="prose prose-sm prose-ink max-w-none">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-4 self-start">
              <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-bg">
                <Bot size={14} />
              </div>
              <div className="p-6 rounded-[32px] bg-white border border-ink/5 rounded-tl-none flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-accent" />
                <span className="text-sm font-serif italic text-ink/30">正在深思...</span>
              </div>
            </div>
          )}
          {round > maxRounds && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 bg-accent/5 border border-accent/10 rounded-[40px] text-center flex flex-col items-center gap-6"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <History size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xl font-serif text-ink leading-relaxed">
                  这次照见可以先走到这里。
                </p>
                <p className="text-sm font-serif text-ink/40">
                  如果你愿意继续深入，可以保存这次记录，或升级为「省」，让镜微陪你多走几步。
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => {
                    if (onSave) onSave();
                    onClose();
                  }}
                  className="px-8 py-3 rounded-full bg-ink text-bg font-serif text-sm font-bold tracking-widest hover:scale-105 transition-all"
                >
                  保存这次照见
                </button>
                <button 
                  onClick={() => {
                    window.location.href = "/pricing";
                  }}
                  className="px-8 py-3 rounded-full border border-accent/20 text-accent font-serif text-sm font-bold tracking-widest hover:bg-accent/5 transition-all"
                >
                  了解「省」
                </button>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 rounded-full text-ink/40 font-serif text-sm hover:text-ink transition-all"
                >
                  回到报告
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 border-t border-ink/5 bg-white/50 backdrop-blur-md">
          <div className="relative group">
            <textarea
              rows={1}
              placeholder={round > maxRounds ? "对话已圆满结束" : "在此输入你的感悟或回答..."}
              disabled={isLoading || round > maxRounds}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="w-full p-6 pr-16 rounded-[32px] border border-ink/10 bg-white focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/20 transition-all resize-none font-serif text-lg leading-relaxed shadow-inner disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || round > 8}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-ink text-bg hover:bg-accent transition-all disabled:opacity-20 disabled:hover:bg-ink"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-ink/20 font-serif uppercase tracking-widest">
            <Sparkles size={12} />
            <span>对话将协助你发现新的可能性</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

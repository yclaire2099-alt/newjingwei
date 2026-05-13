import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Divination } from "@/components/IChing/Divination";
import { Interpretation } from "@/components/IChing/Interpretation";
import { MigrationPrompt } from "@/components/IChing/MigrationPrompt";
import { LineType } from "@/lib/iching";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronRight, History as HistoryIcon, User, LogIn, LogOut, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useReadings } from "@/hooks/useReadings";
import { LoginDialog } from "@/components/Auth/LoginDialog";

type AppState = "landing" | "divination" | "interpretation";

export const Home: React.FC = () => {
  const [state, setState] = useState<AppState>("landing");
  const [lines, setLines] = useState<LineType[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { addReading } = useReadings();

  const handleComplete = (newLines: LineType[]) => {
    setLines(newLines);
    setTimeout(() => {
      setState("interpretation");
    }, 1000);
  };

  const startDivination = () => {
    setState("divination");
  };

  const goBack = () => {
    if (state === "divination") setState("landing");
    if (state === "interpretation") setState("divination");
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink selection:bg-accent/10 selection:text-accent">
      <MigrationPrompt />
      
      <header className="flex justify-between items-center px-8 py-6 border-b border-ink/5 sticky top-0 bg-bg/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <Link href="/">
            <div 
              className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-bg font-serif text-sm font-bold cursor-pointer"
            >
              镜
            </div>
          </Link>
          <h1 className="text-xl font-serif font-bold tracking-widest text-ink/80">镜微 · JINGWEI</h1>
        </div>
        
        <nav className="flex items-center gap-8">
          <Link href="/monthly-report">
            <button 
              className="text-xs font-serif tracking-widest uppercase flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
            >
              <Sparkles size={14} />
              <span>月度报告</span>
            </button>
          </Link>
          
          <Link href="/history">
            <button 
              className="text-xs font-serif tracking-widest uppercase flex items-center gap-2 text-ink/40 hover:text-ink/80 transition-colors"
            >
              <HistoryIcon size={14} />
              <span>档案</span>
            </button>
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-ink/80 font-serif font-bold tracking-wider">{user.displayName}</span>
                <button 
                  onClick={() => logout()}
                  className="text-[8px] text-ink/30 hover:text-accent font-serif uppercase tracking-widest transition-colors"
                >
                  退出登录
                </button>
              </div>
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || ""} 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-ink/10"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink/30">
                  <User size={14} />
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginDialogOpen(true)}
              className="px-5 py-2 rounded-full border border-ink/10 text-xs text-ink/60 hover:bg-ink/5 transition-colors font-serif tracking-widest uppercase flex items-center gap-2"
            >
              <LogIn size={14} />
              <span>登录</span>
            </button>
          )}
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {state === "landing" && (
            <motion.section
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto py-24 px-8 flex flex-col items-center text-center gap-20"
            >
              <div className="flex flex-col gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-4 text-accent font-serif tracking-[0.4em] uppercase"
                >
                  <div className="h-px w-8 bg-accent/30" />
                  <span>以卦为镜 · 观心自省</span>
                  <div className="h-px w-8 bg-accent/30" />
                </motion.div>
                
                <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-[1.1] text-ink max-w-4xl">
                  易经非预言之术，<br />
                  而是照见内心模式的明镜。
                </h2>
                
                <p className="text-lg md:text-xl text-ink/40 font-serif max-w-2xl mx-auto leading-relaxed italic">
                  “观乎天文，以察时变；观乎人文，以化成天下。”<br />
                  在这里，卦象是你的投影，AI 是你的回响。
                </p>
              </div>

              <div className="flex flex-col gap-10 w-full max-w-xl relative">
                <div className="absolute -inset-10 border border-ink/5 rounded-[60px] pointer-events-none opacity-50" />
                
                <div className="relative group">
                  <textarea
                    placeholder="闭目静思，在此输入你当下的困惑或意念..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full h-48 p-8 rounded-[40px] border border-ink/10 bg-white/30 backdrop-blur-md focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/20 transition-all resize-none font-serif text-xl leading-relaxed placeholder:text-ink/10 shadow-2xl shadow-ink/5"
                  />
                  <div className="absolute bottom-6 right-8 flex items-center gap-2 text-[10px] text-ink/20 font-serif uppercase tracking-widest pointer-events-none">
                    <Sparkles size={12} />
                    <span>意念凝聚</span>
                  </div>
                </div>

                <button
                  onClick={startDivination}
                  className="group relative px-16 py-8 rounded-full bg-ink text-bg font-serif text-2xl font-bold tracking-[0.2em] overflow-hidden transition-all active:scale-95 shadow-2xl shadow-ink/20 hover:shadow-accent/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative flex items-center justify-center gap-4">
                    进入镜中
                    <ChevronRight size={24} className="opacity-20 group-hover:translate-x-2 transition-transform" />
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 pt-32 border-t border-ink/5 w-full">
                <div className="flex flex-col gap-4 text-left group">
                  <div className="text-xs text-accent/40 font-serif tracking-widest uppercase group-hover:text-accent transition-colors">01 · 现状之镜</div>
                  <h4 className="text-xl font-serif font-bold text-ink/80">观照当下</h4>
                  <p className="text-sm text-ink/40 font-serif leading-relaxed">通过本卦，客观审视你目前所处的外部环境与事态表象。</p>
                </div>
                <div className="flex flex-col gap-4 text-left group">
                  <div className="text-xs text-accent/40 font-serif tracking-widest uppercase group-hover:text-accent transition-colors">02 · 内心之镜</div>
                  <h4 className="text-xl font-serif font-bold text-ink/80">洞察动机</h4>
                  <p className="text-sm text-ink/40 font-serif leading-relaxed">通过互卦，揭示事态核心隐藏的动力，以及你内心深处的真实渴望。</p>
                </div>
                <div className="flex flex-col gap-4 text-left group">
                  <div className="text-xs text-accent/40 font-serif tracking-widest uppercase group-hover:text-accent transition-colors">03 · 通变之道</div>
                  <h4 className="text-xl font-serif font-bold text-ink/80">心理指引</h4>
                  <p className="text-sm text-ink/40 font-serif leading-relaxed">结合阴影与视角之镜，由 AI 提供多维度的深度心理分析与行动启发。</p>
                </div>
              </div>
            </motion.section>
          )}

          {state === "divination" && (
            <motion.section
              key="divination"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto py-20 px-8 flex flex-col items-center gap-12"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <button 
                  onClick={goBack}
                  className="flex items-center gap-2 text-xs text-ink/30 hover:text-ink/60 transition-colors font-serif tracking-widest uppercase mb-4"
                >
                  <ArrowLeft size={14} />
                  <span>返回</span>
                </button>
                <h2 className="text-4xl font-serif font-bold text-ink">镜中观象</h2>
                <p className="text-sm text-ink/40 font-serif max-w-md italic">
                  {question ? `针对意念: "${question}"` : "请保持呼吸平稳，心中默念你的困惑。"}
                </p>
              </div>
              
              <Divination onComplete={handleComplete} />
            </motion.section>
          )}

          {state === "interpretation" && (
            <motion.section
              key="interpretation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="max-w-6xl mx-auto pt-12 px-8 flex items-center justify-between">
                <button 
                  onClick={goBack}
                  className="flex items-center gap-2 text-xs text-ink/30 hover:text-ink/60 transition-colors font-serif tracking-widest uppercase"
                >
                  <ArrowLeft size={14} />
                  <span>重新观照</span>
                </button>
                <div className="text-[10px] text-accent font-serif tracking-[0.3em] uppercase">观心报告 · 正在显现</div>
              </div>
              <Interpretation 
                lines={lines} 
                question={question} 
              />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="px-8 py-12 border-t border-ink/5 bg-white/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-serif font-bold text-ink/60 tracking-widest">镜微 · JINGWEI</div>
            <div className="text-[10px] text-ink/30 font-serif uppercase tracking-widest">© 2026 镜微易经 · 探索内心的无限可能</div>
          </div>
          
          <div className="flex gap-12">
            <div className="flex flex-col gap-3">
              <div className="text-[10px] text-ink/30 font-serif uppercase tracking-widest">关于</div>
              <nav className="flex flex-col gap-1">
                <Link href="/"><span className="text-xs text-ink/50 hover:text-ink font-serif transition-colors cursor-pointer">产品理念</span></Link>
                <Link href="/"><span className="text-xs text-ink/50 hover:text-ink font-serif transition-colors cursor-pointer">方法论</span></Link>
              </nav>
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-[10px] text-ink/30 font-serif uppercase tracking-widest">支持</div>
              <nav className="flex flex-col gap-1">
                <Link href="/"><span className="text-xs text-ink/50 hover:text-ink font-serif transition-colors cursor-pointer">使用指南</span></Link>
                <Link href="/"><span className="text-xs text-ink/50 hover:text-ink font-serif transition-colors cursor-pointer">常见问题</span></Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>

      <LoginDialog 
        isOpen={isLoginDialogOpen} 
        onClose={() => setIsLoginDialogOpen(false)} 
        title="开启并同步你的档案"
        description="登录后，你的每一次内省足迹都将安全同步至云端，永不迷失。"
      />
    </div>
  );
};

export default Home;

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReadings } from "@/hooks/useReadings";
import { useAuth } from "@/hooks/useAuth";
import { Hexagram } from "@/components/IChing/Hexagram";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Star, 
  MessageCircle, 
  ChevronRight, 
  Clock,
  Sparkles,
  BookOpen,
  Gem
} from "lucide-react";
import { Link } from "wouter";
import { HEXAGRAMS } from "@/lib/iching";
import { Interpretation } from "@/components/IChing/Interpretation";
import { cn } from "@/lib/utils";

import { MilestoneInsight } from "@/components/IChing/MilestoneInsight";

export const HistoryPage: React.FC = () => {
  const { readings, insightReports, loading } = useReadings();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeInsightId, setActiveInsightId] = useState<string | null>(null);

  const selectedReading = readings.find(r => r.id === selectedId);
  const activeInsight = insightReports.find(r => r.id === activeInsightId);

  const getMilestoneStatus = () => {
    const count = readings.length;
    if (count === 0) return { title: "尚未留下照见", desc: "每一次起卦，都是与自己的一次对话。", icon: BookOpen };
    if (count < 3) return { title: `已保存 ${count} 次照见`, desc: "继续记录，镜微开始观察你反复出现的模式。", icon: Clock };
    
    const latestInsight = insightReports[0]; // Assuming sorted by desc createdAt
    if (count >= 3 && count < 5) return { 
      title: "第 3 次模式提示已开启", 
      desc: "镜微注意到了一些重复出现的线索。", 
      icon: Sparkles, 
      action: () => setActiveInsightId(insightReports.find(r => r.type === "third_hint")?.id || null) 
    };
    if (count >= 5 && count < 10) return { 
      title: "你的 5 次内省卡已生成", 
      desc: "这是你近期的内在成长轨迹。", 
      icon: Sparkles, 
      action: () => setActiveInsightId(insightReports.find(r => r.type === "five_card")?.id || null) 
    };
    return { 
      title: "长期内省洞察已就绪", 
      desc: "点击查看你的 10 次内省深度总结。", 
      icon: Sparkles, 
      isPremium: true,
      action: () => setActiveInsightId(insightReports.find(r => r.type === "ten_report_preview")?.id || null) 
    };
  };

  const milestone = getMilestoneStatus();
  const MilestoneIcon = milestone.icon;

  return (
    <div className="min-h-screen bg-bg">
      <AnimatePresence>
        {activeInsight && <MilestoneInsight report={activeInsight} onClose={() => setActiveInsightId(null)} />}
      </AnimatePresence>
      
      {/* Header */}
      <header className="sticky top-0 z-[40] bg-bg/80 backdrop-blur-md border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <button className="w-12 h-12 rounded-full border border-ink/5 flex items-center justify-center text-ink/40 hover:text-ink hover:bg-white transition-all">
                <ArrowLeft size={20} />
              </button>
            </Link>
            <div className="flex flex-col">
              <h1 className="text-2xl font-serif font-bold text-ink">我的内省足迹</h1>
              <p className="text-[10px] text-ink/20 font-serif uppercase tracking-[0.3em]">My Introspection Footprints</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <button className="px-5 py-2.5 rounded-full bg-accent/5 border border-accent/20 text-accent font-serif text-xs font-bold tracking-widest hover:bg-accent hover:text-white transition-all flex items-center gap-2">
                <Gem size={14} />
                <span>会员中心</span>
              </button>
            </Link>
            <button className="w-12 h-12 rounded-full border border-ink/5 flex items-center justify-center text-ink/20 hover:text-ink transition-all">
              <Search size={20} />
            </button>
            <button className="w-12 h-12 rounded-full border border-ink/5 flex items-center justify-center text-ink/20 hover:text-ink transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {selectedId ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8"
            >
              <button 
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-2 text-ink/40 hover:text-ink transition-colors font-serif text-sm"
              >
                <ArrowLeft size={16} />
                <span>返回足迹列表</span>
              </button>
              
              <div className="p-8 border border-ink/5 rounded-[40px] bg-white/40 mb-8">
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center gap-2 text-[10px] text-ink/30 font-serif uppercase tracking-widest">
                    {format(selectedReading?.createdAt?.toDate() || new Date(), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-ink leading-tight">
                    {selectedReading?.question}
                  </h2>
                </div>
                <Interpretation 
                  lines={selectedReading?.changingLines as any} 
                  question={selectedReading?.question} 
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                  <Clock className="animate-spin text-ink/10" size={48} />
                  <p className="text-ink/20 font-serif italic">正在寻找足迹...</p>
                </div>
              ) : readings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center gap-8">
                  <div className="w-24 h-24 rounded-full bg-ink/5 flex items-center justify-center text-ink/10">
                    <BookOpen size={48} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xl text-ink/30 font-serif italic">尚未留下观心的足迹</p>
                    <p className="text-sm text-ink/20 font-serif">每一次起卦，都是与自己的一次对话</p>
                  </div>
                  <Link href="/">
                    <button className="px-10 py-5 rounded-full bg-ink text-bg font-serif text-sm tracking-widest hover:scale-105 transition-all">
                      起一卦，照见此刻
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-16">
                  {/* Summary Section / Milestone Trigger */}
                  <div 
                    onClick={milestone.action}
                    className={cn(
                      "p-12 border border-ink/5 rounded-[56px] bg-white/60 relative overflow-hidden group transition-all",
                      milestone.action ? "cursor-pointer hover:bg-white hover:border-accent/20 hover:shadow-2xl" : ""
                    )}
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-accent/10 transition-all duration-1000" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                      <div className="flex flex-col gap-6 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", milestone.isPremium ? "bg-accent text-white" : "bg-accent/5 text-accent")}>
                            <MilestoneIcon size={28} />
                          </div>
                          <div className="flex flex-col">
                            <h2 className="text-3xl font-serif font-bold text-ink leading-tight">
                              {milestone.title}
                            </h2>
                            <p className="text-sm text-ink/40 font-serif leading-relaxed">
                              {milestone.desc}
                            </p>
                          </div>
                        </div>
                        {milestone.action && (
                          <div className="flex items-center gap-2 text-accent font-serif text-xs font-bold tracking-widest group-hover:translate-x-2 transition-transform">
                            <span>点击立即查看</span>
                            <ChevronRight size={14} />
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-[32px] bg-white/40 border border-ink/5 text-center">
                          <div className="text-3xl font-serif font-bold text-ink mb-1">{readings.length}</div>
                          <div className="text-[10px] text-ink/20 font-serif uppercase tracking-widest">总足迹数</div>
                        </div>
                        <div className="p-6 rounded-[32px] bg-white/40 border border-ink/5 text-center">
                          <div className="text-3xl font-serif font-bold text-accent mb-1">
                            {readings.filter(r => r.isStarred).length}
                          </div>
                          <div className="text-[10px] text-ink/20 font-serif uppercase tracking-widest">深度共鸣</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {readings.map((reading, i) => {
                      const hexName = reading.hexagramName;
                      const createdAt = reading.createdAt?.toDate() || new Date();
                      
                      return (
                        <motion.button
                          key={reading.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setSelectedId(reading.id)}
                          className="group relative p-8 border border-ink/5 rounded-[44px] bg-white/40 hover:bg-white hover:border-accent/20 transition-all text-left shadow-sm hover:shadow-xl flex flex-col gap-8"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-bg border border-ink/5 flex items-center justify-center text-ink/20">
                                <Clock size={16} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-ink/20 font-serif uppercase tracking-widest">
                                  {format(createdAt, "MM.dd / HH:mm")}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {reading.isStarred && <Star size={16} className="text-accent fill-accent" />}
                              {reading.dialogueCount > 0 && <MessageCircle size={16} className="text-ink/20" />}
                            </div>
                          </div>

                          <div className="flex items-start gap-8">
                            <div className="w-20 pt-2">
                              <Hexagram lines={reading.changingLines as any} size="sm" />
                            </div>
                            <div className="flex-1 flex flex-col gap-4">
                              <h3 className="text-2xl font-serif font-bold text-ink leading-tight line-clamp-2">
                                {reading.question}
                              </h3>
                              <div className="flex items-center gap-3">
                                <span className="px-4 py-1.5 rounded-full bg-accent/5 text-accent text-[10px] font-serif font-bold tracking-widest">
                                  {hexName}
                                </span>
                                {reading.tags?.slice(0, 2).map((tag, idx) => (
                                  <span key={idx} className="text-[10px] text-ink/20 font-serif italic">
                                    # {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-ink/5 flex items-center justify-between group">
                            <p className="text-xs text-ink/40 font-serif italic line-clamp-1 leading-relaxed pr-8">
                              “{reading.coreReflection || "寻找镜中之像..."}”
                            </p>
                            <ChevronRight size={18} className="text-ink/10 group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

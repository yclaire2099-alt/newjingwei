import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, BookOpen, Quote, ChevronRight } from "lucide-react";
import { InsightReport } from "@/services/readingService";

interface MilestoneInsightProps {
  report: InsightReport;
  onClose: () => void;
}

export const MilestoneInsight: React.FC<MilestoneInsightProps> = ({ report, onClose }) => {
  const isTenReport = report.type.startsWith("ten_report");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto p-12 bg-bg rounded-[56px] shadow-2xl border border-ink/5"
      >
        <button 
          onClick={onClose}
          className="absolute top-10 right-10 text-ink/20 hover:text-ink transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col gap-4 text-center">
            <div className="flex items-center justify-center gap-3 text-accent mb-2">
              <Sparkles size={24} />
              <span className="text-xs font-serif uppercase tracking-[0.4em]">
                {report.type === "third_hint" ? "模式提示" : report.type === "five_card" ? "五次内省卡" : "长期内省洞察"}
              </span>
            </div>
            <h2 className="text-4xl font-serif font-bold text-ink leading-tight">
              {report.title}
            </h2>
          </div>

          {/* Quote/Highlight */}
          <div className="relative p-10 bg-white/40 border border-ink/5 rounded-[40px] italic font-serif text-xl text-ink/60 leading-relaxed text-center">
            <Quote className="absolute top-4 left-4 text-ink/5" size={48} />
            <p className="relative z-10">{report.content}</p>
          </div>

          {/* Structured Data */}
          {report.structuredData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {report.structuredData.themes && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] text-ink/30 font-serif uppercase tracking-widest px-2">发现的主题</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.structuredData.themes.map((t: string, i: number) => (
                      <span key={i} className="px-4 py-2 rounded-full bg-accent/5 text-accent text-xs font-serif">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {report.structuredData.patterns && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] text-ink/30 font-serif uppercase tracking-widest px-2">观察到的模式</h4>
                  <div className="flex flex-col gap-2">
                    {report.structuredData.patterns.map((p: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 text-xs text-ink/40 font-serif leading-relaxed">
                        <div className="w-1 h-1 rounded-full bg-accent/30 mt-1.5 shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer/Action */}
          <div className="pt-8 border-t border-ink/5 flex flex-col items-center gap-6">
            <p className="text-[10px] text-ink/20 font-serif italic text-center max-w-sm">
              这只是一个照见。无论镜中映出什么，最重要的一直是你此时此地的真实感受。
            </p>
            
            {isTenReport && !report.isPaid && (
              <button className="w-full py-6 rounded-full bg-ink text-bg font-serif font-bold tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                <span>解锁完整洞察报告 (¥9.9)</span>
                <ChevronRight size={18} />
              </button>
            )}
            
            {!isTenReport && (
              <button 
                onClick={onClose}
                className="px-10 py-4 rounded-full border border-ink/10 text-ink/40 font-serif text-sm hover:text-ink hover:border-ink transition-all"
              >
                继续我的内省之旅
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

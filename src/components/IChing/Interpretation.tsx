import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hexagram } from "./Hexagram";
import { LineType, HEXAGRAMS, getBinary, getHuGuaLines, getCuoGuaLines, getZongGuaLines } from "@/lib/iching";
import { generateReportAI } from "@/services/aiService";
import { cn } from "@/lib/utils";
import { Loader2, Share2, BookOpen, MessageCircle, Eye, Heart, Ghost, Compass, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { DeepDialogue } from "./DeepDialogue";
import { useAuth } from "@/hooks/useAuth";
import { useReadings } from "@/hooks/useReadings";
import { canSaveMoreReadings } from "@/lib/entitlements";
import { LoginDialog } from "@/components/Auth/LoginDialog";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { BINARY_TO_NUMBER } from "@/lib/iching";

interface InterpretationProps {
  lines: LineType[];
  question?: string;
}

export const Interpretation: React.FC<InterpretationProps> = ({ lines, question }) => {
  const [interpretation, setInterpretation] = useState<string>("");
  const [coreReflection, setCoreReflection] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [showDialogue, setShowDialogue] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [readingSessionId] = useState(() => `sess_${Date.now()}`);

  const { user, profile } = useAuth();
  const { readings, addReading } = useReadings();
  const [, setLocation] = useLocation();

  // Derive the 4 mirrors
  const benLines = lines;
  const huLines = getHuGuaLines(lines);
  const cuoLines = getCuoGuaLines(lines);
  const zongLines = getZongGuaLines(lines);

  const benGua = HEXAGRAMS[getBinary(benLines)];
  const huGua = HEXAGRAMS[getBinary(huLines)];
  const cuoGua = HEXAGRAMS[getBinary(cuoLines)];
  const zongGua = HEXAGRAMS[getBinary(zongLines)];

  useEffect(() => {
    const fetchInterpretation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await generateReportAI({
          question: question || "未提供具体问题",
          benGua: benGua?.name || "未知",
          huGua: huGua?.name || "未知",
          cuoGua: cuoGua?.name || "未知",
          zongGua: zongGua?.name || "未知"
        });

        setInterpretation(data.report || "未能生成解读，请稍后再试。");
        setCoreReflection(data.coreReflection || "每一条足迹都指向同一个你。");
      } catch (err) {
        console.error("AI Error:", err);
        setError("AI 解读生成失败，请检查网络或 API 配置。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterpretation();
  }, [lines, question, benGua, huGua, cuoGua, zongGua]);

  const handleSave = async () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    if (!canSaveMoreReadings(profile, readings.length)) {
      const confirmOverwrite = window.confirm(
        "你的镜微档案已经有 5 次照见。\n免费档案会保留最近 5 条记录。 如果继续保存，最早的一次记录将被覆盖。\n\n如果你愿意，可以升级为「省」，让镜微永久保存你的全部内省足迹。\n\n确定要覆盖并保存吗？"
      );
      if (!confirmOverwrite) {
        setLocation("/pricing");
        return;
      }
    }

    setIsSaving(true);
    try {
      const binary = getBinary(lines);
      const hexNum = BINARY_TO_NUMBER[binary];
      
      await addReading({
        question: question || "无题之思",
        hexagramName: benGua?.name || "未知",
        hexagramNumber: hexNum,
        changingLines: lines,
        report: interpretation,
        coreReflection: interpretation.substring(0, 120),
        tags: [],
        sentiment: "neutral",
        createdAt: null, // services handled
        isStarred: false,
        userNote: reflection || null,
        dialogueCount: 0,
        source: "cloud_created"
      });
      toast.success("观心档案已同步至云端");
    } catch (e) {
      toast.error("保存失败，请检查网络");
    } finally {
      setIsSaving(false);
    }
  };

  const mirrors = [
    { title: "现状之镜", gua: benGua, lines: benLines, icon: Eye, color: "text-ink" },
    { title: "内心之镜", gua: huGua, lines: huLines, icon: Heart, color: "text-accent" },
    { title: "阴影之镜", gua: cuoGua, lines: cuoLines, icon: Ghost, color: "text-blue-600" },
    { title: "视角之镜", gua: zongGua, lines: zongLines, icon: Compass, color: "text-emerald-600" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 flex flex-col gap-12">
      <LoginDialog 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={handleSave}
      />

      <AnimatePresence>
        {showDialogue && (
          <DeepDialogue 
            divinationId={readingSessionId} 
            question={question || "未提供具体问题"} 
            interpretation={interpretation}
            direction={selectedDirection || undefined}
            onClose={() => {
              setShowDialogue(false);
              setSelectedDirection(null);
            }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-12">
        {/* Mirror Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mirrors.map((mirror, i) => (
            <motion.div
              key={mirror.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-8 border border-ink/5 rounded-[40px] bg-white/40 backdrop-blur-md hover:bg-white/60 hover:border-accent/20 transition-all shadow-sm hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className={cn("p-3 rounded-2xl bg-bg border border-ink/5 shadow-inner", mirror.color)}>
                  <mirror.icon size={20} />
                </div>
                <div className="text-[10px] font-serif uppercase tracking-[0.3em] text-ink/20">Mirror {i + 1}</div>
              </div>
              
              <div className="flex flex-col items-center gap-6 mb-8">
                <Hexagram lines={mirror.lines} size="md" className="w-28" />
                <div className="text-center">
                  <h4 className="text-3xl font-serif font-bold text-ink mb-1">{mirror.gua?.name || "未知"}</h4>
                  <p className="text-[10px] text-accent font-serif uppercase tracking-[0.4em]">{mirror.title}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-ink/5 opacity-40 group-hover:opacity-100 transition-opacity">
                <p className="text-[11px] font-serif leading-relaxed text-ink/60 line-clamp-3 italic text-center">
                  “{mirror.gua?.judgment}”
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* New Flow Section */}
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-12">
          {/* 1. Core Reflection */}
          <div className="p-10 lg:p-16 border border-ink/5 rounded-[56px] bg-white/80 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            <div className="flex flex-col items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Sparkles size={24} />
              </div>
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-accent" size={32} />
                  <div className="text-lg text-ink/30 font-serif italic animate-pulse tracking-widest">正在通变...</div>
                </div>
              ) : (
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-ink leading-tight">
                  {coreReflection}
                </h2>
              )}
            </div>
          </div>

          {/* 2. Exploration Directions */}
          {!isLoading && !error && (
            <div className="flex flex-col gap-8">
              <div className="text-center">
                <span className="text-[10px] text-ink/30 font-serif uppercase tracking-[0.4em]">Deep Inquiry</span>
                <h4 className="text-xl font-serif text-ink/60 mt-2">如果你愿意继续看下去，镜微可以陪你从三个方向深入：</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  "这件事真正触动我的是什么？",
                  "我是不是又回到了某个熟悉的模式？",
                  "如果不急着做决定，我现在最需要承认什么？"
                ].map((dir, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedDirection(dir);
                      setShowDialogue(true);
                    }}
                    className="p-8 rounded-[40px] bg-white border border-ink/5 text-ink/60 font-serif text-lg leading-snug hover:border-accent/30 hover:bg-accent/5 hover:text-ink transition-all text-left shadow-sm hover:shadow-md h-full flex items-center"
                  >
                    {dir}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => {
                  setSelectedDirection("陪我再看一层");
                  setShowDialogue(true);
                }}
                className="self-center text-accent font-serif text-sm border-b border-accent/20 pb-1 hover:border-accent transition-all"
              >
                陪我再看一层
              </button>
            </div>
          )}

          {/* 3. Full Report (Expandable) */}
          {!isLoading && !error && (
            <div className="flex flex-col gap-6">
              <button 
                onClick={() => setShowFullReport(!showFullReport)}
                className="w-full py-6 rounded-[32px] border border-ink/5 bg-white/40 text-ink/40 font-serif flex items-center justify-center gap-3 hover:bg-white hover:text-ink transition-all"
              >
                <BookOpen size={18} />
                <span>{showFullReport ? "收起完整镜像报告" : "展开完整镜像报告"}</span>
              </button>
              
              <AnimatePresence>
                {showFullReport && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-10 lg:p-16 border border-ink/5 rounded-[56px] bg-white/60 prose prose-ink max-w-none font-serif text-xl leading-relaxed text-ink/70">
                      <ReactMarkdown>{interpretation}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 4. Action & Reflection */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-6 p-10 border border-ink/5 rounded-[56px] bg-white/40 backdrop-blur-md shadow-xl">
                <div className="flex flex-col gap-2">
                  <h4 className="text-2xl font-serif font-bold text-ink">自我觉察</h4>
                  <p className="text-xs text-ink/40 font-serif">记录你此时此刻的感悟与回响</p>
                </div>
                <textarea
                  placeholder="在此写下你的觉察..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="w-full h-32 p-6 rounded-[32px] border border-ink/5 bg-white/20 focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/20 transition-all resize-none font-serif text-lg leading-relaxed placeholder:text-ink/10"
                />
                <button 
                  disabled={isSaving}
                  onClick={handleSave}
                  className="w-full py-6 rounded-full bg-ink text-bg font-serif text-lg font-bold tracking-widest hover:opacity-90 transition-all shadow-xl shadow-ink/10 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSaving && <Loader2 className="animate-spin" size={20} />}
                  <span>{isSaving ? "正在同步..." : "保存这次照见"}</span>
                </button>
              </div>

              <div className="flex flex-col gap-6 justify-center">
                <p className="text-xl font-serif text-ink/40 italic leading-relaxed px-6">
                  “观心不仅是回顾过去，更是开启未来。每一次真实的照见，都是一次新生的开始。”
                </p>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => {
                      const shareUrl = window.location.origin;
                      const shareText = `我在镜微易经获得了一份观心报告：${benGua?.name}卦。`;
                      if (navigator.share) {
                        navigator.share({
                          title: '镜微易经 · 观心报告',
                          text: shareText,
                          url: shareUrl,
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                        toast.success("链接已复制");
                      }
                    }}
                    className="flex items-center justify-center gap-3 px-8 py-5 rounded-full border border-ink/10 text-sm text-ink/40 hover:text-ink transition-all"
                  >
                    <Share2 size={18} />
                    <span className="font-serif tracking-widest">分享这份观照</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

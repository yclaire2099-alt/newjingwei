import React from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Mail, 
  Compass, 
  Droplets, 
  RotateCw, 
  Eye, 
  Search, 
  ChevronRight, 
  Lock,
  Sparkles,
  Calendar,
  Gem
} from "lucide-react";
import { Link } from "wouter";
import { 
  mockMonthlyPatternReport as report, 
  mockReadings as readings,
  mockMembershipState as membership,
  mockUser as user
} from "@/mocks/mockMonthlyReport";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

// --- Sub-components ---

const MonthlyReportHero = () => (
  <div className="relative pt-24 pb-16 text-center overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl -z-10" />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 px-6"
    >
      <div className="bg-white border border-ink/5 px-6 py-2 rounded-full flex items-center gap-3 shadow-sm">
        <Calendar size={16} className="text-accent" />
        <span className="text-xs font-serif tracking-[0.2em] text-ink/40 uppercase">{report.month}</span>
      </div>
      <h1 className="text-5xl md:text-6xl font-serif font-bold text-ink leading-tight">
        你的月度镜像报告
      </h1>
      <p className="text-ink/40 font-serif italic max-w-lg leading-relaxed">
        “镜中之像，非你之全貌，却是你走过路径的投影。”
      </p>
    </motion.div>
  </div>
);

const MonthlyLetterCard = ({ isPaid }: { isPaid: boolean }) => (
  <motion.section 
    initial={{ opacity: 0, scale: 0.98 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="bg-white/60 border border-ink/5 rounded-[48px] p-8 md:p-16 relative overflow-hidden"
  >
    <div className="absolute top-12 right-12 text-accent/10">
      <Mail size={120} strokeWidth={1} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 rounded-full bg-ink flex items-center justify-center text-bg">
          <Mail size={20} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-ink">致 {user.displayName} 的月度私信</h2>
      </div>
      <div className="prose prose-stone max-w-none">
        <div className="text-ink/60 font-serif leading-[2.2] text-lg whitespace-pre-wrap italic">
          {isPaid ? report.monthlyLetter : `${report.monthlyLetter.slice(0, 150)}...`}
        </div>
      </div>
    </div>
  </motion.section>
);

const CoreThemeCard = () => (
  <div className="flex flex-col gap-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
        <Compass size={20} />
      </div>
      <h3 className="text-sm font-serif font-bold tracking-[0.2em] text-ink/40 uppercase">本月核心主题</h3>
    </div>
    <div className="bg-white border border-ink/5 rounded-[40px] p-8 md:p-12 shadow-sm">
      <h4 className="text-3xl font-serif font-bold text-ink mb-6">{report.coreTheme.title}</h4>
      <p className="text-ink/40 font-serif leading-relaxed mb-8">{report.coreTheme.description}</p>
      <div className="flex flex-wrap gap-3">
        {report.coreTheme.keywords.map((kw, i) => (
          <span key={i} className="px-5 py-2 rounded-full bg-bg border border-ink/5 text-ink/40 text-xs font-serif italic">
            # {kw}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const EmotionalToneCard = () => (
  <div className="flex flex-col gap-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
        <Droplets size={20} />
      </div>
      <h3 className="text-sm font-serif font-bold tracking-[0.2em] text-ink/40 uppercase">月度情绪底色</h3>
    </div>
    <div className="bg-white border border-ink/5 rounded-[40px] p-8 md:p-12 shadow-sm flex flex-col items-center text-center">
      <div 
        className="w-24 h-24 rounded-full blur-2xl mb-8 animate-pulse" 
        style={{ backgroundColor: report.emotionalTone.color, opacity: 0.3 }} 
      />
      <h4 className="text-2xl font-serif font-bold text-ink mb-4">{report.emotionalTone.tone}</h4>
      <p className="text-ink/40 font-serif italic leading-relaxed">{report.emotionalTone.description}</p>
    </div>
  </div>
);

const RepeatedPatternsSection = ({ isPaid }: { isPaid: boolean }) => (
  <section className="py-24">
    <div className="max-w-2xl px-6 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
          <RotateCw size={20} />
        </div>
        <h3 className="text-sm font-serif font-bold tracking-[0.2em] text-ink/40 uppercase">反复出现的模式</h3>
      </div>
      <h2 className="text-4xl font-serif font-bold text-ink">那些由线索连成的路径</h2>
    </div>

    {!isPaid ? (
      <LockedPreviewBlock 
        title="解锁深度模式分析" 
        description="镜微通过分析本月所有起卦记录，识别你下意识的回避与循环。" 
      />
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
        {report.repeatedPatterns.map((pattern, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-10 border border-ink/5 rounded-[44px] bg-white/40 hover:bg-white transition-all shadow-sm group"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-2 h-12 bg-accent rounded-full group-hover:scale-y-110 transition-transform" />
                <h4 className="text-2xl font-serif font-bold text-ink">{pattern.title}</h4>
              </div>
              <p className="text-ink/60 font-serif leading-relaxed italic">“{pattern.description}”</p>
              <div className="pt-6 border-t border-ink/5">
                <span className="text-[10px] text-ink/20 font-serif uppercase tracking-widest mb-4 block">在这些照见中显现：</span>
                <div className="flex flex-col gap-2">
                  {pattern.examples.map((ex, j) => (
                    <div key={j} className="text-xs text-ink/40 font-serif flex items-center gap-2">
                      <ChevronRight size={12} className="text-accent" />
                      <span>{ex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </section>
);

const ChangeObservationCard = ({ isPaid }: { isPaid: boolean }) => (
  <div className="py-24 px-6">
    {!isPaid ? (
      <LockedPreviewBlock 
        title="本月变化观察" 
        description="与上个月相比，你的发问焦点正在悄然发生位移。" 
      />
    ) : (
      <div className="bg-white border border-ink/5 rounded-[48px] p-12 md:p-20 relative overflow-hidden flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-accent/[0.02] animate-pulse" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-accent/5 flex items-center justify-center text-accent mb-12 mx-auto">
            <Eye size={28} />
          </div>
          <h3 className="text-sm font-serif font-bold tracking-[0.2em] text-ink/40 uppercase mb-6">正在发生的变化</h3>
          <h4 className="text-4xl font-serif font-bold text-ink mb-8 leading-tight">{report.changeObservation.title}</h4>
          <p className="text-xl font-serif text-ink/60 leading-relaxed italic max-w-2xl px-4">
            “{report.changeObservation.observation}”
          </p>
        </div>
      </div>
    )}
  </div>
);

const MirrorQuestionCard = () => (
  <div className="py-24 px-6 flex flex-col items-center text-center">
    <div className="w-px h-24 bg-gradient-to-b from-transparent to-accent/20 mb-12" />
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col items-center gap-2">
        <Search size={24} className="text-accent/20" />
        <span className="text-[10px] text-ink/20 font-serif uppercase tracking-widest">镜微给你的一个月度提问</span>
      </div>
      <h4 className="text-3xl md:text-4xl font-serif font-bold text-ink leading-[1.4]">
        {report.mirrorQuestion}
      </h4>
    </div>
    <div className="w-px h-24 bg-gradient-to-t from-transparent to-accent/20 mt-12" />
  </div>
);

const NextMonthInvitationSection = ({ isPaid }: { isPaid: boolean }) => (
  <div className="py-24 px-6 border-t border-ink/5 bg-bg/50">
    {!isPaid ? (
      <LockedPreviewBlock 
        title="下月内省邀请" 
        description="基于本月的模式，为你定制下个月的关注重点。" 
      />
    ) : (
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-16 items-center">
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
              <Sparkles size={20} />
            </div>
            <h3 className="text-sm font-serif font-bold tracking-[0.2em] text-ink/40 uppercase">下月邀请</h3>
          </div>
          <h4 className="text-4xl font-serif font-bold text-ink leading-tight">
            主题：{report.nextMonthInvitation.theme}
          </h4>
          <p className="text-xl font-serif text-ink/60 leading-relaxed italic">
            {report.nextMonthInvitation.invitation}
          </p>
        </div>
        <div className="w-64 h-64 border border-ink/5 rounded-full flex items-center justify-center p-8 text-center text-ink/20 font-serif italic text-sm border-dashed">
          期待在下个周期的镜像中再次遇见你
        </div>
      </div>
    )}
  </div>
);

const MonthlyReadingsTimeline = () => (
  <section className="py-24 px-6">
    <div className="max-w-2xl mb-16">
      <h3 className="text-sm font-serif font-bold tracking-[0.2em] text-ink/40 uppercase mb-4">本月照见列表</h3>
      <p className="text-xl font-serif text-ink italic leading-relaxed">每一个问题，都是一次与真实的触碰。</p>
    </div>
    <div className="flex flex-col gap-4">
      {readings.map((reading, i) => (
        <div 
          key={reading.id}
          className="group p-8 border border-ink/5 rounded-[40px] bg-white/40 hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full border border-ink/5 flex items-center justify-center font-serif italic text-ink/20">
              {i + 1 < 10 ? `0${i + 1}` : i + 1}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-ink/20 font-serif uppercase tracking-widest">
                {format(reading.createdAt.toDate(), "MM 月 dd 日")}
              </span>
              <h5 className="text-xl font-serif font-bold text-ink group-hover:text-accent transition-colors">
                {reading.question}
              </h5>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-4 py-1 rounded-full bg-accent/5 text-accent text-[10px] font-serif font-bold tracking-widest">
              {reading.hexagramName}
            </span>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const MembershipMemoryCTA = () => (
  <section className="py-32 px-6">
    <div className="bg-ink rounded-[64px] p-12 md:p-24 text-center relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-full bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="relative z-10 flex flex-col items-center gap-10 max-w-3xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-accent text-white flex items-center justify-center shadow-2xl">
          <Gem size={32} />
        </div>
        
        <div className="flex flex-col gap-6">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-bg leading-tight">
            让镜微持续记得你
          </h2>
          <div className="flex flex-col gap-4">
            <p className="text-accent font-serif font-bold tracking-[0.2em] uppercase text-sm">
              一次问卦，照见此刻。长期记录，照见模式。
            </p>
            <p className="text-bg/60 font-serif leading-[2] text-lg lg:px-12">
              当你一次次把真实问题留在镜微里，它会开始从这些记录中看见：你反复回到的主题，你一直绕开的情绪，你正在发生的变化，以及那些你自己还没连起来的内在轨迹。
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/pricing" className="px-10 py-5 rounded-full bg-bg text-ink font-serif font-bold text-lg hover:scale-105 transition-all text-center">
            解锁完整月度报告
          </Link>
          <Link href="/pricing" className="px-10 py-5 rounded-full border border-bg/20 text-bg/60 font-serif text-lg hover:bg-bg/5 transition-all text-center">
            了解「省」会员
          </Link>
        </div>
        
        <p className="text-[10px] text-bg/20 font-serif uppercase tracking-[0.3em] mt-8">
          镜微不会替你定义自己，但它会默默记得你
        </p>
      </div>
    </div>
  </section>
);

const LockedPreviewBlock = ({ title, description }: { title: string, description: string }) => (
  <div className="bg-white/40 border border-ink/5 border-dashed rounded-[48px] p-12 text-center flex flex-col items-center gap-6 relative group overflow-hidden">
    <div className="w-16 h-16 rounded-full bg-bg border border-ink/5 flex items-center justify-center text-ink/10 mb-2">
      <Lock size={24} />
    </div>
    <div className="flex flex-col gap-3 max-w-sm">
      <h5 className="text-2xl font-serif font-bold text-ink/40">{title}</h5>
      <p className="text-sm text-ink/20 font-serif leading-relaxed italic">{description}</p>
    </div>
    <Link href="/pricing">
      <button className="flex items-center gap-2 text-accent font-serif text-xs font-bold tracking-widest hover:translate-x-1 transition-transform cursor-pointer">
        <span>升级以解锁</span>
        <ChevronRight size={14} />
      </button>
    </Link>
  </div>
);

// --- Main Page ---

export const MonthlyReportPage: React.FC = () => {
  // Use simple state to toggle member state for testing in preview
  const [isPaid, setIsPaid] = React.useState(membership.isPaidUser);

  return (
    <div className="min-h-screen bg-bg selection:bg-accent selection:text-white">
      {/* Dev Toggle */}
      <div className="fixed bottom-8 left-8 z-[100] flex gap-2">
        <button 
          onClick={() => setIsPaid(!isPaid)}
          className="px-4 py-2 rounded-full bg-ink text-bg text-[10px] font-sans font-bold tracking-widest uppercase hover:bg-accent transition-all shadow-xl"
        >
          {isPaid ? "切换为免费版预览" : "切换为会员版预览"}
        </button>
      </div>

      <header className="fixed top-0 left-0 w-full z-50 bg-bg/80 backdrop-blur-md border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/history">
            <button className="w-12 h-12 rounded-full border border-ink/5 flex items-center justify-center text-ink/40 hover:text-ink hover:bg-white transition-all shadow-sm">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div className="text-center">
            <h2 className="text-sm font-serif font-bold text-ink">{report.month} 周期报告</h2>
            <p className="text-[10px] text-ink/20 font-serif uppercase tracking-widest">Monthly Insight Report</p>
          </div>
          <div className="w-12" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-6xl mx-auto pb-48">
        <MonthlyReportHero />

        <div className="px-6 space-y-32">
          <MonthlyLetterCard isPaid={isPaid} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <CoreThemeCard />
            <EmotionalToneCard />
          </div>

          <RepeatedPatternsSection isPaid={isPaid} />
          
          <ChangeObservationCard isPaid={isPaid} />

          <MirrorQuestionCard />

          <NextMonthInvitationSection isPaid={isPaid} />

          <MonthlyReadingsTimeline />

          {!isPaid && <MembershipMemoryCTA />}
        </div>
      </main>

      <footer className="py-24 border-t border-ink/5 bg-bg/80">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-ink/10 font-serif italic text-sm">
            镜微镜像档案 · 加密存储您的每一次照见
          </p>
        </div>
      </footer>
    </div>
  );
};

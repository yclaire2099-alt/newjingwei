import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { getUserReadings, ReadingRecord } from "@/services/readingService";
import { PRODUCTS, createOrder, processPayment } from "@/services/paymentService";
import { isPaidUser } from "@/lib/entitlements";
import { 
  Check, 
  Infinity as InfinityIcon, 
  History, 
  Sparkles, 
  Zap, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck,
  Gem
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { LoginDialog } from "@/components/Auth/LoginDialog";

export const PricingPage: React.FC = () => {
  const { user, profile, subscriptionTier } = useAuth();
  const [, setLocation] = useLocation();
  const [readings, setReadings] = useState<ReadingRecord[]>([]);
  const [isLoadingOrder, setIsLoadingOrder] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      getUserReadings(user.uid).then(setReadings);
    }
  }, [user]);

  const handlePurchase = async (productId: string) => {
    if (!user) {
      setIsLoginDialogOpen(true);
      return;
    }

    setIsLoadingOrder(productId);
    try {
      const order = await createOrder(productId, user.uid);
      // Simulate payment flow
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating payment processing
      const result = await processPayment(order.orderId, user.uid, productId);
      
      if (result.success) {
        setPaymentSuccess(true);
        toast.success("开启成功");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("支付流程遇到一点阻碍，请稍后再试");
    } finally {
      setIsLoadingOrder(null);
    }
  };

  const themes = readings.flatMap(r => r.tags || []).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full p-12 rounded-[56px] bg-white border border-ink/5 shadow-2xl text-center flex flex-col items-center gap-8"
        >
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <ShieldCheck size={40} />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-serif font-bold text-ink tracking-tight">镜微已经为你保留这段内省足迹</h1>
            <p className="text-lg text-ink/40 font-serif leading-relaxed">
              从现在开始，你的每一次照见，都会成为长期洞察的一部分。
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <button 
              onClick={() => setLocation("/history")}
              className="w-full py-6 rounded-full bg-ink text-bg font-serif text-lg font-bold tracking-widest hover:scale-[1.02] transition-all"
            >
              查看我的镜像档案
            </button>
            <button 
              onClick={() => setLocation("/")}
              className="w-full py-6 rounded-full border border-ink/10 text-ink/40 font-serif text-lg hover:text-ink transition-all"
            >
              继续新的照见
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg selection:bg-accent/10">
      {/* Navigation */}
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto">
        <button 
          onClick={() => setLocation("/")}
          className="p-4 rounded-full border border-ink/5 hover:bg-white transition-all text-ink/40 hover:text-ink"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-[10px] font-serif uppercase tracking-[0.4em] text-ink/30">Member Services</div>
        <div className="w-12 h-12" /> {/* Spacer */}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-24 flex flex-col gap-32">
        {/* Hero Section */}
        <section className="text-center space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-6xl lg:text-8xl font-serif font-bold tracking-tighter text-ink">让镜微持续记得你</h1>
            <p className="text-xl lg:text-3xl font-serif text-ink/30 max-w-3xl mx-auto leading-relaxed">
              一次问卦，照见此刻。<br />
              长期记录，照见模式。
            </p>
          </motion.div>

          {readings.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-10 rounded-[48px] bg-white/40 border border-ink/5 backdrop-blur-xl inline-flex flex-col gap-4"
            >
              <div className="flex items-center justify-center gap-3 text-ink/30">
                <History size={14} />
                <span className="text-sm font-serif">你已经留下了 {readings.length} 次照见</span>
              </div>
              {themes.length > 0 && (
                <div className="text-lg font-serif text-ink/60">
                  其中，镜微开始看见这些主题：
                  <span className="text-ink font-bold ml-2">
                    {themes.join("、")}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </section>

        {/* Entitlements Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <InfinityIcon className="text-accent" />,
              title: "永久保存全部内省足迹",
              desc: "打破 5 次云端记录限制，让时间线成为你的内在史书。"
            },
            {
              icon: <Zap className="text-accent" />,
              title: "每次最多 8 轮继续照见",
              desc: "深度对话轮数扩展，陪你走过最幽微的逻辑转角。"
            },
            {
              icon: <Sparkles className="text-accent" />,
              title: "解锁长期洞察报告",
              desc: "第 10 次记录后自动开启，识别跨越时空的生命模式。"
            },
            {
              icon: <History className="text-accent" />,
              title: "完整历史时间线",
              desc: "按月检索、主题聚类，看见自己在季节流转中的变化。"
            },
            {
              icon: <Gem className="text-accent" />,
              title: "未来月度镜像信",
              desc: "基于深度数据的个人月度内省报告，敬请期待。"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[48px] border border-ink/5 bg-white/60 flex flex-col gap-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-bg border border-ink/5 flex items-center justify-center shadow-inner">
                {item.icon}
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-serif font-bold text-ink">{item.title}</h3>
                <p className="text-sm text-ink/40 leading-relaxed font-serif">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Pricing Selection */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {PRODUCTS.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={cn(
                "p-12 rounded-[56px] border bg-white flex flex-col gap-10 transition-all",
                product.id === "sheng_yearly" ? "border-accent shadow-2xl scale-105 z-10" : "border-ink/5"
              )}
            >
              <div className="space-y-4">
                <h4 className="text-2xl font-serif font-bold text-ink">{product.name}</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-serif text-ink/40">¥</span>
                  <span className="text-5xl font-serif font-bold text-ink">{product.price}</span>
                  {product.type === "subscription" && <span className="text-sm font-serif text-ink/40">/{product.duration === 30 ? "月" : "年"}</span>}
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                {product.id.includes("sheng") ? (
                  <>
                    <FeatureItem text="无限次云端存档" />
                    <FeatureItem text="对话轮数 2 → 8" />
                    <FeatureItem text="全量数据分析报告" />
                  </>
                ) : (
                  <>
                    <FeatureItem text="单次深度行为分析" />
                    <FeatureItem text="全量数据解锁" />
                  </>
                )}
              </div>

              <button 
                onClick={() => handlePurchase(product.id)}
                disabled={!!isLoadingOrder || (subscriptionTier === "sheng" && product.type === "subscription")}
                className={cn(
                  "w-full py-6 rounded-full font-serif text-lg font-bold tracking-widest transition-all flex items-center justify-center gap-3",
                  product.id === "sheng_yearly" ? "bg-accent text-white shadow-xl shadow-accent/20" : "bg-ink text-bg"
                )}
              >
                {isLoadingOrder === product.id ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  subscriptionTier === "sheng" && product.type === "subscription" ? "当前等级" : "立即开启"
                )}
              </button>
            </motion.div>
          ))}
        </section>
      </main>

      <LoginDialog 
        isOpen={isLoginDialogOpen} 
        onClose={() => setIsLoginDialogOpen(false)} 
        title="开启并同步你的档案"
        description="登录后，即可开启专属于你的内省镜像。每一个发现都值得被记住。"
      />
    </div>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 text-ink/60">
    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-accent">
      <Check size={12} />
    </div>
    <span className="text-sm font-serif">{text}</span>
  </div>
);

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

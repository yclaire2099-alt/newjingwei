import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, X, Mail, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = "开启你的内省档案",
  description = "在这里，卦象是你的投影，AI 是你的回响。保存每一份触碰内心的照见。"
}) => {
  const { sendOTP, verifyOTP } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("请输入有效的邮箱地址");
      return;
    }

    setLoading(true);
    try {
      await sendOTP(email);
      setStep("otp");
      toast.success("验证码已发送至您的邮箱");
    } catch (error: any) {
      toast.error(error.message || "获取验证码失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("请输入6位验证码");
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, otp);
      toast.success("登录成功，欢迎来到镜微");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "验证失败，请检查验证码");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await sendOTP(email);
      toast.success("验证码已重新发送");
    } catch (error: any) {
      toast.error("重新发送失败");
    } finally {
      setResending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full max-w-md p-10 bg-bg rounded-[48px] shadow-2xl border border-ink/5"
          >
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 text-ink/20 hover:text-ink transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center gap-8">
              <div className="w-16 h-16 rounded-full bg-ink flex items-center justify-center text-bg shadow-xl">
                {step === "email" ? <Mail size={24} /> : <ShieldCheck size={28} />}
              </div>
              
              <div className="flex flex-col gap-3">
                <h3 className="text-3xl font-serif font-bold text-ink leading-tight">
                  {step === "email" ? title : "输入验证码"}
                </h3>
                <p className="text-ink/40 font-serif leading-relaxed px-4 text-sm">
                  {step === "email" ? description : `已向 ${email} 发送了六位验证码`}
                </p>
              </div>

              <div className="w-full">
                <AnimatePresence mode="wait">
                  {step === "email" ? (
                    <motion.form
                      key="email-form"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onSubmit={handleSendOTP}
                      className="flex flex-col gap-4"
                    >
                      <div className="relative group">
                        <input
                          type="email"
                          placeholder="请输入您的邮箱"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                          className="w-full py-5 px-8 rounded-full border border-ink/10 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/20 transition-all font-serif italic text-lg shadow-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 rounded-full bg-ink text-bg font-serif font-bold text-lg hover:bg-accent transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] disabled:opacity-50"
                      >
                        {loading ? <RefreshCw className="animate-spin" size={20} /> : (
                          <>
                            <span>发送验证码</span>
                            <ArrowRight size={20} />
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="otp-form"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onSubmit={handleVerifyOTP}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex justify-center gap-3">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          disabled={loading}
                          className="w-full py-5 px-8 text-center tracking-[1em] rounded-full border border-ink/10 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent/20 transition-all font-serif font-bold text-2xl shadow-sm italic placeholder:tracking-normal placeholder:font-normal"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 rounded-full bg-ink text-bg font-serif font-bold text-lg hover:bg-accent transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] disabled:opacity-50"
                      >
                        {loading ? <RefreshCw className="animate-spin" size={20} /> : (
                          <>
                            <span>验证并登录</span>
                            <ShieldCheck size={20} />
                          </>
                        )}
                      </button>
                      <div className="flex justify-between items-center px-4 mt-2">
                        <button
                          type="button"
                          onClick={() => setStep("email")}
                          className="text-[10px] text-ink/30 hover:text-ink/60 font-serif uppercase tracking-widest transition-colors"
                        >
                          修改邮箱
                        </button>
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={resending}
                          className="text-[10px] text-accent/60 hover:text-accent font-serif uppercase tracking-widest transition-colors disabled:opacity-30"
                        >
                          {resending ? "正在重新发送..." : "重新发送验证码"}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="pt-6 border-t border-ink/5 w-full">
                <p className="text-[10px] text-ink/20 font-serif tracking-[0.2em] uppercase leading-relaxed">
                  镜微镜像档案 · 加密存储您的每一次照见
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

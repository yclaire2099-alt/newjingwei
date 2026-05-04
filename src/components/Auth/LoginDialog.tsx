import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, X, Chrome } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
  title = "要不要把这次照见留下来？",
  description = "有些问题，今天看是一种答案；过一段时间再看，会照见另一个自己。"
}) => {
  const { login } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await login();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // Just ignore or show a light toast
        return;
      }
      console.error("Login failed", error);
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
              <div className="w-20 h-20 rounded-full bg-ink flex items-center justify-center text-bg shadow-xl">
                <LogIn size={32} />
              </div>
              
              <div className="flex flex-col gap-4">
                <h3 className="text-3xl font-serif font-bold text-ink leading-tight">{title}</h3>
                <p className="text-ink/40 font-serif leading-relaxed px-4">{description}</p>
              </div>

              <div className="w-full flex flex-col gap-4">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-6 rounded-full bg-white border border-ink/10 flex items-center justify-center gap-4 text-ink font-serif font-bold text-lg hover:bg-ink hover:text-bg hover:border-ink transition-all group shadow-sm hover:shadow-xl"
                >
                  <Chrome size={24} className="text-accent group-hover:text-bg transition-colors" />
                  <span>使用 Google 账号继续</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full py-4 text-ink/20 font-serif text-sm hover:text-ink/60 transition-colors"
                >
                  暂时不保存
                </button>
              </div>
              
              <div className="pt-4 border-t border-ink/5 w-full">
                <p className="text-[10px] text-ink/20 font-sans tracking-widest uppercase">
                  镜微镜像档案 · 安全云端存储
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

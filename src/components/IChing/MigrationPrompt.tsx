import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudDownload, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useReadings } from "@/hooks/useReadings";

export const MigrationPrompt: React.FC = () => {
  const { user } = useAuth();
  const { migrate } = useReadings();
  const [localCount, setLocalCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const localDataStr = localStorage.getItem("iching_history");
    if (localDataStr) {
      try {
        const localData = JSON.parse(localDataStr);
        if (Array.isArray(localData) && localData.length > 0) {
          setLocalCount(localData.length);
          // Only show if user is logged in
          if (user) {
            setIsVisible(true);
          }
        }
      } catch (e) {
        console.error("Local data parse error", e);
      }
    }
  }, [user]);

  const handleMigrate = async () => {
    const localDataStr = localStorage.getItem("iching_history");
    if (localDataStr) {
      const localData = JSON.parse(localDataStr);
      await migrate(localData);
      setIsVisible(false);
      // We don't remove local data yet to be safe, but we won't show the prompt again
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[50] w-[calc(100%-48px)] max-w-xl"
        >
          <div className="p-6 bg-white/80 backdrop-blur-xl border border-accent/20 rounded-[32px] shadow-2xl flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center text-accent">
                <CloudDownload size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-serif font-bold text-ink">
                  发现 {localCount} 次历史照见
                </p>
                <p className="text-[10px] text-ink/40 font-serif">
                  要把它们带入你的云端档案吗？
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleMigrate}
                className="px-6 py-3 rounded-full bg-accent text-white text-xs font-serif font-bold tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>带入档案</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-3 text-ink/20 hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

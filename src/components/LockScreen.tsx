import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Unlock, ShieldCheck } from 'lucide-react';
import { useGamepad } from '../hooks/useGamepad';

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [time, setTime] = useState(new Date());
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-updating time
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerUnlock = () => {
    if (isUnlocked || isTransitioning) return;
    
    // Play lock release animation
    setIsUnlocked(true);
    
    // Slide up transition
    setTimeout(() => {
      setIsTransitioning(true);
    }, 700);

    // Final callback to parent to unmount
    setTimeout(() => {
      onUnlock();
    }, 1200);
  };

  // Listen to Gamepad controller A button
  useGamepad((btn) => {
    if (btn === 'A' || btn === 'Start') {
      triggerUnlock();
    }
  });

  // Listen to keyboard 'A' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'a' || e.key === 'Enter') {
        triggerUnlock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUnlocked, isTransitioning]);

  // Motion container variants for elegant, one-at-a-time staggered entry
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.35,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring' as any, stiffness: 70, damping: 16 } 
    },
  };

  return (
    <AnimatePresence>
      {!isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            y: -120,
            scale: 1.01,
            filter: 'blur(12px)',
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
          }}
          className="w-full h-full flex flex-col items-center justify-between py-16 px-6 relative overflow-hidden select-none bg-[#050b0c]"
        >
          {/* Wallpaper: Minimalist Solid with radial gradient fading from top-left corner */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#0b2022_0%,#04090a_70%)]" />

          {/* 1. Header (Padlock, Time) */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative z-10 w-full flex flex-col items-center"
          >
            {/* Padlock Icon */}
            <motion.div variants={itemVariants} className="mb-4">
              <motion.div
                key={isUnlocked ? 'unlocked' : 'locked'}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-500 ${
                  isUnlocked 
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]' 
                    : 'border-brand-icy/20 bg-brand-ink/40 text-brand-frozen/80'
                }`}
              >
                <Unlock className={`w-6 h-6 transition-all duration-300 ${isUnlocked ? 'text-emerald-400 scale-110 opacity-100' : 'opacity-80'}`} />
              </motion.div>
            </motion.div>

            {/* Clean time typography (No Date) */}
            <motion.div variants={itemVariants} className="text-center">
              <h2 className="text-6xl font-light text-brand-frozen tracking-tighter tabular-nums drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </h2>
            </motion.div>
          </motion.div>

          {/* 2. Center User Badge & Action Prompt */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative z-10 flex flex-col items-center justify-center my-auto gap-8"
          >
            {/* User Avatar */}
            <motion.div variants={itemVariants} className="relative p-1">
              <div className={`w-32 h-32 rounded-full border p-1 transition-all duration-500 ${
                isUnlocked 
                  ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.25)]' 
                  : 'border-brand-slate/20 bg-brand-slate/5'
              }`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-brand-ink/40 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" 
                    alt="Alex Morgan" 
                    className="w-full h-full object-cover grayscale opacity-90 brightness-90"
                  />
                </div>
              </div>
            </motion.div>

            {/* Action Prompt */}
            <motion.div variants={itemVariants} className="text-center flex flex-col items-center gap-4">
              <div className="h-6 flex items-center justify-center">
                {isUnlocked ? (
                  <span className="text-emerald-400 font-semibold text-sm tracking-wide uppercase flex items-center gap-1.5 animate-pulse">
                    <ShieldCheck className="w-4 h-4" /> Secure Key Verified
                  </span>
                ) : (
                  <span className="text-brand-frozen font-medium text-base">
                    Welcome back, Alex
                  </span>
                )}
              </div>

              {/* Console unlock button */}
              <button
                onClick={triggerUnlock}
                disabled={isUnlocked}
                className={`group relative overflow-hidden px-8 py-3.5 rounded-full font-semibold text-sm tracking-wider uppercase flex items-center gap-3 transition-all duration-300 ${
                  isUnlocked 
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 cursor-default' 
                    : 'bg-brand-icy text-brand-ink hover:bg-white hover:shadow-[0_0_20px_rgba(194,252,247,0.3)] active:scale-95 cursor-pointer border border-brand-icy'
                }`}
              >
                {isUnlocked ? (
                  <span>Opening...</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Press</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-ink text-brand-icy font-bold text-xs border border-brand-icy/40 shadow-inner group-hover:scale-110 transition-transform">
                      A
                    </span>
                    <span>to Unlock</span>
                  </div>
                )}
              </button>
            </motion.div>
          </motion.div>

          {/* 3. Bottom Footer */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative z-10 h-6"
          >
            {/* Footer space clean and quiet */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

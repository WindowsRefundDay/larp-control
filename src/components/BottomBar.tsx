import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGamepad } from '../hooks/useGamepad';

interface BottomBarProps {
  isRecording?: boolean;
}

export function BottomBar({ isRecording = false }: BottomBarProps) {
  const [activeBtn, setActiveBtn] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const phaseRef = useRef(0);
  
  useGamepad(
    (btn) => setActiveBtn(btn),
    (btn) => setActiveBtn(prev => prev === btn ? null : prev)
  );

  useEffect(() => {
    if (!isRecording) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let active = true;

    const render = () => {
      if (!active) return;
      
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Increment phase for movement (higher speed creates more vibrant waves)
      phaseRef.current += 0.08;
      const phase = phaseRef.current;

      const centerY = height / 2;

      // Draw 3 layers of glowing organic sine waves
      // Wave 1: Primary bright icy aqua (#c2fcf7), higher amplitude
      // Wave 2: Secondary pearl aqua (#85bdbf), lower amplitude, shifted phase
      // Wave 3: Subdued frozen water (#c9fbff), very subtle, wider waves
      const waves = [
        { color: 'rgba(194, 252, 247, 0.85)', amp: 13, freq: 0.045, phaseOffset: 0, lineWidth: 2 },
        { color: 'rgba(133, 189, 191, 0.55)', amp: 9, freq: 0.06, phaseOffset: Math.PI / 3, lineWidth: 1.5 },
        { color: 'rgba(201, 251, 255, 0.3)', amp: 6, freq: 0.025, phaseOffset: -Math.PI / 4, lineWidth: 1 }
      ];

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = w.lineWidth;
        
        // Add subtle shadow glow
        ctx.shadowColor = '#c2fcf7';
        ctx.shadowBlur = isRecording ? 6 : 0;

        for (let x = 0; x < width; x++) {
          // Normalize x to make wave taper off at the edges (bell curve shape)
          const progress = x / width;
          const envelope = Math.sin(progress * Math.PI); // 0 at edges, 1 at center

          // Add some dynamic breathing amplitude modification
          const breathingAmp = w.amp * (0.6 + 0.4 * Math.sin(phase * 0.5));
          
          // Generate complex sine wave
          const y = centerY + Math.sin(x * w.freq + phase + w.phaseOffset) * breathingAmp * envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      active = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isRecording]);

  return (
    <footer className="h-12 flex items-center justify-between px-6 border-t border-brand-slate/30 bg-brand-ink shrink-0 text-xs font-medium tracking-wide">
      <div className="flex items-center gap-8">
        <ControllerButton btn="A" label="HOLD TO SPEAK" color="text-emerald-400" border="border-emerald-500/50" isActive={activeBtn === 'A' || isRecording} />
        <ControllerButton btn="B" label="BACK" color="text-rose-400" border="border-rose-500/50" isActive={activeBtn === 'B'} />
      </div>

      <div className="flex-1 max-w-[280px] h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="waveform"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col items-center justify-center relative"
            >
              <canvas 
                ref={canvasRef} 
                width={260} 
                height={32}
                className="w-full h-full drop-shadow-[0_0_8px_rgba(194,252,247,0.3)]"
              />
              <span className="absolute -bottom-1 text-[8px] tracking-[0.2em] text-brand-icy/60 uppercase font-bold animate-pulse">
                SPEECH ACTIVE
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="buttons"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-8 justify-center"
            >
              <ControllerButton btn="X" label="OPEN ACTIONS" color="text-sky-400" border="border-sky-500/50" isActive={activeBtn === 'X'} />
              <ControllerButton btn="Y" label="SEARCH" color="text-amber-400" border="border-amber-500/50" isActive={activeBtn === 'Y'} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 text-brand-pearl">
        <div className="flex items-center gap-1.5">
          <div className={`px-2 py-0.5 rounded border ${activeBtn === 'LB' ? 'border-brand-icy bg-brand-slate/30 text-brand-frozen' : 'border-brand-slate/30 bg-brand-slate/10'} text-[10px] transition-colors`}>LB</div>
          <div className={`px-2 py-0.5 rounded border ${activeBtn === 'RB' ? 'border-brand-icy bg-brand-slate/30 text-brand-frozen' : 'border-brand-slate/30 bg-brand-slate/10'} text-[10px] transition-colors`}>RB</div>
        </div>
        <span className="text-brand-slate uppercase tracking-wider font-semibold text-[10px]">Switch Panel</span>
      </div>
    </footer>
  );
}

function ControllerButton({ btn, label, color, border, isActive }: { btn: string, label: string, color: string, border: string, isActive?: boolean }) {
  return (
    <div className={`flex items-center gap-2 cursor-pointer transition-colors group ${isActive ? 'text-brand-frozen' : 'text-brand-pearl hover:text-brand-icy'}`}>
      <div className={`w-6 h-6 rounded-full border-2 ${border} flex items-center justify-center font-bold text-xs ${color} ${isActive ? 'scale-110 bg-brand-slate/20 shadow-[0_0_12px_rgba(194,252,247,0.3)] border-brand-icy' : 'group-hover:scale-110'} transition-all`}>
        {btn}
      </div>
      <span className="text-[10px] tracking-wider uppercase font-semibold">{label}</span>
    </div>
  );
}

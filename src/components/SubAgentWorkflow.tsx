import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRightCircle, 
  Loader2, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  FileCode, 
  Brain, 
  Timer,
  Play,
  Settings,
  ListTodo
} from 'lucide-react';
import { SIMULATION_CONFIG } from '../config';

// --- TODOLIST COMPONENT ---
interface TodoItemProps {
  status: 'done' | 'active' | 'pending';
  children: React.ReactNode;
}

export function TodoItem({ status, children }: TodoItemProps) {
  return (
    <div className="flex items-start gap-3 py-1.5 text-sm select-none">
      <div className="mt-0.5 shrink-0">
        {status === 'done' ? (
          <CheckCircle2 className="w-5 h-5 text-brand-slate/60" />
        ) : status === 'active' ? (
          <ArrowRightCircle className="w-5 h-5 text-brand-icy animate-pulse" />
        ) : (
          <Circle className="w-5 h-5 text-brand-slate/40" />
        )}
      </div>
      <span className={`leading-relaxed ${
        status === 'done' 
          ? 'text-brand-slate/50 line-through' 
          : status === 'active' 
          ? 'text-brand-frozen font-semibold' 
          : 'text-brand-slate'
      }`}>
        {children}
      </span>
    </div>
  );
}

interface TodoListProps {
  title: string;
  children: React.ReactNode;
}

export function TodoList({ title, children }: TodoListProps) {
  return (
    <div className="bg-brand-slate/5 border border-brand-slate/20 rounded-xl p-4 my-4 max-w-4xl w-full backdrop-blur-sm shadow-inner">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-brand-slate/10">
        <ListTodo className="w-4 h-4 text-brand-slate/80" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-slate/80">
          {title}
        </h4>
      </div>
      <div className="flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
}


// --- SUB-AGENT BLOCKS ---
interface SubAgentBlockProps {
  name: string;
  detail: string;
  duration?: number; // duration to show running state in ms
  onComplete?: () => void;
}

export function SubAgentBlock({ 
  name, 
  detail, 
  duration = SIMULATION_CONFIG.subAgentBaseDuration * SIMULATION_CONFIG.subAgentDurationMultiplier, 
  onComplete 
}: SubAgentBlockProps) {
  const [status, setStatus] = useState<'pending' | 'running' | 'done'>('pending');

  useEffect(() => {
    // We simulate a sequential execution by starting running after some mounting delay or directly if not controlled.
    setStatus('running');
    const timer = setTimeout(() => {
      setStatus('done');
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex items-start gap-4 p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 my-2 ${
        status === 'running' 
          ? 'bg-brand-icy/5 border-brand-icy/40 shadow-[0_0_15px_rgba(194,252,247,0.05)]' 
          : 'bg-brand-slate/5 border-brand-slate/20'
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {status === 'running' ? (
          <div className="relative">
            <Loader2 className="w-5 h-5 text-brand-icy animate-spin relative z-10" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-brand-frozen">
            {name}
          </span>
          {status === 'running' && (
            <span className="text-[10px] bg-brand-icy/15 text-brand-icy px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
              active
            </span>
          )}
        </div>
        <div className="font-mono text-xs text-brand-slate/80 mt-1 truncate bg-brand-ink/40 p-1.5 rounded border border-brand-slate/10">
          {detail}
        </div>
      </div>
    </motion.div>
  );
}

// Wrapper to sequence children SubAgentBlocks
interface SubAgentBlocksProps {
  children: React.ReactNode;
}

export function SubAgentBlocks({ children }: SubAgentBlocksProps) {
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const childrenArray = React.Children.toArray(children);

  return (
    <div className="flex flex-col gap-2 my-4 max-w-4xl w-full">
      {childrenArray.slice(0, activeChildIndex + 1).map((child, idx) => {
        if (React.isValidElement<SubAgentBlockProps>(child)) {
          return React.cloneElement(child, {
            key: idx,
            onComplete: () => {
              if (idx === activeChildIndex && activeChildIndex < childrenArray.length - 1) {
                // Trigger next agent block after a tiny realistic breather delay
                setTimeout(() => {
                  setActiveChildIndex(prev => prev + 1);
                }, 400);
              }
            }
          });
        }
        return child;
      })}
    </div>
  );
}


// --- BUILD TABLE COMPONENT ---
interface BuildRowProps {
  layer: string;
  command: string;
  result: string;
}

export function BuildRow({ layer, command, result }: BuildRowProps) {
  return (
    <tr className="border-b border-brand-slate/10 hover:bg-brand-slate/5 transition-colors">
      <td className="px-4 py-3 font-semibold text-brand-frozen text-sm">{layer}</td>
      <td className="px-4 py-3 font-mono text-brand-slate/80 text-xs">{command}</td>
      <td className="px-4 py-3 text-emerald-400 text-sm font-medium">{result}</td>
    </tr>
  );
}

interface BuildTableProps {
  children: React.ReactNode;
}

export function BuildTable({ children }: BuildTableProps) {
  return (
    <div className="border border-brand-slate/20 rounded-xl overflow-hidden my-4 max-w-4xl w-full bg-brand-slate/5">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-brand-slate/10 border-b border-brand-slate/20 text-xs font-bold uppercase tracking-wider text-brand-slate">
            <th className="px-4 py-2.5">Layer</th>
            <th className="px-4 py-2.5">Command</th>
            <th className="px-4 py-2.5">Result</th>
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}


// --- FILES LIST DIFF COMPONENT ---
interface FileDiffProps {
  name: string;
  additions: number;
  deletions: number;
}

export function FileDiff({ name, additions, deletions }: FileDiffProps) {
  return (
    <div className="flex items-center justify-between py-1.5 px-3 hover:bg-brand-slate/5 rounded-lg transition-colors text-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <FileCode className="w-4 h-4 text-brand-icy shrink-0" />
        <span className="font-medium text-brand-frozen truncate">{name}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs">
        {additions > 0 && (
          <span className="text-emerald-400">+{additions}</span>
        )}
        {deletions > 0 && (
          <span className="text-rose-400">-{deletions}</span>
        )}
      </div>
    </div>
  );
}

interface FilesListProps {
  title: string;
  children: React.ReactNode;
}

export function FilesList({ title, children }: FilesListProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-brand-slate/20 rounded-xl overflow-hidden my-4 max-w-4xl w-full bg-brand-slate/5 backdrop-blur-sm">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 bg-brand-slate/10 border-b border-brand-slate/20 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-brand-slate" />
          ) : (
            <ChevronRight className="w-4 h-4 text-brand-slate" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-brand-slate">
            {title}
          </span>
        </div>
        <button className="text-[10px] bg-brand-icy/10 text-brand-icy hover:bg-brand-icy/20 px-2 py-0.5 rounded border border-brand-icy/20 uppercase tracking-wider font-bold">
          Review
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 flex flex-col gap-0.5 max-h-60 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

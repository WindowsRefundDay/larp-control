import React from 'react';
import { 
  GitCommit, Monitor, GitBranch, ArrowUpCircle, 
  Github, Clock, Activity, FileDiff, CheckCircle2, ChevronRight 
} from 'lucide-react';

export function RightSidebar() {
  return (
    <aside className="w-[300px] border-l border-brand-slate/30 flex flex-col bg-brand-ink shrink-0 overflow-y-auto p-4 gap-4">
      
      {/* ENVIRONMENT PANEL */}
      <div className="bg-brand-slate/10 border border-brand-slate/20 rounded-xl p-4 flex flex-col gap-3 backdrop-blur-sm shadow-lg">
        <div className="text-[10px] font-semibold tracking-wider text-brand-slate mb-1">ENVIRONMENT</div>
        
        <RightBarItem 
          icon={<FileDiff className="w-4 h-4 text-brand-pearl" />} 
          label="Changes" 
          value={<div className="flex gap-1.5 text-xs font-semibold"><span className="text-brand-icy">+6</span><span className="text-brand-slate">-5</span></div>} 
        />
        <RightBarItem icon={<Monitor className="w-4 h-4 text-brand-pearl" />} label="Local" />
        <RightBarItem icon={<GitBranch className="w-4 h-4 text-brand-pearl" />} label="main" />
        <RightBarItem icon={<ArrowUpCircle className="w-4 h-4 text-brand-pearl" />} label="Commit or push" />
        
        <div className="pt-2 border-t border-brand-slate/20 mt-1">
          <div className="flex items-start justify-between cursor-pointer group">
            <div className="flex items-start gap-3">
              <Github className="w-4 h-4 text-brand-pearl mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm text-brand-frozen group-hover:text-brand-icy transition-colors">Pull request status</span>
                <span className="text-xs text-brand-slate">No open pull requests</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-brand-slate group-hover:text-brand-icy transition-colors" />
          </div>
        </div>
      </div>

      {/* SESSION PANEL */}
      <div className="bg-brand-slate/10 border border-brand-slate/20 rounded-xl p-4 flex flex-col gap-3 backdrop-blur-sm shadow-lg">
        <div className="text-[10px] font-semibold tracking-wider text-brand-slate mb-1">SESSION</div>
        
        <SessionItem icon={<Clock className="w-4 h-4 text-brand-pearl" />} label="Started" value="5:12 PM" />
        <SessionItem icon={<Activity className="w-4 h-4 text-brand-pearl" />} label="Duration" value="44s" />
        <SessionItem icon={<CheckCircle2 className="w-4 h-4 text-brand-icy" />} label="Model" value="Claude Opus 5" />
      </div>

      {/* ACTIVITY PANEL */}
      <div className="bg-brand-slate/10 border border-brand-slate/20 rounded-xl p-4 flex flex-col gap-3 backdrop-blur-sm shadow-lg">
        <div className="text-[10px] font-semibold tracking-wider text-brand-slate mb-1">ACTIVITY</div>
        
        <div className="flex flex-col gap-2.5">
          <ActivityTask label="Scanning repository" status="Completed" />
          <ActivityTask label="Analyzing large files" status="Completed" />
          <ActivityTask label="Cleaning up files" status="Completed" />
          <ActivityTask label="Verifying repository" status="In progress" active />
        </div>
      </div>

    </aside>
  );
}

function RightBarItem({ icon, label, value }: { icon: React.ReactNode, label: string, value?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-brand-pearl group-hover:text-brand-icy transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <div>{value}</div>}
        <ChevronRight className="w-4 h-4 text-brand-slate group-hover:text-brand-icy transition-colors" />
      </div>
    </div>
  );
}

function SessionItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-3 text-brand-pearl">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-brand-frozen font-medium">{value}</span>
    </div>
  );
}

function ActivityTask({ label, status, active }: { label: string, status: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-brand-icy animate-pulse shadow-[0_0_8px_rgba(194,252,247,0.5)]' : 'bg-brand-slate/50'}`} />
        <span className={active ? 'text-brand-frozen font-medium' : 'text-brand-pearl'}>{label}</span>
      </div>
      <span className={active ? 'text-brand-icy text-xs font-semibold' : 'text-brand-pearl text-xs'}>{status}</span>
    </div>
  );
}

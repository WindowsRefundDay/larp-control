import React from 'react';
import { 
  Plus, Clock, Plug, LayoutGrid, GitPullRequest, 
  MessageSquare, Folder, ChevronDown 
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  isOpen?: boolean;
}

export function Sidebar({ isOpen = true }: SidebarProps) {
  return (
    <motion.aside 
      initial={{ width: 256, opacity: 1 }}
      animate={{ 
        width: isOpen ? 256 : 0,
        opacity: isOpen ? 1 : 0,
        borderRightWidth: isOpen ? 1 : 0
      }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className="border-r border-brand-slate/30 flex flex-col bg-brand-ink shrink-0 overflow-y-auto overflow-x-hidden"
    >
      <div className="w-64 p-4 flex flex-col gap-6">
        
        {/* Main Section */}
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-brand-slate mb-2 ml-2">MAIN</div>
          <nav className="flex flex-col gap-0.5">
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-brand-icy/10 text-brand-icy border border-brand-icy/20 w-full text-left cursor-pointer">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Task</span>
            </button>
            
            <SidebarItem icon={<Clock className="w-4 h-4 text-brand-pearl" />} label="Scheduled" />
            <SidebarItem icon={<Plug className="w-4 h-4 text-brand-pearl" />} label="Plugins" />
            <SidebarItem icon={<LayoutGrid className="w-4 h-4 text-brand-pearl" />} label="Sites" />
            <SidebarItem icon={<GitPullRequest className="w-4 h-4 text-brand-pearl" />} label="Pull Requests" />
            <SidebarItem icon={<MessageSquare className="w-4 h-4 text-brand-pearl" />} label="Chat" />
          </nav>
        </div>

        {/* Pinned Section */}
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-brand-slate mb-2 ml-2">PINNED</div>
          <nav className="flex flex-col gap-1">
            <PinnedItem label="Clean up folder size" id="#2" active />
            <PinnedItem label="Push to GitHub" id="#3" />
            <PinnedItem label="Optimize FlowView performance" id="#4" />
            <PinnedItem label="Plan Bluetooth fixes transfer" id="#5" />
            <PinnedItem label="Find device specs" id="#6" />
            
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-slate hover:text-brand-icy transition-colors mt-1 w-full text-left cursor-pointer">
              Show more <ChevronDown className="w-3 h-3" />
            </button>
          </nav>
        </div>

        {/* Projects Section */}
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-brand-slate mb-2 ml-2">PROJECTS</div>
          <nav className="flex flex-col gap-1">
            <ProjectItem label="controllerrow" />
            <ProjectItem label="enloetime" />
            <ProjectItem label="portfolio-site" />
            
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs text-brand-slate hover:text-brand-icy transition-colors mt-1 w-full text-left cursor-pointer">
              Show more <ChevronDown className="w-3 h-3" />
            </button>
          </nav>
        </div>

      </div>
    </motion.aside>
  );
}

function SidebarItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-brand-pearl hover:text-brand-icy hover:bg-brand-slate/20 w-full text-left transition-colors cursor-pointer">
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

function PinnedItem({ label, id, active }: { label: string, id: string, active?: boolean }) {
  return (
    <button className={`flex items-center justify-between px-3 py-1.5 rounded-lg w-full text-left transition-colors text-sm cursor-pointer ${active ? 'bg-brand-slate/20 text-brand-frozen border border-brand-slate/30' : 'text-brand-pearl hover:bg-brand-slate/10 hover:text-brand-frozen'}`}>
      <span className="truncate pr-2">{label}</span>
      <span className="text-xs text-brand-slate shrink-0">{id}</span>
    </button>
  );
}

function ProjectItem({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-brand-pearl hover:bg-brand-slate/10 hover:text-brand-frozen w-full text-left transition-colors text-sm cursor-pointer">
      <Folder className="w-4 h-4 shrink-0 text-brand-slate" />
      <span className="truncate">{label}</span>
    </button>
  );
}

import { Settings, Code, Folder, Plug, Menu } from 'lucide-react';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-brand-slate/30 bg-brand-ink shrink-0">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-brand-pearl hover:text-brand-icy hover:bg-brand-slate/20 transition-colors focus:outline-none flex items-center justify-center"
            title="Toggle Sidebar (Xbox Start / keyboard 'M' or 'S')"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center">
          <span className="text-lg font-semibold tracking-wide text-brand-frozen">controllerrow</span>
        </div>
      </div>

      <nav className="flex items-center gap-1">
        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-icy/10 text-brand-icy border border-brand-icy/20 font-medium text-sm transition-colors cursor-pointer">
          <Code className="w-4 h-4" />
          Workspace
        </button>
        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full text-brand-pearl hover:text-brand-icy hover:bg-brand-slate/20 transition-colors text-sm cursor-pointer">
          <Folder className="w-4 h-4" />
          Projects
        </button>
        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full text-brand-pearl hover:text-brand-icy hover:bg-brand-slate/20 transition-colors text-sm cursor-pointer">
          <Plug className="w-4 h-4" />
          Plugins
        </button>
        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full text-brand-pearl hover:text-brand-icy hover:bg-brand-slate/20 transition-colors text-sm cursor-pointer">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-brand-frozen">Alex Morgan</span>
          <div className="flex items-center gap-1.5">
             <span className="text-[10px] text-brand-pearl">Online</span>
          </div>
        </div>
        <div className="relative">
          <img 
            src="https://i.pravatar.cc/150?u=a042581f4e29026704d" 
            alt="User" 
            className="w-8 h-8 rounded-full border border-brand-slate/40"
          />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-icy border-2 border-brand-ink rounded-full"></div>
        </div>
      </div>
    </header>
  );
}

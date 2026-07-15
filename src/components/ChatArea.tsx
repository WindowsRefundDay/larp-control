import React, { useState, useEffect, useRef } from 'react';
import { Hexagon, Folder, Bot, Loader2 } from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { StreamingMessage } from './StreamingMessage';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: React.ReactNode;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    content: "go ahead and clean it up and also shouldn't the git be uploading to github so i think ur gine"
  },
  {
    id: '2',
    role: 'ai',
    content: (
      <div className="space-y-4 text-brand-frozen">
        <p>Cleaned up successfully. The folder went from about 7.0 GiB to 1.7 GiB, recovering roughly 5.3 GiB.</p>
        <div>
          <p className="mb-2 text-brand-frozen font-medium">Removed:</p>
          <ul className="list-disc pl-5 text-brand-pearl space-y-1">
            <li>Generated Gradle/build outputs</li>
            <li>ROM ZIP duplicates in the root, <code className="bg-brand-slate/20 px-1.5 py-0.5 rounded text-brand-frozen border border-brand-slate/10">build/rom-release/</code>, and <code className="bg-brand-slate/20 px-1.5 py-0.5 rounded text-brand-frozen border border-brand-slate/10">dist/</code></li>
            <li>Device debug captures</li>
            <li>Old system backup image</li>
            <li>Temporary Git pack files</li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-brand-frozen font-medium">Preserved:</p>
          <ul className="list-disc pl-5 text-brand-pearl space-y-1">
            <li>Source changes</li>
            <li>Keys</li>
            <li>Active <code className="bg-brand-slate/20 px-1.5 py-0.5 rounded text-brand-frozen border border-brand-slate/10">.claude</code> worktree</li>
            <li>Git history</li>
          </ul>
        </div>
        <div className="w-full h-px bg-brand-slate/20 my-4" />
        <p>The GitHub remote is configured:</p>
        <code className="block bg-brand-slate/20 p-2.5 rounded-lg text-brand-icy font-mono text-sm border border-brand-slate/10">
          https://github.com/WindowsRefundDay/solar.git
        </code>
        <p className="text-brand-pearl leading-relaxed">
          However, GitHub does not replace the local <code className="bg-brand-slate/20 px-1.5 py-0.5 rounded text-brand-frozen border border-brand-slate/10">.git</code> history; the local repository still keeps its own full history, currently about 1.6 GiB. Shrinking that would require rewriting Git history, which could affect branches and remotes, so I left it intact.
        </p>
      </div>
    )
  }
];

interface ChatAreaProps {
  isUnlocked?: boolean;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export function ChatArea({ isUnlocked = true, onRecordingStateChange }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isSubAgentActive, setIsSubAgentActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Scroll handler to check if user has scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    // If the user is close to the bottom (within 80px), enable auto-scroll.
    // Otherwise, disable it so we don't snap them while reading.
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShouldAutoScroll(isAtBottom);
  };

  // Re-enable auto scroll and scroll immediately when a new message is added or sub-agent state changes
  useEffect(() => {
    setShouldAutoScroll(true);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isSubAgentActive]);

  // Use a MutationObserver to scroll to bottom when contents or size change
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      if (shouldAutoScroll) {
        container.scrollTop = container.scrollHeight;
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observer.disconnect();
  }, [shouldAutoScroll]);

  const handleTranscription = async (text: string) => {
    if (!text.trim()) return;
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsSubAgentActive(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      
      setIsSubAgentActive(false);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: (
          <div className="markdown-body space-y-4 text-brand-frozen">
            <StreamingMessage text={data.response} />
          </div>
        )
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setIsSubAgentActive(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: <p className="text-red-400">Failed to generate response due to an error.</p>
      }]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-brand-ink relative">
      {/* Chat Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-brand-slate/30 shrink-0">
        <div className="flex items-center gap-3">
          <Folder className="w-5 h-5 text-brand-pearl" />
          <h1 className="text-brand-frozen font-medium">Clean up folder size <span className="text-brand-slate text-sm ml-1">#2</span></h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-brand-pearl">
          <span>Worked for 44s</span>
          <div className="w-2 h-2 rounded-full bg-brand-icy" />
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth relative"
      >
        <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-32">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-brand-icy/20 text-brand-icy border border-brand-icy/30 flex items-center justify-center shrink-0 text-sm font-bold">
                    AM
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-slate/20 text-brand-icy border border-brand-slate/30 flex items-center justify-center shrink-0">
                    <Hexagon className="w-5 h-5" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-brand-frozen">
                      {msg.role === 'user' ? 'Alex Morgan' : 'Codex'}
                    </span>
                    <span className="text-xs text-brand-slate">
                      {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {msg.role === 'user' ? (
                    <div className="bg-brand-slate/15 border border-brand-slate/20 rounded-2xl rounded-tl-sm px-4 py-3 text-brand-frozen w-fit max-w-[85%] backdrop-blur-sm shadow-md">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="text-brand-frozen leading-relaxed max-w-[95%]">
                      {msg.content}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isSubAgentActive && (
              <motion.div 
                key="sub-agent"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="flex items-center justify-center py-8"
              >
                <div className="bg-brand-slate/10 border border-brand-icy/30 rounded-2xl p-6 max-w-lg w-full flex flex-col items-center gap-4 shadow-[0_0_40px_rgba(194,252,247,0.15)] backdrop-blur-md">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-brand-ink/80 border-2 border-brand-icy flex items-center justify-center relative z-10">
                      <Bot className="w-8 h-8 text-brand-icy" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-lg font-medium text-brand-frozen flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-icy" />
                      Sub-Agent Active
                    </h3>
                    <p className="text-sm text-brand-pearl mt-1">
                      Analyzing context and executing tasks...
                    </p>
                  </div>
                  
                  <div className="w-full bg-brand-ink/90 rounded-lg p-3 border border-brand-slate/30 mt-2 font-mono text-xs text-brand-icy/70 overflow-hidden h-24 flex flex-col justify-end relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-ink/90 to-transparent z-10 pointer-events-none"></div>
                    <motion.div
                      animate={{ y: [0, -20] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="space-y-1"
                    >
                      <p>Initializing workspace context...</p>
                      <p>Cloning required submodules...</p>
                      <p>Scanning repository tree [782 files]</p>
                      <p>Connecting to external AI provider...</p>
                      <p>Formulating execution plan...</p>
                      <p>Running pre-flight checks...</p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Voice Input Area */}
      <div className="shrink-0 bg-gradient-to-t from-brand-ink via-brand-ink to-transparent pt-4 absolute bottom-0 w-full z-20">
        <VoiceInput onTranscription={handleTranscription} isUnlocked={isUnlocked} onRecordingStateChange={onRecordingStateChange} />
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { ChatArea } from './components/ChatArea';
import { TopBar } from './components/TopBar';
import { BottomBar } from './components/BottomBar';
import { LockScreen } from './components/LockScreen';
import { AnimatePresence, motion } from 'motion/react';
import { useGamepad } from './hooks/useGamepad';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  useGamepad((btn) => {
    if (isUnlocked && btn === 'Start') {
      setIsSidebarOpen(prev => !prev);
    }
  });

  return (
    <div className="flex flex-col h-screen bg-brand-ink text-brand-pearl font-sans overflow-hidden relative">
      <AnimatePresence>
        {!isUnlocked && (
          <motion.div 
            key="lock-screen"
            exit={{ y: "-100%", opacity: 0.5 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-50"
          >
            <LockScreen onUnlock={() => setIsUnlocked(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      <TopBar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        <main className="flex-1 flex flex-col min-w-0 bg-brand-ink">
          <ChatArea isUnlocked={isUnlocked} onRecordingStateChange={setIsRecording} />
        </main>
        <RightSidebar />
      </div>
      <BottomBar isRecording={isRecording} />
    </div>
  );
}

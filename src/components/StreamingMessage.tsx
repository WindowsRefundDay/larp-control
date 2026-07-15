import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { 
  TodoList, 
  TodoItem, 
  SubAgentBlocks, 
  SubAgentBlock, 
  BuildTable, 
  BuildRow, 
  FilesList, 
  FileDiff 
} from './SubAgentWorkflow';
import { SIMULATION_CONFIG } from '../config';

interface StreamingMessageProps {
  text: string;
  onComplete?: () => void;
}

interface Block {
  type: 'text' | 'component';
  tag?: string;
  raw: string;
  content?: string;
}

interface RenderedBlock {
  id: string;
  type: 'text' | 'component';
  tag?: string;
  content?: string;
  raw?: string;
  visibleText?: string;
}

export function StreamingMessage({ text, onComplete }: StreamingMessageProps) {
  const [renderedBlocks, setRenderedBlocks] = useState<RenderedBlock[]>([]);
  const [isDone, setIsDone] = useState(false);
  
  const textRef = useRef(text);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  // Helper to get an attribute value from a raw tag string (e.g. title="To-dos 5")
  const getAttribute = (tagRaw: string, attrName: string) => {
    const regex = new RegExp(`${attrName}="([^"]+)"`, 'i');
    const match = regex.exec(tagRaw);
    return match ? match[1] : '';
  };

  // Split content by custom tag components
  const parseBlocks = (fullText: string): Block[] => {
    const blocks: Block[] = [];
    const regex = /<(TodoList|SubAgentBlocks|BuildTable|FilesList)(\s+[^>]*?)?>([\s\S]*?)<\/\1>/gi;
    
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(fullText)) !== null) {
      const matchIndex = match.index;
      
      // Add preceding text block if non-empty
      if (matchIndex > lastIndex) {
        blocks.push({
          type: 'text',
          raw: fullText.slice(lastIndex, matchIndex)
        });
      }
      
      // Add component block
      blocks.push({
        type: 'component',
        tag: match[1], // e.g. TodoList
        raw: match[0], // full tag including attributes
        content: match[3] // inside contents
      });
      
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < fullText.length) {
      blocks.push({
        type: 'text',
        raw: fullText.slice(lastIndex)
      });
    }
    
    return blocks;
  };

  // Helper to parse inside tags
  const parseTodoItems = (innerHtml: string) => {
    const items: { status: 'done' | 'active' | 'pending'; text: string }[] = [];
    const regex = /<TodoItem\s+status="([^"]+)"\s*>([\s\S]*?)<\/TodoItem>/gi;
    let match;
    while ((match = regex.exec(innerHtml)) !== null) {
      items.push({
        status: match[1] as any,
        text: match[2].trim()
      });
    }
    return items;
  };

  const parseSubAgentBlocks = (innerHtml: string) => {
    const blocks: { name: string; detail: string; duration?: number }[] = [];
    const regex = /<SubAgentBlock\s+name="([^"]+)"\s+detail="([^"]+)"(?:\s+duration="([^"]+)")?\s*\/>/gi;
    let match;
    while ((match = regex.exec(innerHtml)) !== null) {
      blocks.push({
        name: match[1],
        detail: match[2],
        duration: match[3] ? parseInt(match[3]) : undefined
      });
    }
    return blocks;
  };

  const parseBuildRows = (innerHtml: string) => {
    const rows: { layer: string; command: string; result: string }[] = [];
    const regex = /<BuildRow\s+layer="([^"]+)"\s+command="([^"]+)"\s+result="([^"]+)"\s*\/>/gi;
    let match;
    while ((match = regex.exec(innerHtml)) !== null) {
      rows.push({
        layer: match[1],
        command: match[2],
        result: match[3]
      });
    }
    return rows;
  };

  const parseFileDiffs = (innerHtml: string) => {
    const files: { name: string; additions: number; deletions: number }[] = [];
    // Support both additions={number} and additions="number"
    const regex = /<FileDiff\s+name="([^"]+)"\s+additions=(?:{([^}]+)}|"([^"]+)")\s+deletions=(?:{([^}]+)}|"([^"]+)")\s*\/>/gi;
    let match;
    while ((match = regex.exec(innerHtml)) !== null) {
      const additions = parseInt(match[2] || match[3] || '0');
      const deletions = parseInt(match[4] || match[5] || '0');
      files.push({
        name: match[1],
        additions,
        deletions
      });
    }
    return files;
  };

  useEffect(() => {
    let active = true;
    setIsDone(false);

    const sourceBlocks = parseBlocks(textRef.current);
    
    // Create initial structure for streaming blocks
    const initialRendered: RenderedBlock[] = sourceBlocks.map((b, idx) => ({
      id: idx.toString(),
      type: b.type,
      tag: b.tag,
      content: b.content,
      raw: b.raw,
      visibleText: b.type === 'text' ? '' : undefined
    }));

    setRenderedBlocks(initialRendered);

    let currentBlockIdx = 0;
    let currentCharCount = 0;

    const stream = () => {
      if (!active) return;

      if (currentBlockIdx >= sourceBlocks.length) {
        setIsDone(true);
        if (onComplete) onComplete();
        return;
      }

      const currentSourceBlock = sourceBlocks[currentBlockIdx];

      if (currentSourceBlock.type === 'component') {
        // Component blocks are revealed instantly when reached in stream
        setRenderedBlocks(prev => {
          const next = [...prev];
          // We make it active/visible (already populated in list, we just advance the streaming pointer)
          return next;
        });
        
        currentBlockIdx++;
        currentCharCount = 0;
        
        // Brief transition pause before typing continues
        timerRef.current = setTimeout(stream, 400);
      } else {
        // Text block: stream character-by-character (or in organic small chunks)
        const textToType = currentSourceBlock.raw;
        
        if (currentCharCount >= textToType.length) {
          currentBlockIdx++;
          currentCharCount = 0;
          timerRef.current = setTimeout(stream, 50);
          return;
        }

        // Variable chunk size for typing speed pacing
        const baseChunkSize = SIMULATION_CONFIG.streaming.charsPerTick;
        const randomVariance = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const chunkSize = Math.max(1, baseChunkSize + randomVariance);

        const nextCharCount = Math.min(currentCharCount + chunkSize, textToType.length);
        const chunk = textToType.slice(currentCharCount, nextCharCount);
        const nextVisibleText = textToType.slice(0, nextCharCount);

        setRenderedBlocks(prev => {
          return prev.map((b, idx) => {
            if (idx === currentBlockIdx) {
              return { ...b, visibleText: nextVisibleText };
            }
            return b;
          });
        });

        currentCharCount = nextCharCount;

        // Custom punctuation pacing delays for realistic human feel
        let nextDelay = SIMULATION_CONFIG.streaming.baseTickDelayMs + Math.floor(Math.random() * SIMULATION_CONFIG.streaming.tickDelayVarianceMs);
        const lastChar = chunk[chunk.length - 1];
        if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
          nextDelay = SIMULATION_CONFIG.streaming.pacingDelays.sentenceEnd + Math.floor(Math.random() * 80);
        } else if (lastChar === ',' || lastChar === ';' || lastChar === ':') {
          nextDelay = SIMULATION_CONFIG.streaming.pacingDelays.clauseEnd + Math.floor(Math.random() * 40);
        } else if (lastChar === '\n') {
          nextDelay = SIMULATION_CONFIG.streaming.pacingDelays.paragraphEnd + Math.floor(Math.random() * 60);
        }

        timerRef.current = setTimeout(stream, nextDelay);
      }
    };

    timerRef.current = setTimeout(stream, 100);

    return () => {
      active = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, onComplete]);

  // Render the components based on tag type
  const renderComponentBlock = (block: RenderedBlock) => {
    const innerContent = block.content || '';
    const rawTag = block.raw || '';

    switch (block.tag) {
      case 'TodoList': {
        const title = getAttribute(rawTag, 'title') || 'To-dos';
        const items = parseTodoItems(innerContent);
        return (
          <TodoList title={title}>
            {items.map((item, index) => (
              <TodoItem key={index} status={item.status}>
                {item.text}
              </TodoItem>
            ))}
          </TodoList>
        );
      }
      case 'SubAgentBlocks': {
        const blocks = parseSubAgentBlocks(innerContent);
        return (
          <SubAgentBlocks>
            {blocks.map((b, index) => (
              <SubAgentBlock 
                key={index} 
                name={b.name} 
                detail={b.detail} 
                duration={b.duration} 
              />
            ))}
          </SubAgentBlocks>
        );
      }
      case 'BuildTable': {
        const rows = parseBuildRows(innerContent);
        return (
          <BuildTable>
            {rows.map((row, index) => (
              <BuildRow 
                key={index} 
                layer={row.layer} 
                command={row.command} 
                result={row.result} 
              />
            ))}
          </BuildTable>
        );
      }
      case 'FilesList': {
        const title = getAttribute(rawTag, 'title') || 'Files';
        const files = parseFileDiffs(innerContent);
        return (
          <FilesList title={title}>
            {files.map((file, index) => (
              <FileDiff 
                key={index} 
                name={file.name} 
                additions={file.additions} 
                deletions={file.deletions} 
              />
            ))}
          </FilesList>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderedBlocks.map((block, idx) => {
        if (block.type === 'text') {
          // If visibleText is undefined or empty, we don't render it yet to keep layout clean
          if (block.visibleText === '') return null;
          return (
            <div key={block.id} className="markdown-body">
              <Markdown>{block.visibleText}</Markdown>
            </div>
          );
        } else {
          // Check if this component block has been reached/unlocked in the streaming index
          // We only render component blocks if the preceding text block was initiated or they are already processed
          const prevBlocks = renderedBlocks.slice(0, idx);
          const precedingTextTypingStarted = prevBlocks.every(b => b.type !== 'text' || (b.visibleText && b.visibleText.length > 0));
          
          if (!precedingTextTypingStarted) return null;

          return (
            <div key={block.id} className="w-full">
              {renderComponentBlock(block)}
            </div>
          );
        }
      })}
      
      {!isDone && (
        <span className="inline-block w-2 h-4 ml-1 bg-brand-icy rounded shadow-[0_0_8px_rgba(194,252,247,0.6)] animate-pulse" style={{ verticalAlign: 'middle' }} />
      )}
    </div>
  );
}

import { useEffect, useRef } from 'react';

export type ButtonName = 'A' | 'B' | 'X' | 'Y' | 'LB' | 'RB' | 'LT' | 'RT' | 'Select' | 'Start' | 'L3' | 'R3' | 'Up' | 'Down' | 'Left' | 'Right';

const BUTTON_MAPPING: Record<number, ButtonName> = {
  0: 'A', 1: 'B', 2: 'X', 3: 'Y', 4: 'LB', 5: 'RB', 6: 'LT', 7: 'RT',
  8: 'Select', 9: 'Start', 10: 'L3', 11: 'R3', 12: 'Up', 13: 'Down', 14: 'Left', 15: 'Right'
};

// Map keyboard keys to buttons for fallback testing
const KEYBOARD_MAPPING: Record<string, ButtonName> = {
  'a': 'A',
  'b': 'B',
  'x': 'X',
  'y': 'Y',
  'm': 'Start',
  's': 'Start'
};

export function useGamepad(
  onButtonDown?: (button: ButtonName) => void,
  onButtonUp?: (button: ButtonName) => void
) {
  const buttonStates = useRef<boolean[]>(new Array(16).fill(false));
  const requestRef = useRef<number | undefined>(undefined);
  const onButtonDownRef = useRef(onButtonDown);
  const onButtonUpRef = useRef(onButtonUp);

  // Keep refs updated to avoid re-binding event listeners
  useEffect(() => {
    onButtonDownRef.current = onButtonDown;
    onButtonUpRef.current = onButtonUp;
  }, [onButtonDown, onButtonUp]);

  useEffect(() => {
    // Keyboard fallback
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Prevent rapid firing when holding key
      const btn = KEYBOARD_MAPPING[e.key.toLowerCase()];
      if (btn) onButtonDownRef.current?.(btn);
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const btn = KEYBOARD_MAPPING[e.key.toLowerCase()];
      if (btn) onButtonUpRef.current?.(btn);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Gamepad polling loop
    const pollGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      
      for (const gp of gamepads) {
        if (!gp) continue;
        
        for (let i = 0; i < gp.buttons.length; i++) {
          if (i > 15) continue;
          
          const isPressed = gp.buttons[i].pressed;
          const wasPressed = buttonStates.current[i];
          const buttonName = BUTTON_MAPPING[i];

          if (isPressed && !wasPressed) {
            onButtonDownRef.current?.(buttonName);
          } else if (!isPressed && wasPressed) {
            onButtonUpRef.current?.(buttonName);
          }

          buttonStates.current[i] = isPressed;
        }
      }

      requestRef.current = requestAnimationFrame(pollGamepad);
    };

    requestRef.current = requestAnimationFrame(pollGamepad);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
}

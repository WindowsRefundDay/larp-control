/**
 * Configuration file for the Multi-Agent Coding Assistant Simulation.
 * Customize durations, typing speeds, and visual characteristics here.
 */
export const SIMULATION_CONFIG = {
  // Base duration in milliseconds for each sub-agent execution block
  subAgentBaseDuration: 5000, 

  // Multiplier to scale all sub-agent run times (e.g. 1.5 = 50% longer)
  subAgentDurationMultiplier: 1.5,

  // Stream configuration mimicking ChatGPT's typing characteristics (~40 tokens per second)
  streaming: {
    // Average characters printed per timer interval tick (approx 4 chars per token)
    charsPerTick: 3,
    
    // Base delay between ticks in milliseconds (lower = faster)
    baseTickDelayMs: 25,
    
    // Dynamic variance added to each tick delay for human realism
    tickDelayVarianceMs: 15,
    
    // Pacing delays (in ms) for realistic structural reading breathers
    pacingDelays: {
      sentenceEnd: 240, // Period, exclamation, question mark
      clauseEnd: 110,   // Comma, colon, semicolon
      paragraphEnd: 160 // Newlines
    }
  }
};

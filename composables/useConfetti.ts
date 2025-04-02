// composables/useConfetti.ts
import confetti from 'canvas-confetti';

interface ConfettiOptions {
  duration?: number;
  colors?: string[];
  particleCount?: number;
  spread?: number;
  disableForReducedMotion?: boolean;
}

export function useConfetti() {
  // Track active confetti instances for cleanup
  const activeConfettiTimers: number[] = [];

  // Default colors matching the application theme
  const defaultColors = [
    '#EDF1F9', '#BFD5F8', '#82AAF7', '#223466',
    '#F6F1EE', '#EDD5CE', '#C37554', '#712303',
  ];

  // Show winner confetti with configurable options
  const showWinnerConfetti = (options: ConfettiOptions = {}) => {
    const {
      duration = 2500,
      colors = defaultColors,
      particleCount = 15,
      spread = 70,
      disableForReducedMotion = true
    } = options;
    
    // First burst - from top
    const timer1 = window.setTimeout(() => {
      confetti({
        particleCount,
        spread,
        origin: { x: 0.5, y: 0.2 },
        colors,
        disableForReducedMotion
      });
    }, 100);
    
    // Second burst - from left
    const timer2 = window.setTimeout(() => {
      confetti({
        particleCount: Math.round(particleCount * 0.4),
        angle: 60,
        spread: Math.round(spread * 0.8),
        origin: { x: 0.2, y: 0.5 },
        colors,
        disableForReducedMotion
      });
    }, 700);
    
    // Third burst - from right
    const timer3 = window.setTimeout(() => {
      confetti({
        particleCount: Math.round(particleCount * 0.4),
        angle: 120,
        spread: Math.round(spread * 0.8),
        origin: { x: 0.8, y: 0.6 },
        colors,
        disableForReducedMotion
      });
    }, 1400);
    
    // Track timers for cleanup
    activeConfettiTimers.push(timer1, timer2, timer3);
    
    // Return a cleanup function
    return () => {
      [timer1, timer2, timer3].forEach(timer => {
        clearTimeout(timer);
        const index = activeConfettiTimers.indexOf(timer);
        if (index !== -1) {
          activeConfettiTimers.splice(index, 1);
        }
      });
    };
  };

  // Cleanup function to clear all pending confetti
  const clearAllConfetti = () => {
    activeConfettiTimers.forEach(timer => clearTimeout(timer));
    activeConfettiTimers.length = 0;
  };

  // Clean up on component unmount
  onUnmounted(() => {
    clearAllConfetti();
  });

  return {
    showWinnerConfetti,
    clearAllConfetti
  };
}

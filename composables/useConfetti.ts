// composables/useConfetti.ts
import confetti from 'canvas-confetti';

export function useConfetti() {
  const showWinnerConfetti = () => {
    // Create three bursts of confetti with a subtle color scheme
    const duration = 2500;
    const colors = [
      '#EDF1F9', 
      '#BFD5F8',
      '#82AAF7',
      '#223466',

      '#F6F1EE',
      '#EDD5CE',
      '#C37554',
      '#712303',
    ];
    
    // First burst - from top
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.5, y: 0.2 },
        colors,
        disableForReducedMotion: true
      });
    }, 100);
    
    // Second burst - from left
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0.2, y: 0.5 },
        colors,
        disableForReducedMotion: true
      });
    }, 700);
    
    // Third burst - from right
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 0.8, y: 0.6 },
        colors,
        disableForReducedMotion: true
      });
    }, 1400);
  };

  return {
    showWinnerConfetti
  };
}

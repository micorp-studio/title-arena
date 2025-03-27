// composables/useConfetti.ts
import confetti from 'canvas-confetti';

export function useConfetti() {
  const showWinnerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 60, ticks: 480, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 42 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.2, 0.8), y: randomInRange(-0.2, 0.5) } 
      }));
    }, 250);
  };

  return {
    showWinnerConfetti
  };
}

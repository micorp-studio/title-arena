// composables/useVotingHelper.ts
import { ref, computed } from 'vue';
import type { TitleOption } from '~/types';

export function useVotingHelper() {
  // Positive and negative feedback messages
  const positiveMessages = [
    "banger",
    "10/10", 
    "tip top",
    "goated",
    "buzzword",
    "imbattable",
  ];

  const negativeMessages = [
    "nope",
    "meh",
    "pas ouf",
    "ça dégage",
    "boring",
    "on oublie",
    "nul",
    "ciao",
    "éclatax",

  ];

  // Generate a random position for stamps
  const generateRandomPosition = () => {
    const top = `${10 + Math.floor(Math.random() * 60)}%`;
    const left = `${10 + Math.floor(Math.random() * 60)}%`;
    const rotate = `${-20 + Math.floor(Math.random() * 40)}deg`;
    return { top, left, rotate };
  };

  // Choose which card to display the stamp on
  const chooseStampCard = (): 'winner' | 'loser' => {
    return Math.random() < 0.5 ? 'winner' : 'loser';
  };

  // Get a random message
  const getRandomMessage = (positive: boolean): string => {
    const messages = positive ? positiveMessages : negativeMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Generate all possible pairs for voting
  const generatePairs = (options: TitleOption[]): Array<[TitleOption, TitleOption]> => {
    if (!options || options.length < 2) return [];
    
    const pairs: Array<[TitleOption, TitleOption]> = [];
    
    // Create all possible pairs
    for (let i = 0; i < options.length; i++) {
      for (let j = i + 1; j < options.length; j++) {
        pairs.push([options[i], options[j]]);
      }
    }
    
    return shuffleArray(pairs);
  };

  // Shuffle an array randomly
  const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  return {
    positiveMessages,
    negativeMessages,
    generateRandomPosition,
    chooseStampCard,
    getRandomMessage,
    generatePairs,
    shuffleArray
  };
}

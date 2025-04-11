// composables/useVotingHelper.ts
import { ref, computed } from 'vue';
import type { TitleOption } from '~/types';

export function useVotingHelper() {
  const positiveMessages = [
    "banger", "10/10", "tip top", "goated", "buzzword", "imbattable",
  ];

  const negativeMessages = [
    "nope", "meh", "pas ouf", "ça dégage", "boring", "on oublie", 
    "nul", "ciao", "éclatax",
  ];

  const generateRandomPosition = () => {
    const top = `${10 + Math.floor(Math.random() * 60)}%`;
    const left = `${10 + Math.floor(Math.random() * 60)}%`;
    const rotate = `${-20 + Math.floor(Math.random() * 40)}deg`;
    return { top, left, rotate };
  };

  const chooseStampCard = (): 'winner' | 'loser' => {
    return Math.random() < 0.5 ? 'winner' : 'loser';
  };

  const getRandomMessage = (positive: boolean): string => {
    const messages = positive ? positiveMessages : negativeMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generatePairs = (options: TitleOption[]): Array<[TitleOption, TitleOption]> => {
    if (!options || options.length < 2) return [];
    
    const allPairs: Array<[TitleOption, TitleOption]> = [];
    for (let i = 0; i < options.length; i++) {
      for (let j = i + 1; j < options.length; j++) {
        allPairs.push(Math.random() < 0.5 ? [options[i], options[j]] : [options[j], options[i]]);
      }
    }
    
    const shuffledPairs = shuffleArray([...allPairs]);
    if (shuffledPairs.length <= 2) return shuffledPairs;

    const result: Array<[TitleOption, TitleOption]> = [];
    result.push(shuffledPairs[0]);
    
    let lastTitles = new Set([shuffledPairs[0][0].id, shuffledPairs[0][1].id]);
    const candidates = shuffledPairs.slice(1);
    
    while (candidates.length > 0 && result.length < allPairs.length) {
      let foundIndex = -1;
      
      for (let i = 0; i < candidates.length; i++) {
        const pair = candidates[i];
        const pairTitles = new Set([pair[0].id, pair[1].id]);
        
        if (![...pairTitles].some(id => lastTitles.has(id))) {
          foundIndex = i;
          break;
        }
      }
      
      if (foundIndex === -1) {
        foundIndex = 0;
        const repeatedPair = candidates[foundIndex];
        const repeatedIds = [...lastTitles].filter(id => 
          repeatedPair[0].id === id || repeatedPair[1].id === id
        );
        
        if (repeatedIds.length > 0 && repeatedPair[0].id === repeatedIds[0]) {
          candidates[foundIndex] = [repeatedPair[1], repeatedPair[0]];
        }
      }
      
      const nextPair = candidates[foundIndex];
      result.push(nextPair);
      lastTitles = new Set([nextPair[0].id, nextPair[1].id]);
      candidates.splice(foundIndex, 1);
    }
    
    return result;
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

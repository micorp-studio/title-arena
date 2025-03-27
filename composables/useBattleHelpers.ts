// composables/useBattleHelpers.ts
import type { TitleOption } from '~/types';

export function useBattleHelpers() {
  // Format a timestamp into a readable date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format title options into a displayable string
  const formatTitles = (options: TitleOption[]): string => {
    if (!options || options.length === 0) return 'No options';
    
    // Sort by score descending
    const sortedOptions = [...options].sort((a, b) => b.score - a.score);
    
    if (sortedOptions.length <= 2) {
      return sortedOptions.map(opt => opt.content).join(' vs. ');
    }
    
    return `${sortedOptions[0].content} and ${sortedOptions.length - 1} more`;
  };

  // Copy a battle link to the clipboard
  const copyBattleLink = (battleId: string, section: 'vote' | 'results' | 'edit' = 'vote', toast?: any): void => {
    const url = `${window.location.origin}/battles/${battleId}/${section}`;
    navigator.clipboard.writeText(url).then(() => {
      if (toast) {
        toast.add({
          title: 'Link copied',
          description: 'Battle link copied to clipboard',
          color: 'success',
          timeout: 3000
        });
      }
    }).catch((err) => {
      console.error('Failed to copy link:', err);
      if (toast) {
        toast.add({
          title: 'Failed to copy',
          description: 'Could not copy link to clipboard',
          color: 'error',
          timeout: 3000
        });
      }
    });
  };

  // Select two random options for voting
  const getRandomPair = (options: TitleOption[]): [TitleOption, TitleOption] => {
    if (options.length < 2) {
      throw new Error('Need at least 2 options to create a pair');
    }

    // Make a copy to avoid mutating the original
    const shuffled = [...options].sort(() => 0.5 - Math.random());
    return [shuffled[0], shuffled[1]];
  };

  return {
    formatDate,
    formatTitles,
    copyBattleLink,
    getRandomPair
  };
}

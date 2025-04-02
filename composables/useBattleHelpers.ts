// composables/useBattleHelpers.ts
import type { TitleOption } from '~/types';
import { formatDistance, format } from 'date-fns';

export function useBattleHelpers() {
  // Format a timestamp into a readable date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() &&
                   date.getMonth() === now.getMonth() &&
                   date.getFullYear() === now.getFullYear();
    
    // Show relative time if less than 7 days old
    const daysDiff = Math.abs((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 7) {
      return formatDistance(date, now, { addSuffix: true });
    }
    
    // Otherwise show formatted date
    return format(date, isToday ? 'p' : 'MMM d, yyyy');
  };

  // Format title options into a displayable string
  const formatTitles = (options: TitleOption[]): string => {
    if (!options || options.length === 0) return 'No options';
    
    // Sort by score descending - create a copy to avoid mutating the original
    const sortedOptions = [...options].sort((a, b) => b.score - a.score);
    
    if (sortedOptions.length <= 2) {
      return sortedOptions.map(opt => opt.content).join(' vs. ');
    }
    
    return `${sortedOptions[0].content} and ${sortedOptions.length - 1} more`;
  };

  // Enhanced clipboard functionality with better error handling
  const copyToClipboard = async (text: string, toast?: any): Promise<boolean> => {
    try {
      // Check if the Clipboard API is available
      if (!navigator.clipboard) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';  // Avoid scrolling
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful && toast) {
            toast.add({
              title: 'Copied to clipboard',
              description: 'Text copied successfully',
              color: 'primary',
              timeout: 3000
            });
          }
          return successful;
        } catch (err) {
          document.body.removeChild(textArea);
          throw new Error('Failed to copy text');
        }
      }

      // Modern approach with clipboard API
      await navigator.clipboard.writeText(text);
      
      if (toast) {
        toast.add({
          title: 'Copied to clipboard',
          description: 'Text copied successfully',
          color: 'primary',
          timeout: 3000
        });
      }
      
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      
      if (toast) {
        toast.add({
          title: 'Failed to copy',
          description: 'Could not copy text to clipboard',
          color: 'secondary',
          timeout: 3000
        });
      }
      
      return false;
    }
  };

  // Copy a battle link to the clipboard - uses the enhanced copyToClipboard function
  const copyBattleLink = (battleId: string, section: 'vote' | 'results' | 'edit' = 'vote', toast?: any): Promise<boolean> => {
    const url = `${window.location.origin}/battles/${battleId}/${section}`;
    return copyToClipboard(url, toast);
  };

  // Copy title text to clipboard - uses the enhanced copyToClipboard function
  const copyTitleText = (title: string, toast?: any): Promise<boolean> => {
    return copyToClipboard(title, toast);
  };

  // Select two random options for voting with improved edge case handling
  const getRandomPair = (options: TitleOption[]): [TitleOption, TitleOption] | null => {
    if (!options || options.length < 2) {
      return null;
    }

    // Make a copy to avoid mutating the original
    const shuffled = [...options].sort(() => 0.5 - Math.random());
    return [shuffled[0], shuffled[1]];
  };

  // Improved vote count label with proper pluralization
  const getVoteCountLabel = (count: number): string => {
    if (count === 0) return 'No votes yet';
    if (count === 1) return '1 vote';
    return `${count} votes`;
  };

  // Truncate long text with ellipsis
  const truncateText = (text: string, maxLength: number): string => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return {
    formatDate,
    formatTitles,
    copyToClipboard,
    copyBattleLink,
    copyTitleText,
    getRandomPair,
    getVoteCountLabel,
    truncateText
  };
}

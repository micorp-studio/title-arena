// composables/useBattleHelpers.ts
import type { TitleOption } from '~/types';
import { formatDistance, format } from 'date-fns';

const toast = useToast();

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

  const copyToClipboard = async (text: string, withToast: boolean = false): Promise<boolean> => {
      await navigator.clipboard.writeText(text);
      
      if (withToast) {
        toast.add({
          title: 'Copied to clipboard',
          description: 'Text copied successfully',
          color: 'secondary',
        });
      }
      return true;
    };



  // Improved vote count label with proper pluralization
  const getVoteCountLabel = (count: number): string => {
    if (count === 0) return 'No votes yet';
    if (count === 1) return '1 vote';
    return `${count} votes`;
  };


  return {
    formatDate,
    copyToClipboard,
    getVoteCountLabel,
  };
}

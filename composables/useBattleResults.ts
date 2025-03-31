// composables/useBattleResults.ts
import { ref, computed } from 'vue';
import { useBattleDetails } from '~/composables/useBattleApi';
import type { Battle, TitleOption } from '~/types';

export function useBattleResults(battleId: string) {
  const toast = useToast();
  const { state, asyncStatus, refresh } = useBattleDetails();
  
  // Get properly typed battle data
  const battle = computed(() => state.value?.data as Battle | undefined);
  
  // Get sorted options by score (descending)
  const sortedOptions = computed(() => {
    if (!battle.value?.titleOptions) return [];
    
    return [...battle.value.titleOptions]
      .sort((a, b) => b.score - a.score)
      .map((option, index) => ({
        ...option,
        rank: index + 1
      }));
  });
  
  // Check if we have results
  const hasResults = computed(() => sortedOptions.value.length > 0);
  
  // Get the winner
  const winner = computed(() => hasResults.value ? sortedOptions.value[0] : null);
  
  // Random winner message
  const winnerMessage = computed(() => {
    const messages = [
      "Champion",
      "Best Choice",
      "Winner",
      "Top Pick",
      "Perfect"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  });
  
  // Copy title to clipboard
  const copyTitleToClipboard = (title: string) => {
    navigator.clipboard.writeText(title).then(() => {
      toast.add({
        title: 'Title copied',
        description: 'Title copied to clipboard',
        color: 'primary',
        icon: 'i-ph-check-circle'
      });
    }).catch(() => {
      toast.add({
        title: 'Copy failed',
        description: 'Could not copy to clipboard',
        color: 'secondary',
        icon: 'i-ph-warning-circle'
      });
    });
  };


  return {
    battle,
    sortedOptions,
    winner,
    winnerMessage,
    hasResults,
    asyncStatus,
    state,
    copyTitleToClipboard,
    refresh
  };
}

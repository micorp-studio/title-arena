// composables/useVotingSession.ts
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useBattleForVoting, useBattleMutations } from '~/composables/useBattleApi';
import { useVotingHelper } from '~/composables/useVotingHelper';
import type { TitleOption, Battle } from '~/types';

export function useVotingSession(battleId: string) {
  const toast = useToast();
  const router = useRouter();
  
  // Get battle data
  const { state, asyncStatus } = useBattleForVoting();
  
  // Get voting helpers
  const { 
    generateRandomPosition, 
    chooseStampCard, 
    getRandomMessage, 
    generatePairs 
  } = useVotingHelper();

  // Get the vote mutation
  const { 
    submitVote: { mutate: submitVoteMutate } 
  } = useBattleMutations();

  // Animation timing constants
  const ANIMATION_TIMING = {
    VOTE_FEEDBACK: 700,
    CARD_EXIT: 200
  };

  // Flag to track if voting has been initialized
  const isInitialized = ref(false);

  // Voting state
  const remainingPairs = ref<Array<[TitleOption, TitleOption]>>([]);
  const currentPair = ref<{ optionA: TitleOption | null; optionB: TitleOption | null }>({
    optionA: null,
    optionB: null
  });
  const totalPairs = ref(0);
  const completedPairs = ref(0);
  const isVoting = ref(false);
  const completed = ref(false);
  const exitingPair = ref(false);  // Flag for card exit animation

  // Visual feedback state
  const selectedCard = ref<'A' | 'B' | 'AB' | null>(null);
  const rejectedCard = ref<'A' | 'B' | null>(null);
  const stampCard = ref<'winner' | 'loser' | null>(null);
  const stampPosition = ref({ top: '10%', left: '10%', rotate: '0deg' });
  const winnerMessage = ref('');
  const loserMessage = ref('');
  
  // Get properly typed battle data
  const battle = computed(() => state.value?.data as Battle | undefined);
  
  // Progress percentage
  const progressPercentage = computed(() => {
    if (totalPairs.value === 0) return 0;
    return Math.round((completedPairs.value / totalPairs.value) * 100);
  });

  // Initialize voting session - only runs once
  const initVoting = () => {
    // Only initialize once
    if (isInitialized.value) return;

    if (!battle.value || !battle.value.titleOptions || battle.value.titleOptions.length < 2) {
      return;
    }
    
    const pairs = generatePairs(battle.value.titleOptions);
    
    totalPairs.value = pairs.length;
    completedPairs.value = 0;
    remainingPairs.value = pairs;
    completed.value = false;
    
    // Mark as initialized
    isInitialized.value = true;
    
    // Start with first pair
    getNextPair();
  };

  // Get next pair to compare
  const getNextPair = () => {
    if (remainingPairs.value.length === 0) {
      // All pairs completed, redirect to results page
      completed.value = true;
      
      // Redirect to results after a short delay
      setTimeout(() => {
        router.push(`/battles/${battleId}/results`);
      }, 500);
      
      return;
    }
    
    const nextPair = remainingPairs.value.pop();
    if (!nextPair) {
      completed.value = true;
      return;
    }
    
    currentPair.value = {
      optionA: nextPair[0],
      optionB: nextPair[1]
    };

    // Reset visual state
    selectedCard.value = null;
    rejectedCard.value = null;
    
    // Reset exit flag
    exitingPair.value = false;
  };

  // Submit a vote with fixed animation handling
  const submitVote = async (winnerId: string, loserId: string, winnerCard: 'A' | 'B' | 'AB') => {
    if (isVoting.value) return;
    
    isVoting.value = true;
    
    // Set up visual feedback
    selectedCard.value = winnerCard;
    if (winnerCard !== 'AB') { 
      rejectedCard.value = winnerCard === 'A' ? 'B' : 'A';
    }
    
    // Choose which card gets the stamp
    stampCard.value = chooseStampCard();
    
    // Generate stamp content
    winnerMessage.value = getRandomMessage(true);
    loserMessage.value = getRandomMessage(false);
    stampPosition.value = generateRandomPosition();
    
    try {
      // Allow animation to play
      await new Promise(resolve => setTimeout(resolve, ANIMATION_TIMING.VOTE_FEEDBACK));
      
      // Make API call and wait for it to complete
      await submitVoteMutate({
        battleId,
        winnerId,
        loserId,
        winnerCard
      });
      
      // Update progress counter manually
      completedPairs.value += 1;
      
      // Set exiting animation flag
      exitingPair.value = true;
      
      // Wait a moment for exit animation
      await new Promise(resolve => setTimeout(resolve, ANIMATION_TIMING.CARD_EXIT));
      
      // Reset selection state
      selectedCard.value = null;
      rejectedCard.value = null;
      
      // Move to next pair and enable voting again
      getNextPair();
      isVoting.value = false;
      
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.add({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit vote',
        color: 'secondary'
      });
      
      // Reset UI state on error
      selectedCard.value = null;
      rejectedCard.value = null;
      exitingPair.value = false;
      isVoting.value = false;
    }
  };

  // Watch for battle data to initialize voting - ONLY ONCE
  watch(() => battle.value, (newBattle) => {
    if (newBattle && newBattle.titleOptions && newBattle.titleOptions.length >= 2 && !isInitialized.value) {
      initVoting();
    }
  }, { immediate: true });
  
  // Clean up any resources when component unmounts
  onBeforeUnmount(() => {
    // Cancel any pending animations
    if (isVoting.value) {
      isVoting.value = false;
    }
  });

  return {
    // Data
    battle,
    asyncStatus,
    state,
    
    // Voting state
    currentPair,
    totalPairs,
    completedPairs,
    isVoting,
    completed,
    progressPercentage,
    exitingPair,
    
    // Visual feedback
    selectedCard,
    rejectedCard,
    stampCard,
    stampPosition,
    winnerMessage,
    loserMessage,
    
    // Actions
    submitVote
  };
}

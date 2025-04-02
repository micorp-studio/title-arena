<!-- pages/battles/[id]/vote.vue -->
<script setup lang="ts">
import { useVotingSession } from '~/composables/useVotingSession';

definePageMeta({
  layout: 'default'
});

const route = useRoute();
const battleId = computed(() => route.params.id as string);

// Use the voting session composable for all logic
const {
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
} = useVotingSession(battleId.value);
</script>

<template>
  <div class="container mx-auto px-4 py-8 md:py-12">
    <!-- Breadcrumb -->
    <div class="max-w-3xl mx-auto mb-6">
      <UBreadcrumb :items="[
        { label: 'Home', icon: 'i-ph-house', to: '/' },
        { label: battle?.title || 'Battle', icon: 'i-ph-trophy', to: `/battles/${battleId}/results` },
        { label: 'Vote', icon: 'i-ph-check-square' }
      ]" />
    </div>
    
    <!-- Loading state -->
    <div v-if="asyncStatus === 'loading' && !battle" class="max-w-3xl mx-auto">
      <UCard>
        <div class="p-6 space-y-6">
          <USkeleton class="h-6 w-full" />
          <USkeleton class="h-4 w-1/2" />
          
          <!-- Progress skeleton -->
          <USkeleton class="h-6 w-full rounded-full mt-8" />
          
          <!-- Cards skeleton -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <USkeleton class="h-40 rounded-lg" />
            <USkeleton class="h-40 rounded-lg" />
          </div>
        </div>
      </UCard>
    </div>
    
    <!-- Error state -->
    <div v-else-if="state.status === 'error'" class="max-w-3xl mx-auto">
      <UCard>
        <div class="py-8 text-center">
          <UIcon name="i-ph-warning-circle" class="text-warm-300 text-4xl mb-3" />
          <h3 class="font-mono text-xl mb-2">Error Loading Battle</h3>
          <p class="opacity-80">{{ state.error?.message || 'Failed to load battle details' }}</p>
          <UButton color="primary" to="/" class="mt-4">
            Return Home
          </UButton>
        </div>
      </UCard>
    </div>
    
    <!-- Voting interface -->
    <div v-else-if="battle" class="max-w-3xl mx-auto">
      <UCard>
        <!-- Active voting session -->
        <div v-if="!completed && currentPair.optionA && currentPair.optionB" class="py-4">
          <!-- Progress bar -->
          <div class="mb-8">
            <UProgress 
              :model-value="progressPercentage" 
              color="primary"
              size="lg"
              class="mb-2"
            />
            <p class="text-xs text-right font-mono opacity-70">
              {{ completedPairs }} of {{ totalPairs }} duels
            </p>
          </div>
          
          <p class="text-center mb-6 font-medium">Which one do you prefer?</p>
          
          <!-- Card container with transition group -->
          <div 
            class="grid grid-cols-1 md:grid-cols-2 gap-6" 
            :class="{ 'animate-cards-out': exitingPair }"
            role="region"
            aria-label="Voting options"
          >
            <!-- Option A -->
            <VoteCard
              :option="currentPair.optionA"
              :is-selected="selectedCard === 'A'"
              :is-rejected="rejectedCard === 'A'"
              :is-disabled="isVoting"
              :stamp-position="stampPosition"
              :stamp-message="selectedCard === 'A' ? winnerMessage : loserMessage"
              :display-stamp="(selectedCard === 'A' && stampCard === 'winner') || (rejectedCard === 'A' && stampCard === 'loser')"
              :is-positive="selectedCard === 'A'"
              @select="submitVote(currentPair.optionA.id, currentPair.optionB.id, 'A')"
            />
            
            <!-- Option B -->
            <VoteCard
              :option="currentPair.optionB"
              :is-selected="selectedCard === 'B'"
              :is-rejected="rejectedCard === 'B'"
              :is-disabled="isVoting"
              :stamp-position="stampPosition" 
              :stamp-message="selectedCard === 'B' ? winnerMessage : loserMessage"
              :display-stamp="(selectedCard === 'B' && stampCard === 'winner') || (rejectedCard === 'B' && stampCard === 'loser')"
              :is-positive="selectedCard === 'B'"
              @select="submitVote(currentPair.optionB.id, currentPair.optionA.id, 'B')"
            />
          </div>
        </div>
        
        <!-- Not enough options -->
        <div v-else-if="battle.titleOptions?.length < 2" class="py-8 text-center">
          <UIcon name="i-ph-warning-circle" class="text-warm-300 text-4xl mb-3" />
          <h3 class="font-mono text-xl mb-2">Not Enough Options</h3>
          <p class="opacity-80 mb-6">This battle needs at least 2 options to vote.</p>
          
          <UButton 
            :to="`/battles/${battleId}/edit`"
            color="primary"
            icon="i-ph-pencil-simple"
          >
            Edit Battle
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
/* Cards exit animation */
@keyframes cardsOut {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}

@keyframes cardsIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-cards-out {
  animation: cardsOut 0.2s ease-in forwards;
}

.animate-cards-in {
  animation: cardsIn 0.2s ease-in forwards;
}
</style>

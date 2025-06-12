<!-- pages/battles/[id]/vote.vue -->
<script setup lang="ts">
import { useVotingSession } from '~/composables/useVotingSession';
import { useVideoMetadata } from '~/composables/useVideoMetadata';

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


// Our metadata helper
const { getVideoData, preloadMetadata } = useVideoMetadata();

// Current pair metadata (reactive)
const pairMetadata = ref(null);

// Generate a single pair seed that changes with each new pair
const pairSeed = computed(() => {
  return Math.floor(Math.random() * 1000000) + completedPairs.value * 999;
});

// When seed changes, load the metadata
watch(pairSeed, async (newSeed) => {
  pairMetadata.value = await getVideoData(newSeed);

  // Preload the next seed if we know what it will be
  if (completedPairs.value < totalPairs.value - 1) {
    const nextSeed = Math.floor(Math.random() * 1000000) + (completedPairs.value + 1) * 999;
    preloadMetadata(nextSeed);
  }
}, { immediate: true });
</script>

<template>
  <div class="container mx-auto px-4 flex flex-col min-h-screen">
    <!-- Loading state -->
    <div v-if="asyncStatus === 'loading' && !battle" class="max-w-3xl mx-auto w-full py-8">
      <UCard class="ring-0">
        <div class="p-6 space-y-6">
          <USkeleton class="h-6 w-full" />
          <USkeleton class="h-4 w-1/2" />

          <!-- Cards skeleton -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <USkeleton class="h-40 rounded-lg" />
            <USkeleton class="h-40 rounded-lg" />
          </div>

          <!-- Progress skeleton -->
          <USkeleton class="h-6 w-full rounded-full mt-8" />
        </div>
      </UCard>
    </div>

    <!-- Error state -->
    <div v-else-if="state.status === 'error'" class="max-w-3xl mx-auto w-full py-8">
      <UCard>
        <div class="py-8 text-center">
          <UIcon name="i-ph-warning-circle" class="text-warm-300 text-4xl mb-3" />
          <h3 class="text-xl mb-2">Error Loading Battle</h3>
          <p class="opacity-80">{{ state.error?.message || 'Failed to load battle details' }}</p>
          <UButton color="primary" to="/" class="mt-4">
            Return Home
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Voting interface -->
    <div v-else-if="battle" class="max-w-7xl mx-auto w-full flex-1 flex flex-col">
      <div class="flex flex-col h-full justify-between py-8">
        <!-- Top section with voting cards -->
        <UCard class="ring-0 bg-(--ui-yt-800) text-(--ui-yt-200) mb-auto">
          <!-- Active voting session -->
          <div v-if="!completed && currentPair.optionA && currentPair.optionB" class="p-4">
            <!-- Card container with transition group -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6" :class="{ 'animate-cards-out': exitingPair }"
              role="region" aria-label="Voting options">
              <!-- Option A -->
              <VoteCard :option="currentPair.optionA" :battleType="battle.type" :battleTitle="battle.title"
                :metadata="pairMetadata" :is-selected="selectedCard === 'A'"
                :is-rejected="rejectedCard === 'A' || selectedCard === 'AB'" :is-disabled="isVoting"
                :stamp-position="stampPosition" :stamp-message="selectedCard === 'A' ? winnerMessage : loserMessage"
                :display-stamp="(selectedCard === 'A' && stampCard === 'winner') || (rejectedCard === 'A' && stampCard === 'loser')"
                :is-positive="selectedCard === 'A'"
                @select="submitVote(currentPair.optionA.id, currentPair.optionB.id, 'A')" />

              <!-- Option B - Same metadata -->
              <VoteCard :option="currentPair.optionB" :battleType="battle.type" :battleTitle="battle.title"
                :metadata="pairMetadata" :is-selected="selectedCard === 'B'"
                :is-rejected="rejectedCard === 'B' || selectedCard === 'AB'" :is-disabled="isVoting"
                :stamp-position="stampPosition" :stamp-message="selectedCard === 'B' ? winnerMessage : loserMessage"
                :display-stamp="(selectedCard === 'B' && stampCard === 'winner') || (rejectedCard === 'B' && stampCard === 'loser')"
                :is-positive="selectedCard === 'B'"
                @select="submitVote(currentPair.optionB.id, currentPair.optionA.id, 'B')" />
            </div>
            <div class="text-center mt-12 opacity-60">
              <UButton variant="outline" @click="submitVote(currentPair.optionA.id, currentPair.optionB.id, 'AB')"
                :ui="{ base: 'px-8' }">
                kif-kif
              </UButton>
            </div>
          </div>

          <!-- Not enough options -->
          <div v-else-if="battle.titleOptions?.length < 2" class="py-8 text-center">
            <UIcon name="i-ph-warning-circle" class="text-warm-300 text-4xl mb-3" />
            <h3 class="text-xl mb-2">Not Enough Options</h3>
            <p class="opacity-80 mb-6">This battle needs at least 2 options to vote.</p>

            <UButton :to="`/battles/${battleId}/edit`" color="primary" icon="i-ph-pencil-simple">
              Edit Battle
            </UButton>
          </div>
        </UCard>

        <!-- Bottom section with progress bar -->
        <div class="max-w-lg w-full mx-auto mt-12 opacity-50">
          <p class="text-center text-(--ui-yt-200)/80 text-sm mb-4">Quelle vidéo donne le plus envie de cliquer ?</p>
          <UProgress :model-value="progressPercentage" color="primary" size="md" class="mb-2" :ui="{
            base: 'bg-(--ui-yt-600)'
          }" />
          <p class="text-xs text-right text-(--ui-yt-400)">
            {{ totalPairs - completedPairs }} duels restants
          </p>
        </div>
      </div>
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

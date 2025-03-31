<!-- pages/battles/[id]/results.vue -->
<script setup lang="ts">
import { h, onMounted, nextTick } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import { useBattleResults } from '~/composables/useBattleResults';
import { useConfetti } from '~/composables/useConfetti';
import type { TitleOption } from '~/types';

definePageMeta({
  layout: 'default'
});

// Extended TitleOption type with rank
interface RankedTitleOption extends TitleOption {
  rank?: number;
}

const route = useRoute();
const battleId = computed(() => route.params.id as string);
const { showWinnerConfetti } = useConfetti();

// Get battle results
const {
  battle,
  sortedOptions,
  winner,
  winnerMessage,
  hasResults,
  asyncStatus,
  state,
  copyTitleToClipboard,
} = useBattleResults(battleId.value);

// Table columns for results
const columns: TableColumn<RankedTitleOption>[] = [
  {
    id: 'rank',
    header: 'Rank',
    cell: ({ row }) => {
      const rank = row.original.rank;
      const opacity = rank === 1 ? '100' : 
                     rank === 2 ? '90' : 
                     rank === 3 ? '80' : '70';
      
      return h('div', { class: `text-center font-mono text-cold-500 opacity-${opacity}` }, rank);
    },
    meta: {
      class: {
        th: 'w-16 text-center',
        td: 'text-center'
      }
    }
  },
  {
    accessorKey: 'content',
    header: 'Title',
    cell: ({ row }) => {
      const rank = row.original.rank;
      const content = row.original.content;
      
      // Determine font weight based on rank
      const fontWeight = rank === 1 ? 'font-medium' : 
                         rank === 2 ? 'font-normal' : '';
      
      // Determine opacity based on rank
      const opacity = rank === 1 ? '100' : 
                     rank === 2 ? '90' : 
                     rank === 3 ? '80' : '70';
      
      // Create tooltip component for "Click to copy" message
      const UTooltip = resolveComponent('UTooltip');
      
      return h(UTooltip, { text: "Click to copy" }, () =>
        h('button', { 
          class: `${fontWeight} text-cold-500 opacity-${opacity} cursor-pointer`,
          onClick: () => copyTitleToClipboard(content),
        }, content)
      );
    },
  },
  {
    accessorKey: 'score',
    header: 'Score',
    cell: ({ row }) => {
      const rank = row.original.rank;
      const score = row.original.score;
      
      // Determine opacity based on rank
      const opacity = rank === 1 ? '100' : 
                     rank === 2 ? '90' : 
                     rank === 3 ? '80' : '70';
      
      return h('div', { 
        class: `text-right font-mono text-cold-500 opacity-${opacity}`
      }, score);
    },
    meta: {
      class: {
        th: 'text-right w-24',
        td: 'text-right'
      }
    }
  }
];

// Trigger confetti on mount if we have a winner
onMounted(async () => {
  if (winner.value) {
    await nextTick();
    showWinnerConfetti();
  }
});

// Watch for winner changes (in case of data refresh)
watch(() => winner.value, async (newWinner) => {
  if (newWinner) {
    await nextTick();
    showWinnerConfetti();
  }
}, { immediate: false });
</script>

<template>
  <div class="container mx-auto px-4 py-8 md:py-12">
    <!-- Breadcrumb -->
    <div class="max-w-3xl mx-auto mb-6">
      <UBreadcrumb :items="[
        { label: 'Home', icon: 'i-ph-house', to: '/' },
        { label: battle?.title || 'Battle', icon: 'i-ph-trophy' },
        { label: 'Results', icon: 'i-ph-ranking' }
      ]" />
    </div>
    
    <!-- Loading state -->
    <div v-if="asyncStatus === 'loading' && !battle" class="max-w-3xl mx-auto">
      <UCard>
        <div class="py-8 text-center">
          <div class="animate-pulse mb-4">
            <div class="h-8 w-64 bg-white/10 rounded-md mx-auto"></div>
            <div class="h-4 w-40 bg-white/5 rounded-md mx-auto mt-2"></div>
          </div>
          <p class="opacity-80">Loading battle results...</p>
        </div>
      </UCard>
    </div>
    
    <!-- Error state -->
    <div v-else-if="state.status === 'error'" class="max-w-3xl mx-auto">
      <UCard>
        <div class="py-8 text-center">
          <UIcon name="i-ph-warning-circle" class="text-warm-300 text-4xl mb-3" />
          <h3 class="font-mono text-xl mb-2">Error Loading Results</h3>
          <p class="opacity-80">{{ state.error?.message || 'Failed to load battle results' }}</p>
          <UButton color="primary" to="/" class="mt-4">
            Return Home
          </UButton>
        </div>
      </UCard>
    </div>
    
    <!-- Results content -->
    <div v-else-if="battle" class="max-w-3xl mx-auto">
      <UCard>
        <template #header>
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h1 class="text-xl font-bold font-mono">{{ battle.title }}</h1>
              <p class="text-sm opacity-70">{{ battle.voteCount || 0 }} votes</p>
            </div>
            
            <div class="flex gap-2">
              <UButton
                :to="`/battles/${battleId}/edit`"
                color="neutral"
                variant="ghost"
                icon="i-ph-pencil-simple"
              >
                Edit Battle
              </UButton>
            </div>
          </div>
        </template>
        
        <!-- Winner spotlight using UCard -->
        <div v-if="winner" id="confetti-container" class="mb-6 mt-2">
          <UCard
            variant="subtle"
            class="text-center bg-gradient-to-b from-cold-400/5 to-cold-400/0 border-col-500/50"
          >
            <!-- Trophy icon -->
            <div class="flex justify-center mb-3">
              <UIcon name="i-ph-trophy" class="text-4xl text-warm-500" />
            </div>
            
            <!-- Winner badge -->
            <div class="mb-3">
              <span class="px-3 py-0.5 text-xs font-bold bg-warm-500/10 text-warm-500 rounded-full">
                {{ winnerMessage }}
              </span>
            </div>
            
            <!-- Winner title with tooltip -->
            <UTooltip text="Click to copy">
              <button 
                class="text-xl font-medium text-warm-500 mb-2 cursor-pointer" 
                @click="copyTitleToClipboard(winner.content)"
              >
                {{ winner.content }}
              </button>
            </UTooltip>
            
            <p class="text-sm font-mono text-warm-500/90">
              Score: {{ winner.score }}
            </p>
          </UCard>
        </div>
        
        <!-- Results table -->
        <UTable 
          :columns="columns"
          :data="sortedOptions"
          :ui="{
            base: 'min-w-full text-left rtl:text-right',
            thead: 'border-b border-white/5',
            tr: 'hover:bg-white/2 transition-colors',
            th: 'px-4 py-3 text-sm opacity-70 font-medium',
            td: 'px-4 py-3'
          }"
        >
          <!-- Empty state -->
          <template #empty>
            <div class="text-center py-8">
              <UIcon name="i-ph-chart-line-down" class="text-5xl mb-4 opacity-40" />
              <h3 class="text-lg font-medium mb-2">No results yet</h3>
              <p class="text-sm opacity-80 mb-4">
                This battle hasn't received any votes yet
              </p>
              
              <UButton
                :to="`/battles/${battleId}/vote`"
                color="primary"
                icon="i-ph-check-square"
              >
                Start Voting
              </UButton>
            </div>
          </template>
        </UTable>
        
        <template #footer>
          <div class="flex justify-end items-center gap-4">
            <UButton 
              :to="`/battles/${battleId}/vote`"
              color="neutral"
              variant="ghost"
              icon="i-ph-arrow-clockwise"
            >
              Vote again
            </UButton>
            <UButton
              :to="`/`"
              color="primary"
              variant="subtle"
              icon="i-ph-arrow-left"
            >
              Back to Home
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

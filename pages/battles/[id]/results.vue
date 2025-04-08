<!-- pages/battles/[id]/results.vue -->
<script setup lang="ts">
import { h, onMounted, nextTick } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import { useBattleDetails } from '~/composables/useBattleApi';
import { useBattleHelpers } from '~/composables/useBattleHelpers';
import { useConfetti } from '~/composables/useConfetti';
import type { TitleOption } from '~/types';

definePageMeta({
  layout: 'default',
  pageTransition: {
    name: 'slide-left'
  }
});

// Extended TitleOption type with rank
interface RankedTitleOption extends TitleOption {
  rank?: number;
}

const route = useRoute();
const battleId = computed(() => route.params.id as string);
const { showWinnerConfetti, clearAllConfetti } = useConfetti();
const { copyTitleText, truncateText } = useBattleHelpers();
const toast = useToast();

// Get battle details
const { state, asyncStatus, refresh } = useBattleDetails();

// Get properly typed battle data
const battle = computed(() => state.value?.data as any);

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

// Helper function to create a tooltip with copy functionality
const createCopyTooltip = (content: string, rank: number) => {
  const UTooltip = resolveComponent('UTooltip');
  const opacity = rank === 1 ? '100' : 
                 rank === 2 ? '90' : 
                 rank === 3 ? '80' : '70';
  
  return h(UTooltip, { text: "Click to copy" }, () =>
    h('button', { 
      class: `truncate text-cold-500 max-w-full inline-block text-left cursor-pointer opacity-${opacity} hover:bg-cold-200/20 transition-colors`,
      onClick: () => copyTitleText(content, toast),
    }, content)
  );
};

// Table columns for results with truncation for long content
const columns: TableColumn<RankedTitleOption>[] = [
  {
    id: 'rank',
    header: 'Rank',
    cell: ({ row }) => {
      const rank = row.original.rank;
      const opacity = rank === 1 ? '100' : 
                     rank === 2 ? '90' : 
                     rank === 3 ? '80' : '70';
      
      return h('div', { class: `text-center text-(--ui-yt-200) opacity-${opacity}` }, rank);
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
      
      // Use a container div to handle long content with truncation
      return h('div', { class: 'max-w-md overflow-hidden' }, [
        createCopyTooltip(content, rank || 0)
      ]);
    },
    meta: {
      class: {
        td: 'max-w-md break-words'
      }
    }
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
        class: `text-right text-(--ui-yt-200) opacity-${opacity}`
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

// Clean up confetti on component unmount
onBeforeUnmount(() => {
  clearAllConfetti();
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
      <UCard class="ring-0">
        <div class="p-6 space-y-6">
          <div class="flex justify-between items-center">
            <div>
              <USkeleton class="h-6 w-48 mb-2" />
              <USkeleton class="h-4 w-24" />
            </div>
            <USkeleton class="h-10 w-32 rounded-md" />
          </div>
          
          <!-- Winner skeleton -->
          <USkeleton class="h-36 w-full rounded-lg mb-6" />
          
          <!-- Table skeleton -->
          <div class="space-y-3">
            <div class="flex items-center gap-4 p-2">
              <USkeleton class="h-6 w-12" />
              <USkeleton class="h-6 flex-1" />
              <USkeleton class="h-6 w-16" />
            </div>
            <div v-for="i in 3" :key="i" class="flex items-center gap-4 p-2">
              <USkeleton class="h-6 w-12" />
              <USkeleton class="h-6 flex-1" />
              <USkeleton class="h-6 w-16" />
            </div>
          </div>
          
          <!-- Footer skeleton -->
          <div class="flex justify-end gap-2 mt-6">
            <USkeleton class="h-10 w-28 rounded-md" />
            <USkeleton class="h-10 w-28 rounded-md" />
          </div>
        </div>
      </UCard>
    </div>
    
    <!-- Error state -->
    <div v-else-if="state.status === 'error'" class="max-w-3xl mx-auto">
      <UCard>
        <div class="py-8 text-center">
          <UIcon name="i-ph-warning-circle" class="text-warm-300 text-4xl mb-3" />
          <h3 class="text-xl mb-2">Error Loading Results</h3>
          <p class="opacity-80">{{ state.error?.message || 'Failed to load battle results' }}</p>
          <UButton color="primary" to="/" class="mt-4">
            Return Home
          </UButton>
        </div>
      </UCard>
    </div>
    
    <!-- Results content -->
    <div v-else-if="battle" class="max-w-3xl mx-auto">
      <UCard class="ring-0" :ui="{ header: 'border-0', body: 'border-0' }">
        <template #header>
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div class="max-w-lg overflow-hidden">
              <h1 class="text-xl font-bold truncate mb-1" :title="battle.title">{{ battle.title }}</h1>
              <p class="text-md opacity-70">{{ battle.voteCount || 0 }} votes</p>
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
            class="text-center ring-0"
            :ui="{ root: 'bg-(--ui-yt-600)/30 border-(--ui-yt-400)/50 border-1' }"
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
            
            <!-- Winner title with tooltip, handling long content -->
            <UTooltip text="Click to copy">
              <button 
                class="text-xl font-medium text-warm-500 mb-2 cursor-pointer 
                       max-w-full px-8 mx-auto block truncate hover:bg-warm-200/30"
                @click="copyTitleText(winner.content, toast)"
              >
                {{ winner.content }}
              </button>
            </UTooltip>
            
            <p class="text-sm text-(--ui-yt-400)">
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
            tbody: 'divide-y divide-(--ui-yt-600)',
            tr: 'hover:bg-white/2 transition-colors',
            th: 'px-4 py-3 text-sm font-medium text-(--ui-yt-400) uppercase',
            td: 'px-4 py-3 text-(--ui-yt-400)'
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

<style scoped>
/* Add specific styles for handling long content */
.truncate-title {
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 640px) {
  /* More aggressive truncation on mobile */
  .truncate-title {
    max-width: 200px;
  }
}
</style>

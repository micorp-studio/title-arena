<!-- pages/battles/[id]/results.vue -->
<script setup lang="ts">
import { h, onMounted, nextTick } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import { useBattleDetails } from '~/composables/useBattleApi';
import { useBattleHelpers } from '~/composables/useBattleHelpers';
import { useConfetti } from '~/composables/useConfetti';
import type { TitleOption } from '~/types';

// Extended TitleOption type with rank
interface RankedTitleOption extends TitleOption {
  rank?: number;
}

const route = useRoute();
const battleId = computed(() => route.params.id as string);
const { showWinnerConfetti, clearAllConfetti } = useConfetti();
const { copyToClipboard } = useBattleHelpers();

// Get battle details
const { state, asyncStatus } = useBattleDetails();

// Get properly typed battle data
const battle = computed(() => state.value?.data as any);

const optionAppearances = computed(() => {
  if (!battle.value?.titleOptions) return {};

  const appearances: Record<string, number> = {};

  const titles = battle.value.titleOptions as TitleOption[]
  titles.forEach(option => {
    appearances[option.id] = 0;
  });

  if (battle.value?.voteCount && titles.length >= 2) {
    const n = titles.length;

    const totalPairs = n * (n - 1) / 2; // Total number of unique pairs
    const votesPerPair = battle.value.voteCount / totalPairs; // Average votes per pair

    // Each option appears in (n-1) different pairs
    titles.forEach(option => {
      appearances[option.id] = (n - 1) * votesPerPair;
    });
  }

  return appearances;
});

// Get sorted options by score (descending)
const sortedOptions = computed(() => {
  if (!battle.value?.titleOptions) return [];

  return [...battle.value.titleOptions]
    .sort((a, b) => a.content.length - b.content.length) // tie-break: prefer shortest title
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

const isTitleBattle = computed(() => battle.value?.type === 'title');

// Helper function to create a tooltip with copy functionality
const createCopyTooltip = (content: string, opacity: number) => {
  const UTooltip = resolveComponent('UTooltip');

  return h(UTooltip, { text: "Click to copy" }, () =>
    h('button', {
      class: `truncate text-cold-500 max-w-full inline-block text-left cursor-pointer hover:bg-cold-200/20 transition-colors`,
      style: { opacity: `${opacity}%` },
      onClick: () => copyToClipboard(content, true),
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
      const opacity = Math.max(100 - 10*(rank || 0), 0);

      return h('div', { 
        class: `text-center text-(--ui-yt-200)`,
        style: { opacity: `${opacity}%` }
       }, rank);
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
      const opacity = Math.max(100 - 10*(rank || 0), 0);
      if (isTitleBattle.value) {
        // Determine font weight based on rank
        const fontWeight = rank === 1 ? 'font-medium' :
          rank === 2 ? 'font-normal' : '';

        // Use a container div to handle long content with truncation
        return h('div', { class: 'max-w-md overflow-hidden' }, [
          createCopyTooltip(content, opacity)
        ]);
      } else {
        return h('img', {
          src: '/api/'+ content, 
          alt: content,
          class: 'rounded-md shadow-sm border-1 border-(--ui-yt-600) h-32',
        })
      }
    },
    meta: {
      class: {
        td: 'max-w-md break-words'
      }
    }
  },
  {
    accessorKey: 'scoreElo',
    header: 'Elo',
    cell: ({ row }) => {
      const rank = row.original.rank;
      const scoreElo = row.original.scoreElo;
      const opacity = Math.max(100 - 10*(rank || 0), 0);

      return h('div', {
        class: `text-right text-(--ui-yt-200)`,
        style: { opacity: `${opacity}%` }
      }, scoreElo);
    },
    meta: {
      class: {
        th: 'text-right w-24',
        td: 'text-right'
      }
    }
  },
  {
    accessorKey: 'score',
    header: 'Score',
    cell: ({ row }) => {
      const rank = row.original.rank;
      const score = row.original.score;
      const opacity = Math.max(100 - 10*(rank || 0), 0);

      return h('div', {
        class: `text-right text-(--ui-yt-200) opacity-${opacity}`,
        style: { opacity: `${opacity}%` }
      }, score);
    },
    meta: {
      class: {
        th: 'text-right w-24',
        td: 'text-right'
      }
    }
  },
  {
    accessorKey: 'victoryRate',
    header: 'Win Rate',
    cell: ({ row }) => {
      const rank = row.original.rank;
      const score = row.original.score;
      const appearances = optionAppearances.value[row.original.id] || 0;
      let victoryRate = 0;
      if (appearances > 0) {
        victoryRate = Math.round((score / appearances) * 100);
      }

      const opacity = Math.max(100 - 10*(rank || 0), 0);

      return h('div', {
        class: `text-right text-(--ui-yt-200)`,
        style: { opacity: `${opacity}%` }
      }, `${victoryRate} %`);
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
              <UButton :to="`/battles/${battleId}/edit`" color="neutral" variant="ghost" icon="i-ph-pencil-simple">
                Edit Battle
              </UButton>
            </div>
          </div>
        </template>

        <!-- Winner spotlight using UCard -->
        <div v-if="winner" id="confetti-container" class="mb-6 mt-2">
          <UCard variant="subtle" class="text-center ring-0"
            :ui="{ root: 'bg-(--ui-yt-600)/30 border-(--ui-yt-400)/50 border-1' }">
            <!-- Trophy icon -->
            <div class="flex justify-center mb-2">
              <UIcon name="i-ph-trophy" class="text-4xl text-warm-500" />
            </div>

            <!-- Winner badge -->
            <div>
              <div class="mb-3">
                <span class="px-3 py-0.5 text-xs font-bold bg-warm-500/10 text-warm-500 rounded-full">
                  Winner
                </span>
              </div>
            </div>

            <!-- Winner spotlight -->
            <UTooltip text="Click to copy" v-if="isTitleBattle">
              <button class="text-xl font-medium text-warm-500 mb-2 cursor-pointer 
                       max-w-full px-8 mx-auto block truncate hover:bg-warm-200/30"
                @click="copyToClipboard(winner.content, true)">
                {{ winner.content }}
              </button>
            </UTooltip>
            <div v-else
              class="mb-4 rounded-md shadow-md border-1 border-(--ui-yt-600) flex flex-col items-center justify-center">
              <img :src="`/api/${winner.content}`" :alt="winner.content"
                class="max-w-full max-h-full object-contain rounded">
            </div>

            <p class="text-sm text-(--ui-yt-400)">
              Score: {{ winner.score }}
            </p>
          </UCard>
        </div>

        <!-- Results table -->
        <UTable :columns="columns" :data="sortedOptions" :ui="{
          base: 'min-w-full text-left rtl:text-right',
          tbody: 'divide-y divide-(--ui-yt-600)',
          tr: 'hover:bg-white/2 transition-colors',
          th: 'px-4 py-3 text-sm font-medium text-(--ui-yt-400) uppercase',
          td: 'px-4 py-3 text-(--ui-yt-400)'
        }">
          <!-- Empty state -->
          <template #empty>
            <div class="text-center py-8">
              <UIcon name="i-ph-chart-line-down" class="text-5xl mb-4 opacity-40" />
              <h3 class="text-lg font-medium mb-2">No results yet</h3>
              <p class="text-sm opacity-80 mb-4">
                This battle hasn't received any votes yet
              </p>

              <UButton :to="`/battles/${battleId}/vote`" color="primary" icon="i-ph-check-square">
                Start Voting
              </UButton>
            </div>
          </template>
        </UTable>

        <template #footer>
          <div class="flex justify-end items-center gap-4">
            <UButton :to="`/battles/${battleId}/vote`" color="neutral" variant="ghost" icon="i-ph-arrow-clockwise">
              Vote again
            </UButton>
            <UButton :to="`/`" color="primary" variant="subtle" icon="i-ph-arrow-left">
              Back to Home
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
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

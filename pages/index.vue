<!-- pages/index.vue -->
<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import { useRouter } from 'vue-router';
import { useAllBattles, useBattleMutations } from '~/composables/useBattleApi';
import { useBattleHelpers } from '~/composables/useBattleHelpers';
import type { Battle, CreateBattleRequest, TitleOption } from '~/types';

definePageMeta({
  layout: 'default'
});

const toast = useToast();
const router = useRouter();
const { formatDate, formatTitles, copyBattleLink, getVoteCountLabel } = useBattleHelpers();

// Get battles data
const { state, asyncStatus, refresh } = useAllBattles();

// Get mutations
const { 
  deleteBattle: { 
    mutate: deleteBattleMutate, 
    asyncStatus: deleteStatus 
  },
  createBattle: {
    mutate: createBattleMutate,
    asyncStatus: createStatus
  }
} = useBattleMutations();

// Modal refs
const shareModalOpen = ref(false);
const deleteModalOpen = ref(false);
const currentBattleId = ref('');
const shareModalTitle = ref('');
const deleteBattleName = ref('');
const deleteBattleId = ref('');

// Format title options with badges
const formatTitleOptions = (options: TitleOption[]): any => {
  if (!options || options.length === 0) return 'No options';
  
  // Sort by score descending
  const sortedOptions = [...options].sort((a, b) => b.score - a.score);
  const UBadge = resolveComponent('UBadge');
  
  const elements = [];
  
  // Add first option (truncated if needed)
  if (sortedOptions.length > 0) {
    const firstOption = sortedOptions[0].content;
    elements.push(
      h(UBadge, { 
        size: 'md',  
        variant: 'subtle',
        class: 'me-1 truncate max-w-[200px] inline-block',
        title: firstOption
      }, firstOption)
    );
  }
  
  // Add second option if available
  if (sortedOptions.length > 1) {
    
    const secondOption = sortedOptions[1].content;
    elements.push(
      h(UBadge, { 
        size: 'md',  
        variant: 'subtle',
        class: 'me-2 truncate max-w-[200px] inline-block',
        title: secondOption
      }, secondOption)
    );
  }
  
  // Add more indicator if needed
  if (sortedOptions.length > 2) {
    elements.push(
      h('span', { class: 'opacity-70 text-xs' }, `+ ${sortedOptions.length - 2} more`)
    );
  }
  
  return h('div', { class: 'flex items-center flex-wrap gap-y-1 align-center' }, elements);
};

// Generate test battle
const generateTestBattle = () => {
  const testBattle: CreateBattleRequest = {
    title: `Test Battle ${new Date().toLocaleTimeString()}`,
    options: [
      `Option A - ${new Date().toLocaleTimeString()}`,
      `Option B - ${new Date().toLocaleTimeString()}`,
      `Option C - ${new Date().toLocaleTimeString()}`
    ]
  };
  
  createBattleMutate(testBattle);
  
  toast.add({
    title: 'Test battle created',
    description: 'A new test battle has been added',
    color: 'primary',
  });
};

// Column definitions for the table
const columns: TableColumn<Battle>[] = [
  {
    accessorKey: 'title',
    header: 'BATTLE',
    cell: ({ row }) => {
      const battle = row.original;
      
      return h('div', { class: 'flex flex-col' }, [
        h('div', { 
          class: 'font-mono font-medium truncate',
          title: battle.title
        }, battle.title),
        h('div', { class: 'text-sm opacity-80 mt-1 font-sans' }, formatTitleOptions(battle.titleOptions)),
      ]);
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'CREATED',
    cell: ({ row }) => {
      return h('div', { class: 'whitespace-nowrap font-mono text-sm' }, formatDate(row.original.createdAt));
    }
  },
  {
    accessorKey: 'voteCount',
    header: () => h('div', { class: 'text-center' }, 'VOTES'),
    cell: ({ row }) => {
      return h('div', { class: 'text-center font-mono' }, getVoteCountLabel(row.original.voteCount));
    },
    meta: {
      class: {
        td: 'text-center'
      }
    }
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const battle = row.original;
      const UTooltip = resolveComponent('UTooltip');
      const UButton = resolveComponent('UButton');
      
      return h('div', { class: 'flex items-center justify-end gap-2' }, [
        h(UTooltip, { text: 'Share Battle' }, () => 
          h(UButton, {
            color: 'neutral',
            variant: 'ghost',
            icon: 'i-ph-share-network',
            size: 'md',
            onClick: (e: MouseEvent) => {
              e.stopPropagation();
              openShareModal(battle);
            },
            'aria-label': 'Share battle'
          })
        ),
        h(UTooltip, { text: 'Edit Battle' }, () => 
          h(UButton, {
            color: 'neutral',
            variant: 'ghost',
            icon: 'i-ph-pencil-simple',
            size: 'md',
            onClick: (e: MouseEvent) => {
              e.stopPropagation(); 
              router.push(`/battles/${battle.id}/edit`);
            },
            'aria-label': 'Edit battle'
          })
        ),
        h(UTooltip, { text: 'Delete Battle' }, () => 
          h(UButton, {
            color: 'primary',
            variant: 'ghost',
            icon: 'i-ph-trash',
            size: 'md',
            onClick: (e: MouseEvent) => {
              e.stopPropagation(); 
              openDeleteModal(battle);
            },
            'aria-label': 'Delete battle'
          })
        )
      ]);
    },
    meta: {
      class: {
        td: 'w-[120px]'
      }
    }
  }
];

// Get origin for share URL
const origin = computed(() => {
  if (process.client) {
    return window.location.origin;
  }
  return '';
});

// Full share URL
const shareUrl = computed(() => {
  return `${origin.value}/battles/${currentBattleId.value}/vote`;
});

// Share modal functions
function openShareModal(battle: Battle) {
  currentBattleId.value = battle.id;
  shareModalTitle.value = battle.title;
  shareModalOpen.value = true;
  // Copy to clipboard immediately
  copyBattleLink(battle.id, 'vote', toast);
}

function handleShareLink() {
  copyBattleLink(currentBattleId.value, 'vote', toast);
}

// New function to begin voting from the share modal
function beginVoting() {
  shareModalOpen.value = false;
  router.push(`/battles/${currentBattleId.value}/vote`);
}

// Delete modal functions
function openDeleteModal(battle: Battle) {
  deleteBattleId.value = battle.id;
  deleteBattleName.value = battle.title;
  deleteModalOpen.value = true;
}

function confirmDelete() {
  if (deleteBattleId.value) {
    deleteBattleMutate(deleteBattleId.value);
    deleteModalOpen.value = false;
    
    toast.add({
      title: 'Battle deleted',
      description: `"${deleteBattleName.value}" has been removed`,
      color: 'secondary',
    });
  }
}

// Handle row click
function handleRowClick(row: any) {
  router.push(`/battles/${row.original.id}/results`);
}

// Custom empty state component
const emptyState = () => {
  return h('div', { class: 'flex flex-col items-center justify-center py-16' }, [
    h('div', { class: 'text-6xl mb-6' }, h(resolveComponent('UIcon'), { name: 'i-ph-empty', size: 'xl' })),
    h('h3', { class: 'text-xl font-mono mb-2' }, 'No battles found'),
    h('p', { class: 'text-center opacity-80 mb-6 max-w-md' }, 
      'Create your first battle to start gathering feedback on which title options resonate the most with your audience.'
    ),
    h(resolveComponent('UButton'), {
      color: 'primary',
      variant: 'solid',
      size: 'lg',
      icon: 'i-ph-plus-bold',
      to: '/battles/new'
    }, () => 'Create Your First Battle')
  ]);
};
</script>
<!-- pages/index.vue template -->
<template>
  <div class="container mx-auto px-4 py-8 md:py-12">
    <!-- Header -->
    <div class="mb-8 md:flex px-2 items-center justify-between">
      <div>
        <h1 class="text-3xl md:text-4xl font-bold font-mono">
          Celsius
        </h1>
        <p class="mt-2 ml-1 opacity-70">Easy choices. Hard data.</p>
      </div>

      <div class="flex gap-4 mt-4 md:mt-0">
        <!-- <UTooltip text="Refresh">
        <UButton
          icon="i-ph-arrows-clockwise"
          color="neutral"
          variant="ghost"
          @click="refresh()"
          :loading="asyncStatus === 'loading'"
          :disabled="asyncStatus === 'loading'"
          aria-label="Refresh"
        >
          <span class="sr-only">Refresh</span>
        </UButton>
        </UTooltip> -->
        
        <!-- <UButton 
          icon="i-ph-flask"
          color="secondary"
          @click="generateTestBattle"
          :loading="createStatus === 'loading'"
          :disabled="createStatus === 'loading'"
        >
          Test Battle
        </UButton> -->
      
        <UButton 
          icon="i-ph-plus-bold"
          to="/battles/new"
          variant="solid"
          color="primary"
          size="lg"
        >
          Create Battle
        </UButton>
      </div>
    </div>
    
    <!-- Table -->
    <UCard class="overflow-hidden">
      <UTable
        :columns="columns"
        :data="state.data || []"
        :loading="asyncStatus === 'loading' || deleteStatus === 'loading'"
        loading-color="primary"
        :ui="{ 
          tr: 'cursor-pointer hover:bg-white/5 transition-colors rounded-lg',
          td: 'max-w-xs overflow-hidden'
        }"
        class="w-full"
        @select="handleRowClick"
      >
        <template #empty>
          <div v-if="state.data?.length === 0">
            <component :is="emptyState" />
          </div>
        </template>
      </UTable>
    </UCard>
    
    <!-- How It Works section -->
    <!-- <HowItWorks v-if="state.data?.length === 0" /> -->
    
    <!-- Share Modal -->
    <UModal 
      v-model:open="shareModalOpen"
      :title="`Share '${shareModalTitle}'`" 
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <p class="mb-4">Share this battle with others to collect votes. The link has been copied to your clipboard.</p>
        <p class="font-mono text-sm p-3 bg-cold-500/5 rounded-lg break-all">
          {{ shareUrl }}
        </p>
      </template>
      
      <template #footer>
        <UButton 
          color="neutral" 
          variant="outline" 
          @click="shareModalOpen = false"
        >
          Close
        </UButton>
        <UButton 
          color="primary" 
          icon="i-ph-arrow-right" 
          @click="beginVoting"
        >
          Begin voting
        </UButton>
      </template>
    </UModal>
    
    <!-- Delete Confirmation Modal -->
    <UModal 
      v-model:open="deleteModalOpen"
      title="Confirm Deletion"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <p>Delete "{{ deleteBattleName }}"?</p>
        <p class="mt-2 text-sm opacity-80">All votes and data for this battle will be permanently removed.</p>
      </template>
      
      <template #footer>
        <UButton 
          color="neutral" 
          variant="outline" 
          @click="deleteModalOpen = false"
        >
          Cancel
        </UButton>
        <UButton 
          color="primary" 
          icon="i-ph-trash" 
          @click="confirmDelete"
        >
          Delete
        </UButton>
      </template>
    </UModal>
  </div>
</template>

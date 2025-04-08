<!-- pages/index.vue (updated share modal) -->
<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import { useRouter } from 'vue-router';
import { useAllBattles, useBattleMutations } from '~/composables/useBattleApi';
import { useBattleHelpers } from '~/composables/useBattleHelpers';
import type { Battle, TitleOption } from '~/types';

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
  }
} = useBattleMutations();

// Modal refs using v-model:open pattern
const shareModalOpen = ref(false);
const deleteModalOpen = ref(false);
const currentBattleId = ref('');
const shareModalTitle = ref('');
const deleteBattleName = ref('');
const deleteBattleId = ref('');

// Copy state
const copied = ref(false);

// Helper function to create a badge with render function (fixes non-function slot warning)
const createBadge = (content: string, props = {}) => {
  const UBadge = resolveComponent('UBadge');
  return h(UBadge, {
    size: 'md',  
    variant: 'soft',
    class: 'me-1 truncate max-w-[200px] inline-block bg-(--ui-yt-600)',
    title: content,
    ...props
  }, () => content);
};

// Format title options with proper function slots
const formatTitleOptions = (options: TitleOption[]): any => {
  if (!options || options.length === 0) return 'No options';
  
  // Sort by score descending
  const sortedOptions = [...options].sort((a, b) => b.score - a.score);
  
  const elements = [];
  
  // Add first option (truncated if needed)
  if (sortedOptions.length > 0) {
    elements.push(createBadge(sortedOptions[0].content));
  }
  
  // Add second option if available
  if (sortedOptions.length > 1) {
    elements.push(createBadge(sortedOptions[1].content));
  }
  
  // Add more indicator if needed
  if (sortedOptions.length > 2) {
    elements.push(
      h('span', { class: 'opacity-70 text-xs text-(--ui-yt-400)' }, `+ ${sortedOptions.length - 2} more`)
    );
  }
  
  return h('div', { class: 'flex items-center flex-wrap align-center' }, elements);
};

// Create a tooltip button with proper function slots
const createTooltipButton = (icon: string, tooltip: string, onClick: (e: MouseEvent) => void, color = 'neutral') => {
  const UTooltip = resolveComponent('UTooltip');
  const UButton = resolveComponent('UButton');
  
  return h(UTooltip, { text: tooltip, variant: 'ghost' }, () => 
    h(UButton, {
      color,
      variant: 'ghost',
      class: 'text-(--ui-yt-200) hover:text-(--ui-yt-400) hover:bg-transparent hover:cursor-pointer',
      icon,
      size: 'md',
      onClick: (e: MouseEvent) => {
        e.stopPropagation();
        onClick(e);
      },
      'aria-label': tooltip
    })
  );
};

// Column definitions for the table
const columns: TableColumn<Battle>[] = [
  {
    accessorKey: 'title',
    header: 'BATTLE',
    cell: ({ row }) => {
      const battle = row.original;
      
      return h('div', { class: 'flex flex-col gap-y-1' }, [
        h('div', { 
          class: 'font-medium truncate text-(--ui-yt-200)',
          title: battle.title
        }, battle.title),
        formatTitleOptions(battle.titleOptions),
      ]);
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'CREATED',
    cell: ({ row }) => {
      return h('div', { class: 'whitespace-nowrap text-sm text-(--ui-yt-400)' }, formatDate(row.original.createdAt));
    }
  },
  {
    accessorKey: 'voteCount',
    header: () => h('div', { class: 'text-center' }, 'VOTES'),
    cell: ({ row }) => {
      return h('div', { class: 'text-center text-(--ui-yt-400)' }, getVoteCountLabel(row.original.voteCount));
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
      
      return h('div', { class: 'flex items-center justify-end gap-2' }, [
        createTooltipButton('i-ph-share-network', 'Share Battle', () => openShareModal(battle)),
        createTooltipButton('i-ph-pencil-simple', 'Edit Battle', () => router.push(`/battles/${battle.id}/edit`)),
        createTooltipButton('i-ph-trash', 'Delete Battle', () => openDeleteModal(battle), 'neutral')
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
  // Reset copy state
  copied.value = false;
}

// Copy link function
const copyLink = () => {
  navigator.clipboard.writeText(shareUrl.value);
  copied.value = true;
  
  toast.add({
    title: 'Link copied',
    description: 'Share link has been copied to clipboard',
    color: 'primary'
  });
  
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};

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
    h('h3', { class: 'text-xl mb-2' }, 'No battles found'),
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

<template>
  <div class="container mx-auto px-4 py-8 md:py-12">
    <!-- Table -->
    <UCard class="ring-0">
      <UTable
        :columns="columns"
        :data="state.data || []"
        :loading="asyncStatus === 'loading' || deleteStatus === 'loading'"
        loading-color="primary"
        sticky
        :ui="{ 
          th: 'text-(--ui-yt-400) cursor-default',
          tr: 'cursor-pointer transition-colors rounded-lg',
          td: 'max-w-xs overflow-hidden text-(--ui-yt-400)',
          tbody: 'divide-y divide-(--ui-yt-600) [&>tr]:data-[selectable=true]:hover:bg-(--ui-yt-600)'

        }"
        class="w-full"
        @select="handleRowClick"
      >
        <!-- Loading skeleton -->
        <template #loading>
          <div class="p-4 space-y-4">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 p-2">
              <div class="flex-1">
                <USkeleton class="h-6 w-3/4 mb-2" />
                <div class="flex space-x-2">
                  <USkeleton class="h-4 w-20" />
                  <USkeleton class="h-4 w-20" />
                </div>
              </div>
              <USkeleton class="h-5 w-24" />
              <USkeleton class="h-5 w-16" />
              <div class="flex gap-2">
                <USkeleton class="h-8 w-8 rounded-md" />
                <USkeleton class="h-8 w-8 rounded-md" />
                <USkeleton class="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        </template>
        
        <template #empty>
          <div v-if="state.data?.length === 0">
            <component :is="emptyState" />
          </div>
        </template>
      </UTable>
    </UCard>
    
    <!-- Share Modal - Note: Empty trigger since we open programmatically -->
    <UModal 
      v-model:open="shareModalOpen"
      :title="`Voting link for '${shareModalTitle}'`"
      :ui="{ footer: 'justify-end', header: 'border-0', body: 'border-0' }"
    >
      <template #body class="-m-32">
        <p class="mb-4">Share this link to collect votes:</p>
        
        <!-- Share URL input with copy button -->
        <UInput
          :model-value="shareUrl"
          readonly
          class="font-mono text-sm w-full"
          variant="subtle"
          :ui="{ trailing: '-mr-2' }"
        >
          <template #trailing>
            <UTooltip :text="copied ? 'Copied!' : 'Copy to clipboard'">
              <UButton
                :color="copied ? 'secondary' : 'neutral'"
                variant="link"
                size="md"
                :icon="copied ? 'i-ph-check-bold' : 'i-ph-copy'"
                aria-label="Copy to clipboard"
                class="bg-warm-300/20"
                @click="copyLink"
              />
            </UTooltip>
          </template>
        </UInput>
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
    
    <!-- Delete Confirmation Modal - Note: Empty trigger since we open programmatically -->
    <UModal 
      v-model:open="deleteModalOpen"
      title="Confirm Deletion"
      :ui="{ footer: 'justify-end', header: 'border-0', body: 'border-0' }"
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

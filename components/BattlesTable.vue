<!-- components/battle/BattlesTable.vue -->
<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import { useRoute, useRouter } from 'vue-router';
import { useAllBattles, useBattleMutations } from '~/composables/useBattleApi';
import { useBattleHelpers } from '~/composables/useBattleHelpers';
import type { Battle, TitleOption } from '~/types';

const toast = useToast();
const route = useRoute();
const router = useRouter();
const { formatDate, formatTitles, copyBattleLink, getVoteCountLabel } = useBattleHelpers();

// Get battles data with proper destructuring
const { state, asyncStatus, refresh } = useAllBattles();

// Get delete mutation
const { deleteBattle: { mutate: deleteBattleMutate, asyncStatus: deleteStatus } } = useBattleMutations();

// Modal for copy link
const showShareModal = ref(false);
const currentBattleId = ref('');
const shareModalTitle = ref('');

// Confirmation modal for deletion
const showDeleteModal = ref(false);
const deleteBattleName = ref('');
const deleteBattleId = ref('');

// Helper function to create a badge with render function (fixes non-function slot warning)
const createBadge = (content: string, props = {}) => {
  const UBadge = resolveComponent('UBadge');
  return h(UBadge, {
    size: 'md',
    variant: 'subtle',
    class: 'me-1 truncate max-w-[200px] inline-block',
    title: content,
    ...props
  }, () => content);
};

// Helper function to format title options with badges
const formatTitleOptions = (options: TitleOption[]) => {
  if (!options || options.length === 0) return h('div', {}, 'No options');
  
  // Sort by score descending
  const sortedOptions = [...options].sort((a, b) => b.score - a.score);
  
  const elements = [];
  
  // Add first option
  if (sortedOptions.length > 0) {
    elements.push(createBadge(sortedOptions[0].content));
  }
  
  // Add second option if available
  if (sortedOptions.length > 1) {
    elements.push(createBadge(sortedOptions[1].content));
  }
  
  // Add more indicator if needed
  if (sortedOptions.length > 2) {
    elements.push(h('span', { class: 'opacity-70 text-xs' }, `+ ${sortedOptions.length - 2} more`));
  }
  
  return h('div', { class: 'flex items-center flex-wrap gap-y-1 align-center' }, elements);
};

// Helper function to create action buttons
const createActionButton = (icon: string, tooltip: string, onClick: (e: MouseEvent) => void) => {
  const UButton = resolveComponent('UButton');
  const UTooltip = resolveComponent('UTooltip');
  
  return h(UTooltip, { text: tooltip }, () => 
    h(UButton, {
      color: 'neutral',
      variant: 'ghost',
      icon,
      size: 'sm',
      onClick: (e: MouseEvent) => {
        e.stopPropagation();
        onClick(e);
      },
      ariaLabel: tooltip
    })
  );
};

// Column definitions for the table
const columns = computed<TableColumn<Battle>[]>(() => [
  {
    accessorKey: 'title',
    header: 'Battle',
    cell: ({ row }) => {
      const battle = row.original;
      
      return h('div', { class: 'flex flex-col' }, [
        h('div', { class: 'font-medium text-(--ui-text-highlighted)' }, battle.title),
        formatTitleOptions(battle.titleOptions)
      ]);
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      return h('div', { class: 'whitespace-nowrap' }, formatDate(row.original.createdAt));
    },
    meta: {
      class: {
        td: 'min-w-[120px]'
      }
    }
  },
  {
    accessorKey: 'voteCount',
    header: 'Votes',
    cell: ({ row }) => {
      return h('div', { class: 'text-center' }, getVoteCountLabel(row.original.voteCount));
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
        createActionButton('i-ph-share-network', 'Share', () => openShareModal(battle)),
        createActionButton('i-ph-pencil-simple', 'Edit', () => router.push(`/battles/${battle.id}/edit`)),
        createActionButton('i-ph-trash', 'Delete', () => openDeleteModal(battle))
      ]);
    },
    meta: {
      class: {
        td: 'w-[120px]'
      }
    }
  }
]);

// Share modal functions
function openShareModal(battle: Battle) {
  currentBattleId.value = battle.id;
  shareModalTitle.value = battle.title;
  showShareModal.value = true;
}

function handleShareLink() {
  copyBattleLink(currentBattleId.value, 'vote', toast);
  showShareModal.value = false;
}

// Delete modal functions
function openDeleteModal(battle: Battle) {
  deleteBattleId.value = battle.id;
  deleteBattleName.value = battle.title;
  showDeleteModal.value = true;
}

function confirmDelete() {
  if (deleteBattleId.value) {
    deleteBattleMutate(deleteBattleId.value);
    showDeleteModal.value = false;
    
    toast.add({
      title: 'Battle deleted',
      description: `"${deleteBattleName.value}" has been removed`,
      color: 'secondary'
    });
  }
}

// Handle row click
function handleRowClick(row: any) {
  router.push(`/battles/${row.original.id}/results`);
}
</script>

<template>
  <div>
    <!-- Battles Table -->
    <UTable
      :columns="columns"
      :data="state.data"
      :loading="asyncStatus === 'loading' || deleteStatus === 'loading'"
      loading-color="primary"
      :empty="state.data?.length === 0 ? 'No battles found' : undefined"
      @select="handleRowClick"
      class="w-full"
    >
      <!-- Loading state with skeletons -->
      <template #loading>
        <div class="p-4 space-y-4">
          <div v-for="i in 3" :key="i" class="flex items-center space-x-4">
            <div class="flex-1">
              <USkeleton class="h-6 w-full mb-2" />
              <div class="flex space-x-2">
                <USkeleton class="h-4 w-24" />
                <USkeleton class="h-4 w-24" />
              </div>
            </div>
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-4 w-16" />
            <USkeleton class="h-8 w-24 rounded-md" />
          </div>
        </div>
      </template>
    </UTable>
    
    <!-- Share Modal -->
    <UModal v-model="showShareModal" :title="`Share '${shareModalTitle}'`" :ui="{ footer: 'justify-end' }">
      <template #body>
        <p class="mb-4">Share this battle with others to collect votes. The link has been copied to your clipboard.</p>
        <p class="font-mono text-sm p-3 bg-white/5 rounded-lg break-all">
          {{ `/battles/${currentBattleId}/vote` }}
        </p>
      </template>
      
      <template #footer>
        <UButton 
          color="neutral" 
          variant="outline" 
          @click="showShareModal = false"
        >
          Close
        </UButton>
        <UButton 
          color="primary" 
          icon="i-ph-link" 
          @click="handleShareLink"
        >
          Copy Link Again
        </UButton>
      </template>
    </UModal>
    
    <!-- Delete Confirmation Modal -->
    <UModal 
      v-model="showDeleteModal" 
      title="Confirm Deletion"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <p>Are you sure you want to delete "{{ deleteBattleName }}"?</p>
        <p class="mt-2 text-sm text-(--ui-text-muted)">This action cannot be undone. All votes and data for this battle will be permanently removed.</p>
      </template>
      
      <template #footer>
        <UButton 
          color="neutral" 
          variant="outline" 
          @click="showDeleteModal = false"
        >
          Cancel
        </UButton>
        <UButton 
          color="secondary" 
          icon="i-ph-trash" 
          @click="confirmDelete"
        >
          Delete
        </UButton>
      </template>
    </UModal>
  </div>
</template>

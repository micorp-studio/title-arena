<!-- components/battle/BattlesTable.vue -->
<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import { useRoute, useRouter } from 'vue-router';
import { useAllBattles, useBattleMutations } from '~/composables/useBattleApi';
import { useBattleHelpers } from '~/composables/useBattleHelpers';
import type { Battle } from '~/types';

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

// Column definitions for the table
const columns = computed<TableColumn<Battle>[]>(() => [
  {
    accessorKey: 'title',
    header: 'Battle',
    cell: ({ row }) => {
      const battle = row.original;
      
      return h('div', { class: 'flex flex-col' }, [
        h('div', { class: 'font-medium text-(--ui-text-highlighted)' }, battle.title),
        h('div', { class: 'text-sm text-(--ui-text-muted) mt-1' }, formatTitles(battle.titleOptions)),
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
      const UTooltip = resolveComponent('UTooltip');
      const UButton = resolveComponent('UButton');
      
      return h('div', { class: 'flex items-center justify-end gap-2' }, [
        h(UTooltip, { text: 'Share' }, () => 
          h(UButton, {
            color: 'neutral',
            variant: 'ghost',
            icon: 'i-ph-share-network',
            size: 'sm',
            onClick: (e: Event) => {
              e.stopPropagation();
              openShareModal(battle);
            },
            ariaLabel: 'Share battle'
          })
        ),
        h(UTooltip, { text: 'Edit' }, () => 
          h(UButton, {
            color: 'neutral',
            variant: 'ghost',
            icon: 'i-ph-pencil-simple',
            size: 'sm',
            onClick: (e: Event) => {
              e.stopPropagation(); 
              router.push(`/battles/${battle.id}/edit`);
            },
            ariaLabel: 'Edit battle'
          })
        ),
        h(UTooltip, { text: 'Delete' }, () => 
          h(UButton, {
            color: 'secondary',
            variant: 'ghost',
            icon: 'i-ph-trash',
            size: 'sm',
            onClick: (e: Event) => {
              e.stopPropagation(); 
              openDeleteModal(battle);
            },
            ariaLabel: 'Delete battle'
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
    />
    
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

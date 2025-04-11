<!-- pages/index.vue (updated share modal) -->
<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import { useRouter } from 'vue-router';
import { useAllBattles, useBattleMutations } from '~/composables/useBattleApi';
import { useBattleHelpers } from '~/composables/useBattleHelpers';
import ShareModal from '~/components/ShareModal.vue'
import DeleteModal from '~/components/DeleteModal.vue';
import type { Battle, TitleOption } from '~/types';

const toast = useToast();
const router = useRouter();
const UBadge = resolveComponent('UBadge')
const UTooltip = resolveComponent('UTooltip');
const UButton = resolveComponent('UButton');
const UIcon = resolveComponent('UIcon')

const { formatDate, getVoteCountLabel } = useBattleHelpers();

// Get battles data
const { state, asyncStatus} = useAllBattles();

// Get mutations
const { 
  deleteBattle: { 
    mutate: deleteBattleMutate, 
    asyncStatus: deleteStatus 
  }
} = useBattleMutations();

const overlay = useOverlay();

async function openShareModal(battle: Battle) {
  const modal = overlay.create(ShareModal, {
    props: {
        battle: battle
    }
  })
  const beginVotes = await modal.open()
  if (beginVotes) {
    navigateTo(`/battles/${battle.id}/vote`);
  }
}

async function openDeleteModal(battle: Battle) {
  const modal = overlay.create(DeleteModal, {
    props: {
      battle: battle
    }
  })
  const confirmDelete = await modal.open()
  if (confirmDelete) {
    deleteBattleMutate(battle.id)
    toast.add({
      title: 'Battle deleted',
      description: `"${battle.title}" has been removed`,
      color: 'secondary',
    });
  }
}


const createBadge = (content: string, props = {}) => {
  return h(UBadge, {
    size: 'md',  
    variant: 'soft',
    class: 'me-1 truncate max-w-[200px] inline-block bg-(--ui-yt-600)',
    title: content,
    ...props
  }, () => content);
};

const formatTitleOptions = (options: TitleOption[]): any => {
  if (!options || options.length === 0) return 'No options';
  
  const sortedOptions = [...options].sort((a, b) => b.score - a.score);
  
  const elements = [];
  
  if (sortedOptions.length > 0) {
    elements.push(createBadge(sortedOptions[0].content));
  }
  
  if (sortedOptions.length > 1) {
    elements.push(createBadge(sortedOptions[1].content));
  }
  
  if (sortedOptions.length > 2) {
    elements.push(
      h('span', { class: 'opacity-70 text-xs text-(--ui-yt-400)' }, `+ ${sortedOptions.length - 2} more`)
    );
  }
  
  return h('div', { class: 'flex items-center flex-wrap align-center' }, elements);
};

// Create a tooltip button with proper function slots
const createTooltipButton = (icon: string, tooltip: string, onClick: (e: MouseEvent) => void, color = 'neutral') => {
  
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

function handleRowClick(row: any) {
  router.push(`/battles/${row.original.id}/results`);
}

const emptyState = () => {
  return h('div', { class: 'flex flex-col items-center justify-center py-16' }, [
    h('div', { class: 'text-6xl mb-6' }, h(UIcon, { name: 'i-ph-empty', size: 'xl' })),
    h('h3', { class: 'text-xl mb-2' }, 'No battles found'),
    h('p', { class: 'text-center opacity-80 mb-6 max-w-md' }, 
      'Create your first battle to start gathering feedback on which title options resonate the most with your audience.'
    ),
    h(UButton, {
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
        loading-color="secondary"
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
  </div>
</template>
